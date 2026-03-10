import { PubSub } from "graphql-subscriptions";

/**
 * In-memory PubSub for GraphQL subscriptions.
 *
 * For multi-process deployments (e.g. multiple Heroku dynos), swap this for
 * a Redis-backed PubSub such as `graphql-redis-subscriptions`. The event
 * constant names below remain stable regardless of the implementation.
 */
export const pubsub = new PubSub();

// ── Event name constants ───────────────────────────────────────────────────
// Clients filter on assignmentId/campaignId server-side via withFilter, so a
// single topic per event type is enough rather than per-assignment channels.

/** Fired when a campaign contact's messageStatus changes. */
export const CONTACT_STATUS_CHANGED = "CONTACT_STATUS_CHANGED";

/** Fired when a campaign's script / interaction steps are updated by an admin. */
export const CAMPAIGN_SCRIPT_UPDATED = "CAMPAIGN_SCRIPT_UPDATED";
