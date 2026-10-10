import { clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

// Turns a Clerk user object (from the API or from a webhook payload) into our User fields.
export function profileFromClerkUser(u) {
  // The REST API uses camelCase, webhook payloads use snake_case; support both.
  const emails = u.emailAddresses ?? u.email_addresses ?? [];
  const primaryId = u.primaryEmailAddressId ?? u.primary_email_address_id;

  const email =
    emails.find((e) => e.id === primaryId)?.emailAddress ??
    emails.find((e) => e.id === primaryId)?.email_address ??
    emails[0]?.emailAddress ??
    emails[0]?.email_address;

  const first = u.firstName ?? u.first_name;
  const last = u.lastName ?? u.last_name;

  const fullName = [first, last].filter(Boolean).join(" ") || u.username || email?.split("@")[0] || "User";

  return {
    clerkId: u.id,
    email,
    fullName,
    profilePic: u.imageUrl ?? u.image_url ?? "",
  };
}

export async function upsertUserFromClerk(u) {
  const profile = profileFromClerkUser(u);
  if (!profile.email) throw new Error("Clerk user has no email address");

  return User.findOneAndUpdate({ clerkId: profile.clerkId }, profile, {
    returnDocument: "after",
    upsert: true,
    setDefaultsOnInsert: true,
  });
}

// Used on first login when the Clerk webhook has not arrived (or is not configured yet).
export async function syncUserFromClerkId(clerkId) {
  const clerkUser = await clerkClient.users.getUser(clerkId);
  return upsertUserFromClerk(clerkUser);
}
