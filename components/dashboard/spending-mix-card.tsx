"use client";

import { useMemo, useState } from "react";
import { Donut } from "@/components/halo/donut";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription } from "@/lib/dashboard";

function formatNoCents(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.floor(n));
  } catch {
    return `${currency} ${Math.floor(n)}`;
  }
}

type Slice = { category: string; color: string; monthly: number };

export function SpendingMixCard({
  breakdown,
  monthlyTotal,
  currency,
  subscriptions,
}: {
  breakdown: Slice[];
  monthlyTotal: number;
  currency: string;
  subscriptions: DashboardSubscription[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = breakdown.reduce((s, b) => s + b.monthly, 0) || 1;

  const subsByCategory = useMemo(() => {
    const map = new Map<string, DashboardSubscription[]>();
    for (const s of subscriptions) {
      const key = s.categoryName ?? "Uncategorized";
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [subscriptions]);

  const hoveredSlice = hovered !== null ? breakdown[hovered] : null;
  const hoveredSubs = hoveredSlice
    ? (subsByCategory.get(hoveredSlice.category) ?? []).slice().sort(
        (a, b) => b.monthlyInUserCurrency - a.monthlyInUserCurrency,
      )
    : [];

  return (
    <section className="col-span-12 lg:col-span-5 rounded-xl border border-border bg-surface p-7 shadow-halo">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            Spending mix
          </div>
          <div className="mt-1 text-[15px] font-medium">By category</div>
        </div>
        <div className="text-[12px] text-muted-foreground">This month</div>
      </div>
      <div className="flex items-start gap-6">
        <div className="relative w-[150px] h-[150px] shrink-0">
          <Donut
            data={breakdown.map((b) => ({
              label: b.category,
              value: b.monthly,
              color: b.color,
            }))}
            hoveredIndex={hovered}
            onHover={setHovered}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredSlice ? (
              <>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {hoveredSlice.category}
                </div>
                <div className="tnum text-[16px] font-semibold mt-0.5">
                  {formatMoney(hoveredSlice.monthly, currency)}
                </div>
                <div className="text-[10px] text-faint tnum mt-0.5">
                  {Math.round((hoveredSlice.monthly / total) * 100)}%
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Monthly
                </div>
                <div className="tnum text-[18px] font-semibold mt-0.5">
                  {formatNoCents(monthlyTotal, currency)}
                </div>
              </>
            )}
          </div>
        </div>

        {hoveredSlice ? (
          <div className="flex-1 min-w-0 self-stretch">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-2">
              {hoveredSubs.length}{" "}
              {hoveredSubs.length === 1 ? "subscription" : "subscriptions"}
            </div>
            <ul className="space-y-1.5 max-h-[150px] overflow-y-auto scrollbar-thin pr-1">
              {hoveredSubs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 text-[12px]"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: s.categoryColor ?? "#84807A" }}
                  />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="tnum text-[11px] text-muted-foreground">
                    {formatMoney(s.monthlyInUserCurrency, currency)}
                  </span>
                </li>
              ))}
              {hoveredSubs.length === 0 && (
                <li className="text-[12px] text-muted-foreground">
                  No subscriptions in this category.
                </li>
              )}
            </ul>
          </div>
        ) : (
          <ul className="flex-1 space-y-2 min-w-0">
            {breakdown.map((c, i) => (
              <li
                key={c.category}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-2.5 text-[12.5px] cursor-default"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: c.color }}
                />
                <span className="flex-1 truncate">{c.category}</span>
                <span className="tnum text-[11.5px] text-muted-foreground">
                  {Math.round((c.monthly / total) * 100)}%
                </span>
              </li>
            ))}
            {breakdown.length === 0 && (
              <li className="text-[12.5px] text-muted-foreground">
                No active subscriptions yet.
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
