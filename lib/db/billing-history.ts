import { db } from "./index";
import { billingHistory } from "./schema";
import { desc, eq } from "drizzle-orm";

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
