import { NextResponse } from "next/server";
import {
  listAllActiveSubscriptionsWithUser,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { insertBillingRow } from "@/lib/db/billing-history";
import { catchUpBillingDate } from "@/lib/billing/dates";
import { convert } from "@/lib/external/currency";
import { round2 } from "@/lib/money";
import { getDate } from "date-fns";

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
  const all = await listAllActiveSubscriptionsWithUser();
  let processed = 0;
  let billings = 0;
  let errors = 0;

  for (const sub of all) {
    if (sub.nextBillingDate > now) continue;
    processed++;

    const userCurrency = sub.user?.preferredCurrency ?? "USD";
    const anchor = getDate(sub.startedAt);

    try {
      const { next, ticks } = catchUpBillingDate(
        sub.nextBillingDate,
        now,
        { cycle: sub.billingCycle, customDays: sub.customDays },
        anchor,
      );

      for (const tick of ticks) {
        const cost = Number(sub.cost);
        const { rate, amount } = await convert(cost, sub.currency, userCurrency);
        await insertBillingRow({
          subscriptionId: sub.id,
          amount: cost.toFixed(2),
          currency: sub.currency,
          amountInUserCurrency: round2(amount).toFixed(2),
          userCurrency,
          exchangeRate: rate.toString(),
          billedAt: tick,
        });
        billings++;
      }

      await updateSubscription(sub.id, sub.userId, { nextBillingDate: next });
    } catch (e) {
      errors++;
      console.error("billing-tick error for sub", sub.id, e);
    }
  }

  return NextResponse.json({ ok: true, processed, billings, errors });
}
