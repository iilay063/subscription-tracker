import { db } from "./index";
import { reminderLog } from "./schema";
import { and, eq } from "drizzle-orm";

export async function logReminder(input: {
  subscriptionId: string;
  forBillingDate: Date;
  success: boolean;
  errorMessage?: string | null;
}) {
  const [row] = await db
    .insert(reminderLog)
    .values({
      subscriptionId: input.subscriptionId,
      forBillingDate: input.forBillingDate,
      success: input.success,
      errorMessage: input.errorMessage ?? null,
      channel: "email",
    })
    .returning();
  return row;
}

export async function reminderAlreadySent(
  subscriptionId: string,
  forBillingDate: Date,
) {
  const rows = await db
    .select()
    .from(reminderLog)
    .where(
      and(
        eq(reminderLog.subscriptionId, subscriptionId),
        eq(reminderLog.forBillingDate, forBillingDate),
        eq(reminderLog.success, true),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
