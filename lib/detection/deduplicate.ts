import { listActiveSubscriptionsForUser } from "@/lib/db/subscriptions";
import type { DedupeCandidate, DetectedSubscription } from "./types";
import { diceCoefficient, normalize, MATCH_THRESHOLD } from "./similarity";

export { dedupeDetections, diceCoefficient } from "./similarity";

/**
 * Pair each detected subscription with the most similar existing active
 * subscription (if similarity >= threshold). The threshold is conservative:
 * we'd rather show a possible duplicate the user can dismiss than silently
 * miss a separate subscription (e.g. a second family-plan seat).
 */
export async function matchAgainstExisting(
  userId: string,
  detected: DetectedSubscription[],
): Promise<DedupeCandidate[]> {
  const existing = await listActiveSubscriptionsForUser(userId);

  return detected.map((d) => {
    const target = normalize(d.name);
    let best: DedupeCandidate["existingMatch"] = null;
    let bestScore = 0;

    for (const { sub } of existing) {
      const score = diceCoefficient(target, normalize(sub.name));
      if (score > bestScore && score >= MATCH_THRESHOLD) {
        bestScore = score;
        best = {
          id: sub.id,
          name: sub.name,
          cost: Number(sub.cost),
          currency: sub.currency,
        };
      }
    }
    return { detected: d, existingMatch: best };
  });
}
