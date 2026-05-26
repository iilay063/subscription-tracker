import { db } from "./index";
import { billingHistory } from "./schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export async function insertBillingRow(input: {
  subscriptionId: string;
  amount: string;
  currency: string;
  amountInUserCurrency: string;
  userCurrency: string;
  exchangeRate: string;
  billedAt?: Date;
}) {
  const [row] = await db.insert(billingHistory).values(input).returning();
  return row;
}

export async function listBillingForSubscription(subscriptionId: string) {
  return db
    .select()
    .from(billingHistory)
    .where(eq(billingHistory.subscriptionId, subscriptionId))
    .orderBy(desc(billingHistory.billedAt));
}

/**
 * For each subscription id, return the two most recent billing amounts so
 * callers can detect a price change. Returns a Map keyed by subscriptionId.
 */
export async function getRecentBillingPairs(
  subscriptionIds: string[],
): Promise<Map<string, { latest: number; previous: number | null; latestAt: Date }>> {
  const result = new Map<
    string,
    { latest: number; previous: number | null; latestAt: Date }
  >();
  if (subscriptionIds.length === 0) return result;

  const rows = await db
    .select({
      subscriptionId: billingHistory.subscriptionId,
      amount: billingHistory.amount,
      billedAt: billingHistory.billedAt,
      rn: sql<number>`row_number() over (partition by ${billingHistory.subscriptionId} order by ${billingHistory.billedAt} desc)`.as(
        "rn",
      ),
    })
    .from(billingHistory)
    .where(inArray(billingHistory.subscriptionId, subscriptionIds));

  // Two passes so order of arrival from the driver doesn't matter.
  const filtered = rows.filter((r) => Number(r.rn) <= 2);
  for (const r of filtered) {
    if (Number(r.rn) !== 1) continue;
    result.set(r.subscriptionId, {
      latest: Number(r.amount),
      previous: null,
      latestAt: r.billedAt,
    });
  }
  for (const r of filtered) {
    if (Number(r.rn) !== 2) continue;
    const existing = result.get(r.subscriptionId);
    if (existing) existing.previous = Number(r.amount);
  }
  return result;
}
