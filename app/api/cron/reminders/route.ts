import { NextResponse } from "next/server";
import { addDays, startOfDay } from "date-fns";
import { listAllActiveSubscriptionsWithUser } from "@/lib/db/subscriptions";
import { logReminder, reminderAlreadySent } from "@/lib/db/reminder-log";
import { resend, FROM } from "@/lib/external/resend";
import { reminderEmail } from "@/lib/emails/reminder";
import { daysUntil } from "@/lib/billing/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
  if (header === `Bearer ${secret}`) return true;
  // Allow a query-string fallback for local testing.
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

export async function GET(req: Request) {
  if (!authorized(req)) return new NextResponse("Unauthorized", { status: 401 });

  const now = new Date();
  const today = startOfDay(now);
  const horizon = addDays(today, 30); // we'll filter per-user lead time
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const all = await listAllActiveSubscriptionsWithUser();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const sub of all) {
    const user = sub.user;
    if (!user?.email) {
      skipped++;
      continue;
    }
    const leadDays = user.reminderLeadDays ?? 3;
    const days = daysUntil(today, sub.nextBillingDate);
    if (days < 0 || days > leadDays) {
      skipped++;
      continue;
    }
    if (sub.nextBillingDate > horizon) {
      skipped++;
      continue;
    }
    if (await reminderAlreadySent(sub.id, sub.nextBillingDate)) {
      skipped++;
      continue;
    }

    const email = reminderEmail({
      userName: user.name ?? null,
      subscriptionName: sub.name,
      cost: Number(sub.cost),
      currency: sub.currency,
      daysUntil: days,
      nextBillingDate: sub.nextBillingDate,
      appUrl,
      subscriptionId: sub.id,
    });

    try {
      const { error } = await resend().emails.send({
        from: FROM,
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      if (error) {
        failed++;
        await logReminder({
          subscriptionId: sub.id,
          forBillingDate: sub.nextBillingDate,
          success: false,
          errorMessage: String(error.message ?? error),
        });
      } else {
        sent++;
        await logReminder({
          subscriptionId: sub.id,
          forBillingDate: sub.nextBillingDate,
          success: true,
        });
      }
    } catch (e) {
      failed++;
      await logReminder({
        subscriptionId: sub.id,
        forBillingDate: sub.nextBillingDate,
        success: false,
        errorMessage: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
