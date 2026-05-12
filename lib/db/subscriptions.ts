import { db } from "./index";
import {
  subscriptions,
  type Subscription,
  type NewSubscription,
  billingHistory,
  categories,
} from "./schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";

export async function listSubscriptionsForUser(userId: string) {
  return db
    .select({
      sub: subscriptions,
      category: categories,
    })
    .from(subscriptions)
    .leftJoin(categories, eq(categories.id, subscriptions.categoryId))
    .where(eq(subscriptions.userId, userId))
    .orderBy(asc(subscriptions.nextBillingDate));
}

export async function listActiveSubscriptionsForUser(userId: string) {
  return db
    .select({
      sub: subscriptions,
      category: categories,
    })
    .from(subscriptions)
    .leftJoin(categories, eq(categories.id, subscriptions.categoryId))
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)),
    )
    .orderBy(asc(subscriptions.nextBillingDate));
}

export async function listCancelledSubscriptionsForUser(userId: string) {
  return db
    .select({
      sub: subscriptions,
      category: categories,
      totalPaid: sql<string>`COALESCE((
        SELECT SUM(${billingHistory.amountInUserCurrency})
        FROM ${billingHistory}
        WHERE ${billingHistory.subscriptionId} = ${subscriptions.id}
      ), 0)`.as("total_paid"),
    })
    .from(subscriptions)
    .leftJoin(categories, eq(categories.id, subscriptions.categoryId))
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, false)),
    )
    .orderBy(asc(subscriptions.cancelledAt));
}

export async function getSubscriptionById(id: string, userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createSubscription(input: NewSubscription) {
  const [row] = await db.insert(subscriptions).values(input).returning();
  return row;
}

export async function updateSubscription(
  id: string,
  userId: string,
  patch: Partial<NewSubscription>,
) {
  const [row] = await db
    .update(subscriptions)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();
  return row;
}

export async function cancelSubscription(id: string, userId: string) {
  const [row] = await db
    .update(subscriptions)
    .set({ isActive: false, cancelledAt: new Date(), updatedAt: new Date() })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();
  return row;
}

export async function reactivateSubscription(id: string, userId: string) {
  const [row] = await db
    .update(subscriptions)
    .set({ isActive: true, cancelledAt: null, updatedAt: new Date() })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();
  return row;
}

export async function listUpcomingForUser(
  userId: string,
  from: Date,
  to: Date,
) {
  return db
    .select({ sub: subscriptions, category: categories })
    .from(subscriptions)
    .leftJoin(categories, eq(categories.id, subscriptions.categoryId))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true),
        gte(subscriptions.nextBillingDate, from),
        lte(subscriptions.nextBillingDate, to),
      ),
    )
    .orderBy(asc(subscriptions.nextBillingDate));
}

/** Used by crons — returns all active subs with their owner currency/lead. */
export async function listAllActiveSubscriptionsWithUser() {
  return db.query.subscriptions.findMany({
    where: (s, { eq }) => eq(s.isActive, true),
    with: { user: true, category: true },
  });
}

export type SubscriptionWithCategory = {
  sub: Subscription;
  category: typeof categories.$inferSelect | null;
};
