import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, SCAN_MODEL, RECEIPT_MODEL } from "@/lib/external/claude";
import type { DetectedSubscription } from "./types";
import type { BillingCycle } from "@/lib/db/schema";

const CYCLES: BillingCycle[] = ["monthly", "yearly", "weekly", "custom_days"];

const SYSTEM_PROMPT = `You are a subscription receipt parser for a tracker app. Your job is to find subscriptions and memberships the user is paying for. A human will review every result, so favor RECALL over precision: when in doubt, include it.

WHAT TO INCLUDE (recurring, periodic, or auto-renewing charges):
- Streaming, music, gaming, software, news, productivity, AI, cloud, hosting, insurance, utilities, gym, dating apps, VPNs, cloud storage, etc.
- Anything labeled "subscription", "membership", "plan", "premium", "pro", "plus", "annual pass", "monthly pass", "auto-renew", "renewal", "recurring".
- Annual or monthly membership receipts even when the email is titled "order confirmation", "thank you for your purchase", "welcome to ...", or "your account has been charged" — these are very common framings for genuine subscriptions (Ancestry, NYT, Patreon, Costco, AAA, etc.).
- Receipts that show "next charge", "next billing date", or "your plan renews on …".
- Free trials that will auto-convert (include with their post-trial price if stated).

WHAT TO EXCLUDE (one-time):
- Physical goods (Amazon merchandise, electronics, clothes, groceries).
- Rides (Uber/Lyft), single restaurant orders (DoorDash one-off), single flight/hotel bookings.
- Donations and charity receipts (unless they're explicitly recurring).
- One-time app purchases (not in-app subscriptions).
- Refunds, password-reset / 2FA codes, marketing newsletters with no charge.

FIELD RULES:
- name: the service / brand, not the email sender. "Ancestry", not "Ancestry Customer Service". Trim "Inc.", "LLC", "Receipt from", etc.
- cost: total amount charged for the current billing period (number, no currency symbol). Use the post-discount actual amount.
- currency: ISO 4217 3-letter code. "$" with no other hint → USD; "£" → GBP; "€" → EUR; "₪" → ILS; "¥" → JPY.
- billing_cycle: "monthly" (~30d), "yearly" (~365d), "weekly" (~7d), or "custom_days" with the day count. If unclear but amount is annual-shaped (≥ $50 in one charge with no "monthly" hint), default to "yearly". Otherwise default to "monthly".
- next_billing_date (YYYY-MM-DD): the explicitly stated next charge / renewal date. If only the current charge date is given, add one billing cycle to it. If neither is given, use today.
- custom_days: integer when billing_cycle="custom_days"; null otherwise.
- confidence: "high" if name + amount + date are all stated; "medium" if one is inferred; "low" if two+ are inferred or if you're unsure whether it's recurring at all.
- source_note: a 1-4 word source hint, e.g. "Ancestry order confirmation".

OUTPUT FORMAT — ONLY a JSON array, no prose, no markdown fences:
[{"name":"Ancestry","cost":99.00,"currency":"USD","billing_cycle":"yearly","custom_days":null,"next_billing_date":"2027-05-14","confidence":"medium","source_note":"Ancestry order confirmation"}]

If the content is clearly NOT billing-related at all (a password reset, a marketing newsletter, a social notification), return [].`;

const MAX_INPUT_CHARS = 12000;

export async function extractFromText(
  text: string,
  model: string = SCAN_MODEL,
): Promise<DetectedSubscription[]> {
  if (!text.trim()) return [];
  const client = anthropic();
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text.slice(0, MAX_INPUT_CHARS) }],
  });
  return parseResponse(message.content);
}

export type ReceiptMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "application/pdf";

export async function extractFromFile(
  base64Data: string,
  mediaType: ReceiptMediaType,
): Promise<DetectedSubscription[]> {
  const client = anthropic();
  const sourceBlock =
    mediaType === "application/pdf"
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: base64Data,
          },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64Data,
          },
        };

  const message = await client.messages.create({
    model: RECEIPT_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          sourceBlock,
          {
            type: "text",
            text: "Extract subscription billing information from this receipt.",
          },
        ],
      },
    ],
  });
  return parseResponse(message.content);
}

function parseResponse(content: Anthropic.ContentBlock[]): DetectedSubscription[] {
  const textBlock = content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map(mapRaw)
    .filter((d): d is DetectedSubscription => d !== null);
}

function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function mapRaw(raw: unknown): DetectedSubscription | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string" || typeof r.cost !== "number") return null;

  const cycle = CYCLES.includes(r.billing_cycle as BillingCycle)
    ? (r.billing_cycle as BillingCycle)
    : "monthly";
  const confidence = ["high", "medium", "low"].includes(String(r.confidence))
    ? (r.confidence as DetectedSubscription["confidence"])
    : "low";

  return {
    name: r.name.trim(),
    cost: Number(r.cost),
    currency: String(r.currency ?? "USD").toUpperCase().slice(0, 3),
    billingCycle: cycle,
    customDays:
      cycle === "custom_days" && typeof r.custom_days === "number"
        ? r.custom_days
        : null,
    nextBillingDate:
      typeof r.next_billing_date === "string"
        ? r.next_billing_date
        : new Date().toISOString().slice(0, 10),
    confidence,
    sourceNote:
      typeof r.source_note === "string" ? r.source_note : undefined,
  };
}
