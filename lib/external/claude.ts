import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey: key });
  return _client;
}

// Cheap model for batch Gmail scanning (many calls per scan); accurate model
// for single-shot receipt/upload parsing where the user is waiting.
export const SCAN_MODEL = "claude-haiku-4-5-20251001";
export const RECEIPT_MODEL = "claude-sonnet-4-6";
