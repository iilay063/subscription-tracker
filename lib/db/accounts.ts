import { db } from "./index";
import { accounts } from "./schema";
import { and, eq } from "drizzle-orm";

/** Fetch the user's stored Google OAuth tokens from the Auth.js account row. */
export async function getGoogleAccount(userId: string) {
  const rows = await db
    .select({
      accessToken: accounts.access_token,
      refreshToken: accounts.refresh_token,
      expiresAt: accounts.expires_at,
      scope: accounts.scope,
    })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")))
    .limit(1);
  return rows[0] ?? null;
}

/** Persist a refreshed access token back to the account row. */
export async function updateGoogleAccessToken(
  userId: string,
  accessToken: string,
  expiresAt: number,
) {
  await db
    .update(accounts)
    .set({ access_token: accessToken, expires_at: expiresAt })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));
}
