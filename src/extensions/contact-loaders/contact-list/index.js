import { finalizeContactLoad } from "../helpers";
import { r } from "../../../server/models";
import { getFormattedPhoneNumber } from "../../../lib";

export const name = "contact-list";

export function displayName() {
  return "Contact List";
}

export function serverAdministratorInstructions() {
  return {
    environmentVariables: [],
    description: "Load contacts from a saved contact list",
    setupInstructions:
      "Add 'contact-list' to CONTACT_LOADERS environment variable"
  };
}

export async function available(organization, user) {
  // Check if the organization has any contact lists
  const count = await r
    .knex("contact_list")
    .where("organization_id", organization.id)
    .count("* as count")
    .first();

  return {
    result: count && count.count > 0,
    expiresSeconds: 60
  };
}

export function addServerEndpoints(expressApp) {
  return;
}

export function clientChoiceDataCacheKey(organization, campaign, user) {
  return "";
}

export async function getClientChoiceData(organization, campaign, user) {
  const contactLists = await r
    .knex("contact_list")
    .where("organization_id", organization.id)
    .orderBy("created_at", "desc")
    .select("id", "name", "contact_count", "created_at");

  return {
    data: JSON.stringify({
      contactLists: contactLists.map(cl => ({
        id: cl.id,
        name: cl.name,
        contactCount: cl.contact_count,
        createdAt: cl.created_at
      }))
    }),
    expiresSeconds: 30
  };
}

export async function processContactLoad(job, maxContacts, organization) {
  const payload = JSON.parse(job.payload);
  const contactListId = payload.contactListId;

  if (!contactListId) {
    throw new Error("No contact list selected");
  }

  // Load entries from the contact list
  const entries = await r
    .knex("contact_list_entry")
    .where("contact_list_id", contactListId)
    .select("*");

  const contactList = await r
    .knex("contact_list")
    .where("id", contactListId)
    .first();

  const contacts = entries.map(entry => {
    const customFields = entry.custom_fields
      ? typeof entry.custom_fields === "string"
        ? JSON.parse(entry.custom_fields)
        : entry.custom_fields
      : {};

    return {
      first_name: entry.first_name || "",
      last_name: entry.last_name || "",
      cell: getFormattedPhoneNumber(
        entry.cell,
        process.env.PHONE_NUMBER_COUNTRY || "US"
      ),
      zip: entry.zip || "",
      external_id: entry.external_id || "",
      custom_fields: JSON.stringify(customFields)
    };
  });

  // Filter out contacts with invalid phone numbers
  const validContacts = contacts.filter(c => !!c.cell);

  await finalizeContactLoad(
    job,
    validContacts,
    maxContacts,
    null,
    JSON.stringify({ contactListId, contactListName: contactList.name })
  );
}
