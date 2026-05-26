import Link from "next/link";
import { format } from "date-fns";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription } from "@/lib/dashboard";

const cycleLabel: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
  custom_days: "Custom",
};

export function SubscriptionsTable({
  items,
  userCurrency,
}: {
  items: DashboardSubscription[];
  userCurrency: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No subscriptions match your filters.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Cycle</th>
            <th className="px-4 py-2">Next billing</th>
            <th className="px-4 py-2 text-right">Cost</th>
            <th className="px-4 py-2 text-right">~ /month</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t hover:bg-muted/30">
              <td className="px-4 py-2 font-medium">
                <div className="flex items-center gap-2">
                  {it.faviconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.faviconUrl}
                      alt=""
                      className="h-4 w-4 rounded-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-4 w-4 rounded-sm bg-muted" />
                  )}
                  <Link href={`/subscriptions/${it.id}`} className="hover:underline">
                    {it.name}
                  </Link>
                  {it.isTrial && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-300">
                      <Sparkles className="h-3 w-3" />
                      Trial
                    </span>
                  )}
                  {it.priceChange && (
                    <span
                      title={`Was ${formatMoney(it.priceChange.previous, it.currency)}`}
                      className={`inline-flex items-center gap-0.5 text-[10px] ${
                        it.priceChange.change > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {it.priceChange.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatMoney(Math.abs(it.priceChange.change), it.currency)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">
                {it.categoryName ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: it.categoryColor ?? "#94a3b8" }}
                    />
                    {it.categoryName}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2">{cycleLabel[it.billingCycle] ?? it.billingCycle}</td>
              <td className="px-4 py-2">{format(it.nextBillingDate, "MMM d, yyyy")}</td>
              <td className="px-4 py-2 text-right tabular-nums">
                {formatMoney(it.cost, it.currency)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                {formatMoney(it.monthlyInUserCurrency, userCurrency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
