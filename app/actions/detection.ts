"use server";

import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { requireUser } from "@/lib/auth-helpers";
import {
  getValidGmailToken,
  listBillingEmails,
  fetchEmailContext,
  formatEmailForLLM,
} from "@/lib/external/gmail";
import {
  extractFromText,
  extractFromFile,
  type ReceiptMediaType,
} from "@/lib/detection/extract";
import {
  matchAgainstExisting,
  dedupeDetections,
} from "@/lib/detection/deduplicate";
import { createSubscription, updateSubscription } from "@/lib/db/subscriptions";
import { updateGmailLastScannedAt } from "@/lib/db/users";
import type {
  ScanResult,
  DetectedSubscription,
  DeduplicationResolution,
} from "@/lib/detection/types";

const ACCEPTED_TYPES: ReceiptMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Flow 1 — scan the user's Gmail inbox for subscription receipts. */
export async function scanGmailAction(): Promise<ScanResult> {
  const user = await requireUser();

  const token = await getValidGmailToken(user.id);
  if (!token.granted) {
    if (token.reason === "scope_missing" || token.reason === "no_account") {
      return { ok: false, candidates: [], scopeMissing: true };
    }
    return {
      ok: false,
      candidates: [],
      error: "Your Google session expired. Please sign in again.",
      scopeMissing: true,
    };
  }

  try {
    const messages = await listBillingEmails(token.accessToken, 200);

    // Cap per-sender to limit Claude spend while keeping enough messages to
    // catch the actual receipt rather than the welcome / marketing email
    // that may come in first. Gmail returns newest-first; keeping the two
    // most recent per sender preserves the latest charge per service.
    const MAX_PER_SENDER = 2;
    const perSenderCount = new Map<string, number>();
    const selected: string[] = [];
    for (const m of messages) {
      const key = senderKey(m.from);
      const n = perSenderCount.get(key) ?? 0;
      if (n >= MAX_PER_SENDER) continue;
      perSenderCount.set(key, n + 1);
      selected.push(m.id);
    }

    const results = await Promise.allSettled(
      selected.map(async (id) => {
        const ctx = await fetchEmailContext(token.accessToken, id);
        const text = formatEmailForLLM(ctx);
        return extractFromText(text);
      }),
    );

    const detected: DetectedSubscription[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") detected.push(...r.value);
    }

    const candidates = await matchAgainstExisting(
      user.id,
      dedupeDetections(detected),
    );
    await updateGmailLastScannedAt(user.id, new Date());
    return { ok: true, candidates };
  } catch (err) {
    return {
      ok: false,
      candidates: [],
      error: err instanceof Error ? err.message : "Gmail scan failed.",
    };
  }
}

/** Flow 2 — parse an uploaded receipt image or PDF. */
export async function uploadReceiptAction(
  _prev: ScanResult,
  formData: FormData,
): Promise<ScanResult> {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, candidates: [], error: "Please choose a file." };
  }
  if (!ACCEPTED_TYPES.includes(file.type as ReceiptMediaType)) {
    return {
      ok: false,
      candidates: [],
      error: "Unsupported file type. Use a PNG, JPG, WebP, GIF, or PDF.",
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, candidates: [], error: "File is larger than 5 MB." };
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const detected = await extractFromFile(
      base64,
      file.type as ReceiptMediaType,
    );
    if (detected.length === 0) {
      return {
        ok: false,
        candidates: [],
        error: "No subscription found in that receipt.",
      };
    }
    const candidates = await matchAgainstExisting(
      user.id,
      dedupeDetections(detected),
    );
    return { ok: true, candidates };
  } catch (err) {
    return {
      ok: false,
      candidates: [],
      error: err instanceof Error ? err.message : "Could not read the receipt.",
    };
  }
}

/** Commit the user's review decisions. The only path that writes to the DB. */
export async function confirmDetectedAction(
  resolutions: Array<{
    detected: DetectedSubscription;
    resolution: DeduplicationResolution;
  }>,
): Promise<{ ok: boolean; added: number; updated: number; error?: string }> {
  const user = await requireUser();
  let added = 0;
  let updated = 0;

  try {
    for (const { detected, resolution } of resolutions) {
      if (resolution.action === "skip") continue;

      if (resolution.action === "update_price") {
        await updateSubscription(resolution.existingId, user.id, {
          cost: detected.cost.toFixed(2),
          currency: detected.currency,
        });
        updated++;
        continue;
      }

      // "add" and "duplicate" both create a new subscription. "duplicate"
      // intentionally creates a second row for the same service (family plan).
      await createSubscription({
        userId: user.id,
        categoryId: null,
        name: detected.name,
        cost: detected.cost.toFixed(2),
        currency: detected.currency,
        billingCycle: detected.billingCycle,
        customDays: detected.customDays,
        nextBillingDate: parseDate(detected.nextBillingDate),
      });
      added++;
    }
    revalidatePath("/dashboard");
    return { ok: true, added, updated };
  } catch (err) {
    return {
      ok: false,
      added,
      updated,
      error: err instanceof Error ? err.message : "Could not save changes.",
    };
  }
}

/**
 * Re-run Google sign-in to grant the Gmail scope. The `prompt: "consent"` in
 * the provider config ensures the consent screen (and a fresh refresh token)
 * is issued even for returning users.
 */
export async function reauthorizeGmailAction() {
  await signIn("google", { redirectTo: "/detect" });
}

function parseDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Normalize a "From" header down to the email address for sender dedupe. */
function senderKey(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).toLowerCase().trim();
}
