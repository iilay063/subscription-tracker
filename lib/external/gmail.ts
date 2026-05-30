import "server-only";
import {
  getGoogleAccount,
  updateGoogleAccessToken,
} from "@/lib/db/accounts";

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export type GmailTokenResult =
  | { granted: true; accessToken: string }
  | {
      granted: false;
      reason: "no_account" | "scope_missing" | "token_expired_no_refresh";
    };

/**
 * Returns a valid Gmail access token, refreshing it if necessary. Never throws
 * for scope/token problems — callers branch on `granted` to surface a
 * "re-authorize" prompt instead of crashing.
 */
export async function getValidGmailToken(
  userId: string,
): Promise<GmailTokenResult> {
  const account = await getGoogleAccount(userId);
  if (!account) return { granted: false, reason: "no_account" };

  const scopes = account.scope?.split(" ") ?? [];
  if (!scopes.includes(GMAIL_SCOPE)) {
    return { granted: false, reason: "scope_missing" };
  }

  const nowSecs = Math.floor(Date.now() / 1000);
  const bufferSecs = 60;
  if (account.accessToken && account.expiresAt && account.expiresAt > nowSecs + bufferSecs) {
    return { granted: true, accessToken: account.accessToken };
  }

  // Token expired (or about to) — refresh it.
  if (!account.refreshToken) {
    return { granted: false, reason: "token_expired_no_refresh" };
  }
  const refreshed = await refreshGoogleToken(account.refreshToken);
  const newExpiry = Math.floor(Date.now() / 1000) + refreshed.expires_in;
  await updateGoogleAccessToken(userId, refreshed.access_token, newExpiry);
  return { granted: true, accessToken: refreshed.access_token };
}

async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status}`);
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

export type GmailMessageRef = { id: string; from: string };

/**
 * List recent billing/receipt emails (last 90 days). Returns message IDs plus
 * the sender so callers can dedupe by sender before spending Claude tokens.
 */
export async function listBillingEmails(
  accessToken: string,
  maxResults = 50,
): Promise<GmailMessageRef[]> {
  const q =
    'newer_than:90d subject:(receipt OR invoice OR subscription OR billing OR "payment confirmation" OR renewed OR "your plan")';
  const url =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages` +
    `?maxResults=${maxResults}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail list failed: ${res.status}`);
  const data = (await res.json()) as { messages?: { id: string }[] };
  const ids = (data.messages ?? []).map((m) => m.id);

  // Fetch sender headers (cheap metadata format) so we can dedupe by sender.
  const refs = await Promise.all(
    ids.map(async (id) => {
      const from = await fetchSender(accessToken, id);
      return { id, from };
    }),
  );
  return refs;
}

async function fetchSender(accessToken: string, id: string): Promise<string> {
  const url =
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
    `?format=metadata&metadataHeaders=From`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "";
  const data = (await res.json()) as {
    payload?: { headers?: { name: string; value: string }[] };
  };
  const header = data.payload?.headers?.find(
    (h) => h.name.toLowerCase() === "from",
  );
  return header?.value ?? "";
}

/** Fetch the plain-text (or HTML fallback) body of a single message. */
export async function fetchEmailBody(
  accessToken: string,
  messageId: string,
): Promise<string> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail fetch failed: ${res.status}`);
  const data = (await res.json()) as { payload?: GmailPayload };
  return extractText(data.payload);
}

type GmailPayload = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPayload[];
};

function extractText(payload: GmailPayload | undefined): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    // Prefer text/plain, then fall back to the first part that yields text.
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const text = extractText(part);
      if (text) return text;
    }
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return stripHtml(decodeBase64Url(payload.body.data));
  }
  return "";
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
