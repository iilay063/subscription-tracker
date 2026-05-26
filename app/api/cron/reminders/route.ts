import { NextResponse } from "next/server";
import { addDays, format, startOfDay } from "date-fns";
import { listAllActiveSubscriptionsWithUser } from "@/lib/db/subscriptions";
import { logReminder, reminderAlreadySent } from "@/lib/db/reminder-log";
import { setBudgetAlertSentForMonth } from "@/lib/db/users";
import { resend, FROM } from "@/lib/external/resend";
import { reminderEmail } from "@/lib/emails/reminder";
import { trialEndingEmail } from "@/lib/emails/trial-ending";
import { budgetAlertEmail } from "@/lib/emails/budget-alert";
import { daysUntil, monthlyEquivalent } from "@/lib/billing/dates";
import { convert } from "@/lib/external/currency";
import { round2 } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

export async function GET(req: Request) {
  if (!authorized(req)) return new NextResponse("Unauthorized", { status: 401 });

  const now = new Date();
  const today = startOfDay(now);
  const horizon = addDays(today, 30);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const currentMonth = format(now, "yyyy-MM");

  const all = await listAllActiveSubscriptionsWithUser();
  let renewalSent = 0;
  let trialSent = 0;
  let budgetSent = 0;
  let skipped = 0;
  let failed = 0;

  // Per-user accumulator for budget check.
  const perUser = new Map<
    string,
    {
      user: (typeof all)[number]["user"];
      monthlyTotal: number;
    }
  >();

  for (const sub of all) {
    const user = sub.user;
    if (!user?.email) {
      skipped++;
      continue;
    }
    const leadDays = sub.reminderLeadDaysOverride ?? user.reminderLeadDays ?? 3;
    const userCurrency = user.preferredCurrency ?? "USD";

    // ---- Accumulate monthly total for the budget check ----
    if (user.monthlyBudget) {
      try {
        const cost = Number(sub.cost);
        const converted =
          sub.currency === userCurrency
            ? cost
            : (await convert(cost, sub.currency, userCurrency)).amount;
        const monthly = monthlyEquivalent(
          converted,
          sub.billingCycle,
          sub.customDays,
        );
        const entry = perUser.get(user.id) ?? { user, monthlyTotal: 0 };
        entry.monthlyTotal += monthly;
        perUser.set(user.id, entry);
      } catch (e) {
        console.error("convert failed for budget tally", sub.id, e);
      }
    }

    // ---- Trial-ending reminder ----
    if (sub.isTrial && sub.trialEndsAt) {
      const trialDays = daysUntil(today, sub.trialEndsAt);
      if (trialDays >= 0 && trialDays <= leadDays && sub.trialEndsAt <= horizon) {
        if (await reminderAlreadySent(sub.id, sub.trialEndsAt, "trial_ending")) {
          skipped++;
        } else {
          const email = trialEndingEmail({
            userName: user.name ?? null,
            subscriptionName: sub.name,
            daysUntil: trialDays,
            trialEndsAt: sub.trialEndsAt,
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
                forBillingDate: sub.trialEndsAt,
                success: false,
                errorMessage: String(error.message ?? error),
                kind: "trial_ending",
              });
            } else {
              trialSent++;
              await logReminder({
                subscriptionId: sub.id,
                forBillingDate: sub.trialEndsAt,
                success: true,
                kind: "trial_ending",
              });
            }
          } catch (e) {
            failed++;
            await logReminder({
              subscriptionId: sub.id,
              forBillingDate: sub.trialEndsAt,
              success: false,
              errorMessage: e instanceof Error ? e.message : String(e),
              kind: "trial_ending",
            });
          }
        }
      }
    }

    // ---- Renewal reminder ----
    const days = daysUntil(today, sub.nextBillingDate);
    if (days < 0 || days > leadDays || sub.nextBillingDate > horizon) {
      skipped++;
      continue;
    }
    if (await reminderAlreadySent(sub.id, sub.nextBillingDate, "renewal")) {
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
          kind: "renewal",
        });
      } else {
        renewalSent++;
        await logReminder({
          subscriptionId: sub.id,
          forBillingDate: sub.nextBillingDate,
          success: true,
          kind: "renewal",
        });
      }
    } catch (e) {
      failed++;
      await logReminder({
        subscriptionId: sub.id,
        forBillingDate: sub.nextBillingDate,
        success: false,
        errorMessage: e instanceof Error ? e.message : String(e),
        kind: "renewal",
      });
    }
  }

  // ---- Budget alerts (once per user per month) ----
  for (const { user, monthlyTotal } of perUser.values()) {
    if (!user?.email || !user.monthlyBudget) continue;
    const budget = Number(user.monthlyBudget);
    if (budget <= 0) continue;
    const total = round2(monthlyTotal);
    if (total <= budget) continue;
    if (user.budgetAlertSentForMonth === currentMonth) continue;

    const email = budgetAlertEmail({
      userName: user.name ?? null,
      monthlyTotal: total,
      budget,
      currency: user.preferredCurrency ?? "USD",
      appUrl,
    });

    try {
      const { error } = await resend().emails.send({
        from: FROM,
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      if (!error) {
        budgetSent++;
        await setBudgetAlertSentForMonth(user.id, currentMonth);
      } else {
        failed++;
      }
    } catch (e) {
      failed++;
      console.error("budget alert send failed", user.id, e);
    }
  }

  return NextResponse.json({
    ok: true,
    renewalSent,
    trialSent,
    budgetSent,
    skipped,
    failed,
  });
}
