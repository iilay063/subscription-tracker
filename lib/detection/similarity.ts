import type { DetectedSubscription } from "./types";

export const MATCH_THRESHOLD = 0.8;

/** Collapse near-duplicate detections (e.g. several Netflix receipts). */
export function dedupeDetections(
  items: DetectedSubscription[],
): DetectedSubscription[] {
  const confidenceRank = { high: 3, medium: 2, low: 1 } as const;
  const kept: DetectedSubscription[] = [];

  for (const item of items) {
    const norm = normalize(item.name);
    const matchIdx = kept.findIndex(
      (k) => diceCoefficient(normalize(k.name), norm) >= MATCH_THRESHOLD,
    );
    if (matchIdx === -1) {
      kept.push(item);
      continue;
    }
    // Keep the higher-confidence detection for the same service.
    if (
      confidenceRank[item.confidence] > confidenceRank[kept[matchIdx].confidence]
    ) {
      kept[matchIdx] = item;
    }
  }
  return kept;
}

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Dice coefficient over character bigrams. O(n), good for short names. */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const count = bigrams.get(bg) ?? 0;
    if (count > 0) {
      intersection++;
      bigrams.set(bg, count - 1);
    }
  }
  return (2 * intersection) / (a.length + b.length - 2);
}
