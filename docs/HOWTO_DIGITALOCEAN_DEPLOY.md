# Deploying Spoke on a DigitalOcean Droplet

This guide walks through deploying Spoke on a fresh Ubuntu droplet from scratch.

## Prerequisites

- A DigitalOcean account
- A domain name (optional but recommended for HTTPS)
- An Auth0 account (if using Auth0 authentication) or plan to use local auth

---

## Step 1: Create the Droplet

1. Log in to DigitalOcean and click **Create > Droplets**
2. Choose **Ubuntu 24.04 LTS**
3. Select a plan:
   - **Minimum**: 2 GB RAM / 1 vCPU ($12/mo) — suitable for small teams
   - **Recommended**: 4 GB RAM / 2 vCPU ($24/mo) — comfortable for production
4. Choose a datacenter region close to your users
5. Add your SSH key under **Authentication**
6. Click **Create Droplet**

---

## Step 2: Initial Server Setup

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Create a non-root user and set up the firewall:

```bash
# Create a deploy user
adduser spoke
usermod -aG sudo spoke

# Set up firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# Switch to the new user
su - spoke
```

---

## Step 3: Install Node.js

```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version   # Should be >= 20.11.1
npm --version
```

---

## Step 4: Install PostgreSQL

```bash
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create the database and user
sudo -u postgres psql <<EOF
CREATE USER spoke WITH PASSWORD 'YOUR_SECURE_DB_PASSWORD';
CREATE DATABASE spoke OWNER spoke;
GRANT ALL PRIVILEGES ON DATABASE spoke TO spoke;
EOF
```

Replace `YOUR_SECURE_DB_PASSWORD` with a strong password.

---

## Step 5: Install Redis (Optional but Recommended)

Redis significantly improves texter screen performance.

```bash
sudo apt-get install -y redis-server

# Configure Redis to run as a service
sudo sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
sudo systemctl restart redis
sudo systemctl enable redis

# Verify
redis-cli ping   # Should return PONG
```

---

## Step 6: Clone and Build Spoke

```bash
cd /home/spoke

# Clone the repository
git clone https://github.com/YOUR_ORG/Spoke.git spoke-app
cd spoke-app

# Checkout the branch you want to deploy
git checkout refactor

# Install dependencies
npm install

# Build for production
NODE_ENV=production npm run prod-build
```

The build creates:
- `./build/server/` — transpiled server code
- `./build/client/assets/` — webpack client bundle

---

## Step 7: Configure Environment Variables

Create an environment file:

```bash
cat > /home/spoke/spoke-app/.env <<'EOF'
# Core
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com

# Session (generate a random secret)
SESSION_SECRET=GENERATE_A_RANDOM_64_CHAR_STRING

# Database
DB_TYPE=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spoke
DB_USER=spoke
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD
DB_MIN_POOL=2
DB_MAX_POOL=10

# Redis (if installed)
REDIS_URL=redis://localhost:6379/0
REDIS_CONTACT_CACHE=1

# Authentication — choose one:
# Option A: Local auth (simpler, no external service needed)
PASSPORT_STRATEGY=local

# Option B: Auth0 (uncomment and fill in)
# PASSPORT_STRATEGY=auth0
# AUTH0_DOMAIN=your-tenant.auth0.com
# AUTH0_CLIENT_ID=your_client_id
# AUTH0_CLIENT_SECRET=your_client_secret

# SMS — use fakeservice for testing, twilio for production
DEFAULT_SERVICE=fakeservice
# TWILIO_ACCOUNT_SID=your_sid
# TWILIO_AUTH_TOKEN=your_token
# TWILIO_MESSAGE_SERVICE_SID=your_service_sid

# Run background jobs in the same process (simplifies deployment)
JOBS_SAME_PROCESS=1

# Phone number country
PHONE_NUMBER_COUNTRY=US

# Assets
ASSETS_DIR=./build/client/assets
ASSETS_MAP_FILE=assets.json
EOF
```

Generate a random session secret:

```bash
openssl rand -hex 32
```

If using Auth0, configure the callback URL in your Auth0 dashboard:
- **Allowed Callback URLs**: `https://your-domain.com/login-callback`
- **Allowed Logout URLs**: `https://your-domain.com`

---

## Step 8: Run Database Migrations

```bash
cd /home/spoke/spoke-app

# Source the env file for the migration command
set -a && source .env && set +a

# Run migrations
npx knex --knexfile ./knexfile.env.js migrate:latest
```

---

## Step 9: Set Up PM2 Process Manager

PM2 keeps Spoke running and restarts it on crashes or server reboots.

```bash
sudo npm install -g pm2

# Create PM2 config
cat > /home/spoke/spoke-app/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: "spoke",
    script: "./build/server/server/index.js",
    cwd: "/home/spoke/spoke-app",
    env_file: "/home/spoke/spoke-app/.env",
    env: {
      NODE_ENV: "production"
    },
    instances: 1,
    max_memory_restart: "500M",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Start Spoke
set -a && source .env && set +a
pm2 start ecosystem.config.js

# Verify it's running
pm2 status
pm2 logs spoke --lines 20

# Save PM2 process list and set up startup script
pm2 save
pm2 startup systemd -u spoke --hp /home/spoke
# Run the command PM2 outputs (it will ask you to run a sudo command)
```

At this point Spoke should be running on port 3000. Test it:

```bash
curl http://localhost:3000
```

---

## Step 10: Set Up Nginx Reverse Proxy

Nginx handles HTTPS termination and proxies requests to Spoke.

```bash
sudo apt-get install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/spoke <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        client_max_body_size 50M;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/spoke /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 11: Set Up HTTPS with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Certbot auto-renews via systemd timer. Verify:
sudo systemctl status certbot.timer
```

After this, your `.env` `BASE_URL` should use `https://your-domain.com`.

---

## Step 12: Create Your First Admin User

### If using local auth:

1. Visit `https://your-domain.com/login`
2. Sign up with your email and password
3. The first user created (id=1) is automatically a superadmin

### If using Auth0:

1. Visit `https://your-domain.com`
2. Log in via Auth0
3. The first user is automatically a superadmin

---

## Updating Spoke

To deploy updates:

```bash
cd /home/spoke/spoke-app
git pull origin refactor
npm install
NODE_ENV=production npm run prod-build
set -a && source .env && set +a
npx knex --knexfile ./knexfile.env.js migrate:latest
pm2 restart spoke
```

---

## Troubleshooting

**Check logs:**
```bash
pm2 logs spoke --lines 50
```

**Check if the port is in use:**
```bash
sudo lsof -i :3000
```

**Database connection issues:**
```bash
# Test the connection
PGPASSWORD=YOUR_SECURE_DB_PASSWORD psql -U spoke -h localhost -d spoke -c "SELECT 1;"
```

**Redis connection issues:**
```bash
redis-cli ping
```

**Rebuild after dependency changes:**
```bash
rm -rf node_modules
npm install
NODE_ENV=production npm run prod-build
pm2 restart spoke
```

---

## Production Checklist

- [ ] Strong `SESSION_SECRET` set (not the default)
- [ ] PostgreSQL password is secure
- [ ] HTTPS enabled via Let's Encrypt
- [ ] `BASE_URL` uses `https://`
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] PM2 startup configured for reboots
- [ ] Redis installed for performance
- [ ] Database backups configured (see below)
- [ ] SMS service configured (Twilio) for production texting

## Database Backups

Set up automated daily backups:

```bash
# Create backup script
sudo mkdir -p /var/backups/spoke

cat > /home/spoke/backup-db.sh <<'SCRIPT'
#!/bin/bash
BACKUP_DIR=/var/backups/spoke
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=YOUR_SECURE_DB_PASSWORD pg_dump -U spoke -h localhost spoke | gzip > "$BACKUP_DIR/spoke_$TIMESTAMP.sql.gz"
# Keep only last 14 days
find "$BACKUP_DIR" -name "spoke_*.sql.gz" -mtime +14 -delete
SCRIPT

chmod +x /home/spoke/backup-db.sh

# Add to crontab (runs daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/spoke/backup-db.sh") | crontab -
```
