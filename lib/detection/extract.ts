import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, SCAN_MODEL, RECEIPT_MODEL } from "@/lib/external/claude";
import type { DetectedSubscription } from "./types";
import type { BillingCycle } from "@/lib/db/schema";

const CYCLES: BillingCycle[] = ["monthly", "yearly", "weekly", "custom_days"];

const SYSTEM_PROMPT = `You are a subscription receipt parser. Extract recurring subscription billing information from the provided content.

RULES:
1. Only extract information explicitly present in the content. Never infer or invent a service.
2. If the content is NOT a subscription receipt, invoice, or billing confirmation, return an empty array [].
3. Only extract RECURRING charges (subscriptions). Ignore one-time purchases.
4. billing_cycle: "monthly" (~30 days), "yearly" (~365 days), "weekly" (~7 days), or "custom_days" for an explicit non-standard interval. If custom_days, set "custom_days" to the integer number of days; otherwise null.
5. next_billing_date: the stated next charge / renewal date in YYYY-MM-DD. If only a charge date is given, add one billing cycle to it. If unknown, use today's date.
6. currency: ISO 4217 3-letter code (USD, EUR, GBP, ...). If only "$" appears with no other hint, use USD.
7. confidence: "high" if name + amount + date are all clearly stated; "medium" if one is inferred; "low" if two or more are inferred.
8. source_note: a 1-4 word summary of what the receipt says (e.g. "Netflix April receipt").

Return ONLY a JSON array, no prose and no markdown fences:
[{"name":"Netflix","cost":15.49,"currency":"USD","billing_cycle":"monthly","custom_days":null,"next_billing_date":"2026-06-15","confidence":"high","source_note":"Netflix receipt"}]`;

const MAX_INPUT_CHARS = 8000;

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
