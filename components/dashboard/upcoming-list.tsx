import Link from "next/link";
import { format } from "date-fns";
import { formatMoney } from "@/lib/money";
import type { DashboardData } from "@/lib/dashboard";
import { daysUntil } from "@/lib/billing/dates";

export function UpcomingList({ items }: { items: DashboardData["upcoming"] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing due in the next 30 days.</p>;
  }
  const now = new Date();
  return (
    <ul className="divide-y">
      {items.map((it) => {
        const days = daysUntil(now, it.nextBillingDate);
        return (
          <li key={it.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: it.categoryColor ?? "#94a3b8" }}
              />
              <Link href={`/subscriptions/${it.id}`} className="truncate font-medium hover:underline">
                {it.name}
              </Link>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="text-muted-foreground">
                {format(it.nextBillingDate, "MMM d")}
                {" · "}
                {days <= 0 ? "today" : `in ${days}d`}
              </span>
              <span className="font-medium tabular-nums">
                {formatMoney(it.cost, it.currency)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
