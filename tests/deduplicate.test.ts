import { describe, it, expect } from "vitest";
import {
  diceCoefficient,
  dedupeDetections,
} from "@/lib/detection/similarity";
import type { DetectedSubscription } from "@/lib/detection/types";

const sub = (
  name: string,
  cost: number,
  confidence: DetectedSubscription["confidence"] = "high",
): DetectedSubscription => ({
  name,
  cost,
  currency: "USD",
  billingCycle: "monthly",
  customDays: null,
  nextBillingDate: "2026-06-01",
  confidence,
});

describe("diceCoefficient", () => {
  it("is 1 for identical strings", () => {
    expect(diceCoefficient("netflix", "netflix")).toBe(1);
  });

  it("is 0 for completely different strings", () => {
    expect(diceCoefficient("netflix", "spotify")).toBeLessThan(0.3);
  });

  it("scores close variants highly", () => {
    expect(diceCoefficient("spotify", "spotifypremium")).toBeGreaterThan(0.6);
  });

  it("handles short strings without crashing", () => {
    expect(diceCoefficient("a", "b")).toBe(0);
    expect(diceCoefficient("", "")).toBe(1);
  });
});

describe("dedupeDetections", () => {
  it("collapses near-duplicate names, keeping highest confidence", () => {
    const out = dedupeDetections([
      sub("Netflix", 15.49, "low"),
      sub("netflix", 15.49, "high"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].confidence).toBe("high");
  });

  it("keeps genuinely different services separate", () => {
    const out = dedupeDetections([sub("Netflix", 15.49), sub("Spotify", 9.99)]);
    expect(out).toHaveLength(2);
  });

  it("keeps the first when confidence is equal", () => {
    const out = dedupeDetections([
      sub("Disney Plus", 7.99, "medium"),
      sub("disneyplus", 8.99, "medium"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].cost).toBe(7.99);
  });
});
