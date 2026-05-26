import { auth } from "@/auth";
import { listSubscriptionsForUser } from "@/lib/db/subscriptions";
import { format } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await listSubscriptionsForUser(session.user.id);

  const headers = [
    "name",
    "category",
    "cost",
    "currency",
    "billing_cycle",
    "custom_days",
    "next_billing_date",
    "started_at",
    "is_active",
    "is_trial",
    "trial_ends_at",
    "url",
    "description",
    "notes",
    "cancelled_at",
  ];

  const lines = [headers.join(",")];
  for (const { sub, category } of rows) {
    lines.push(
      [
        sub.name,
        category?.name ?? "",
        sub.cost,
        sub.currency,
        sub.billingCycle,
        sub.customDays ?? "",
        format(sub.nextBillingDate, "yyyy-MM-dd"),
        format(sub.startedAt, "yyyy-MM-dd"),
        sub.isActive ? "yes" : "no",
        sub.isTrial ? "yes" : "no",
        sub.trialEndsAt ? format(sub.trialEndsAt, "yyyy-MM-dd") : "",
        sub.url ?? "",
        sub.description ?? "",
        sub.notes ?? "",
        sub.cancelledAt ? format(sub.cancelledAt, "yyyy-MM-dd") : "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const body = lines.join("\n");
  const filename = `subscriptions-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
