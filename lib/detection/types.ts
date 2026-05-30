import type { BillingCycle } from "@/lib/db/schema";

/** A subscription parsed out of a receipt/email by Claude. */
export type DetectedSubscription = {
  name: string;
  cost: number;
  currency: string; // ISO 4217, e.g. "USD"
  billingCycle: BillingCycle;
  customDays: number | null;
  nextBillingDate: string; // yyyy-MM-dd
  confidence: "high" | "medium" | "low";
  sourceNote?: string;
};

/** An existing subscription a detection might match. */
export type ExistingMatch = {
  id: string;
  name: string;
  cost: number;
  currency: string;
};

/** A detected subscription paired with its best existing match (if any). */
export type DedupeCandidate = {
  detected: DetectedSubscription;
  existingMatch: ExistingMatch | null;
};

/** The user's decision for a single candidate in the review UI. */
export type DeduplicationResolution =
  | { action: "add" }
  | { action: "update_price"; existingId: string }
  | { action: "duplicate" } // separate subscription, same service (e.g. family plan)
  | { action: "skip" };

export type ScanResult = {
  ok: boolean;
  candidates: DedupeCandidate[];
  error?: string;
  /** true → user hasn't granted Gmail scope; show the re-authorize prompt. */
  scopeMissing?: boolean;
};
