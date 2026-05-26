import Link from "next/link";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Logo } from "@/components/halo/logo";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription } from "@/lib/dashboard";

const CYCLE_LABEL: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
  custom_days: "Custom",
};

function hostFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function SubscriptionsTable({
  items,
  userCurrency,
}: {
  items: DashboardSubscription[];
  userCurrency: string;
}) {
  if (items.length === 0) {
    return (
      <div className="px-7 py-10 text-center text-[13px] text-muted-foreground">
        No subscriptions match your filters.
      </div>
    );
  }
  const today = startOfDay(new Date());
  return (
    <div className="border-t border-border overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <th className="px-7 py-3 font-normal">Service</th>
            <th className="px-3 py-3 font-normal">Category</th>
            <th className="px-3 py-3 font-normal">Cycle</th>
            <th className="px-3 py-3 font-normal">Next charge</th>
            <th className="px-3 py-3 font-normal text-right">Cost</th>
            <th className="px-7 py-3 font-normal text-right">Monthly</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => {
            const days = differenceInCalendarDays(
              startOfDay(s.nextBillingDate),
              today,
            );
            const host = hostFromUrl(s.url);
            return (
              <tr
                key={s.id}
                className="border-t border-border hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-7 py-3.5">
                  <div className="flex items-center gap-3">
                    <Logo
                      sub={{
                        name: s.name,
                        faviconUrl: s.faviconUrl,
                        categoryColor: s.categoryColor,
                      }}
                      size={28}
                      ring
                    />
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/subscriptions/${s.id}`}
                          className="hover:underline truncate"
                        >
                          {s.name}
                        </Link>
                        {s.isTrial && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-tint text-violet">
                            Trial
                          </span>
                        )}
                        {s.priceChange && (
                          <span
                            className={`text-[10.5px] tnum inline-flex items-center gap-0.5 ${s.priceChange.change > 0 ? "text-coral" : "text-emerald"}`}
                          >
                            {s.priceChange.change > 0 ? (
                              <ArrowUp className="h-2.5 w-2.5" strokeWidth={2} />
                            ) : (
                              <ArrowDown className="h-2.5 w-2.5" strokeWidth={2} />
                            )}
                            {formatMoney(Math.abs(s.priceChange.change), s.currency)}
                          </span>
                        )}
                      </div>
                      {host && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {host}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  {s.categoryName ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: s.categoryColor ?? "#84807A" }}
                      />
                      {s.categoryName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[12px]">—</span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-[12.5px] text-ink-2">
                  {CYCLE_LABEL[s.billingCycle] ?? s.billingCycle}
                </td>
                <td className="px-3 py-3.5 text-[12.5px] text-ink-2">
                  <div className="tnum">
                    {format(s.nextBillingDate, "MMM d, yyyy")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {days < 0
                      ? `${Math.abs(days)}d overdue`
                      : days === 0
                        ? "today"
                        : `in ${days} day${days === 1 ? "" : "s"}`}
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right tnum font-medium">
                  {formatMoney(s.cost, s.currency)}
                </td>
                <td className="px-7 py-3.5 text-right tnum text-muted-foreground">
                  {formatMoney(s.monthlyInUserCurrency, userCurrency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
