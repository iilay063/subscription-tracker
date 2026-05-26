import { db } from "./index";
import { reminderLog } from "./schema";
import { and, eq } from "drizzle-orm";

export type ReminderKind = "renewal" | "trial_ending" | "budget_alert";

export async function logReminder(input: {
  subscriptionId: string;
  forBillingDate: Date;
  success: boolean;
  errorMessage?: string | null;
  kind?: ReminderKind;
}) {
  const [row] = await db
    .insert(reminderLog)
    .values({
      subscriptionId: input.subscriptionId,
      forBillingDate: input.forBillingDate,
      success: input.success,
      errorMessage: input.errorMessage ?? null,
      channel: "email",
      kind: input.kind ?? "renewal",
    })
    .returning();
  return row;
}

export async function reminderAlreadySent(
  subscriptionId: string,
  forBillingDate: Date,
  kind: ReminderKind = "renewal",
) {
  const rows = await db
    .select()
    .from(reminderLog)
    .where(
      and(
        eq(reminderLog.subscriptionId, subscriptionId),
        eq(reminderLog.forBillingDate, forBillingDate),
        eq(reminderLog.kind, kind),
        eq(reminderLog.success, true),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
