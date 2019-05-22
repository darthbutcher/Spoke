[![Build Status](https://travis-ci.org/MoveOnOrg/Spoke.svg?branch=main)](https://travis-ci.org/MoveOnOrg/Spoke)

# Spoke

Spoke is an open source text-distribution tool for organizations to mobilize supporters and members into action. Spoke allows you to upload phone numbers, customize scripts and assign volunteers to communicate with supporters while allowing organizations to manage the process.

Spoke was created by Saikat Chakrabarti and Sheena Pakanati, and is now maintained by MoveOn.org.

The latest version is [2.0.0](https://github.com/MoveOnOrg/Spoke/tree/v2.0) (see [release notes](https://github.com/MoveOnOrg/Spoke/blob/main/docs/RELEASE_NOTES.md#v20)) which we recommend for production use, while our `main` branch is where features still in development and testing will be available.

## Note

This is generated from [react-apollo-starter-kit](https://github.com/saikat/react-apollo-starter-kit).  Look at that project's README for info on some of the libraries used.

## Deploy to Heroku

<a href="https://heroku.com/deploy?template=https://github.com/MoveOnOrg/Spoke/tree/v2.0">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

Follow up instructions located [here](https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO_HEROKU_DEPLOY.md)

Please let us know if you deployed by filling out this form [here](https://act.moveon.org/survey/tech/)

## Getting started

1. Install either sqlite (or another [knex](http://knexjs.org/#Installation-client)-supported database)
2. Install the Node version listed in `.nvmrc`. [NVM](https://github.com/creationix/nvm) is one way to do this:
    ```
    nvm install
    nvm use
    ```
3. `yarn install`
4. `cp .env.example .env`
5. [Fill out your newly created `.env` file.](https://github.com/MoveOnOrg/Spoke/blob/main/docs/REFERENCE-environment_variables.md)
6. Determine which database to use.
    - To use Postgres, [follow these instructions](https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO_USE_POSTGRESQL.md).
7. Spoke uses [Auth0](https://auth0.com) by default. However, for development, there are a few ways to bypass authentication.
    - To set up authentication, [follow these instructions](https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO-configure-auth0.md).
8. Run `yarn dev` to create and populate the tables.
    - Wait until you see both "Node app is running ..." and "webpack: Compiled successfully." before attempting to connect. (make sure environment variable `JOBS_SAME_PROCESS=1`)
9. Go to `http://localhost:3000` to load the app.
10. As long as you leave `SUPPRESS_SELF_INVITE=` blank in your `.env` you should be able to invite yourself from the homepage.
    - If you DO set that variable, then spoke will be invite-only and you'll need to generate an invite. Run:
      ```
      echo "INSERT INTO invite (hash,is_valid) VALUES ('abc', 1);" |sqlite3 mydb.sqlite
      # Note: When doing this with PostgreSQL, you would replace the `1` with `true`
      ```
    - Then use the generated key to visit an invite link, e.g.: http://localhost:3000/invite/abc. This should redirect you to the login screen. Use the "Sign Up" option to create your account.
11. You should then be prompted to create an organization. Create it.

If you want to create an invite via the home page "Login and get started" link, make sure your `SUPPRESS_SELF_INVITE` variable is not set.

## Getting started with Docker

1. `cp .env.example .env`
2. Follow [the Auth0 instructions](https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO-configure-auth0.md) to set up your [Auth0](https://auth0.com) account.
3. Build and run Spoke with `docker-compose up --build`
    - You can stop docker compose at any time with `CTRL+C`, and data will persist next time you run `docker-compose up`.
4. Go to [localhost:3000](http://localhost:3000) to load the app.
5. Follow Step 13 above.
    - But if you need to generate an invite, run:
      ```bash
      docker-compose exec postgres psql -U spoke -d spokedev -c "INSERT INTO invite (hash,is_valid) VALUES ('<your-hash>', true);"
      ```
    - Then use the generated key to visit an invite link, e.g.: `http://localhost:3000/invite/<your-hash>`. This should redirect you to the login screen. Use the "Sign Up" option to create your account.
6. You should then be prompted to create an organization. Create it.
7. When done testing, clean up resources with `docker-compose down`, or `docker-compose down -v` to **_completely destroy_** your Postgres database & Redis datastore volumes.

## Running Tests

See https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO-run_tests.md

## Big Thanks
Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com).

## Helpful Dev Tips
* Run `sqlite3 mydb.sqlite` to connect to a SQL shell for the dev database
* [Set up an ESLint plugin in your code editor so that you catch coding errors and follow code style guidelines more easily!](https://medium.com/planet-arkency/catch-mistakes-before-you-run-you-javascript-code-6e524c36f0c8#.oboqsse48)
* [Install the redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) in Chrome to get advanced Redux debugging features.
* Right now there is a bug in Apollo (https://github.com/apollostack/react-apollo/issues/57) that means in one particular case, errors get swallowed.  If you end up with an app that is silently breaking, console.log(this.props.data) and check the errors property.

### SMS

For development, you can set `DEFAULT_SERVICE=fakeservice` to skip using an SMS provider (Twilio or Nexmo) and insert the message directly into the database.

To simulate receiving a reply from a contact you can use the Send Replies utility: `http://localhost:3000/admin/1/campaigns/1/send-replies`, updating the app and campaign IDs as necessary.

**Twilio**

Twilio provides test credentials that will not charge your account as described in their [documentation](https://www.twilio.com/docs/iam/test-credentials). You may use either your test credentials or your live keys by following the instructions [here](https://github.com/MoveOnOrg/Spoke/blob/main/docs/HOWTO_INTEGRATE_TWILIO.md).

## Deploying

1. Run `OUTPUT_DIR=./build yarn run prod-build-server`
   This will generate something you can deploy to production in ./build and run nodejs server/server/index.js
2. Run `yarn run prod-build-client`
3. Make a copy of `deploy/spoke-pm2.config.js.template`, e.g. `spoke-pm2.config.js`, add missing environment variables, and run it with [pm2](https://www.npmjs.com/package/pm2), e.g. `pm2 start spoke-pm2.config.js --env production`
4. [Install PostgreSQL](https://wiki.postgresql.org/wiki/Detailed_installation_guides)
5. Start PostgreSQL (e.g. `sudo /etc/init.d/postgresql start`), connect (e.g. `sudo -u postgres psql`), create a user and database (e.g. `create user spoke password 'spoke'; create database spoke owner spoke;`), disconnect (e.g. `\q`) and add credentials to `DB_` variables in spoke-pm2.config.js

# License
Spoke is licensed under the MIT license.
