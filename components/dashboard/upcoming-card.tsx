"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, LayoutGrid } from "lucide-react";
import {
  addDays,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInCalendarDays,
} from "date-fns";
import Link from "next/link";
import { Logo } from "@/components/halo/logo";
import { Segment } from "@/components/halo/segment";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription, DashboardUpcoming } from "@/lib/dashboard";

type View = "timeline" | "grid";
const STORAGE_KEY = "subtracker.calendarView";

export function UpcomingCard({
  upcoming,
  subscriptions,
  userCurrency,
}: {
  upcoming: DashboardUpcoming[];
  subscriptions: DashboardSubscription[];
  userCurrency: string;
}) {
  const [view, setView] = useState<View>("timeline");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "timeline" || stored === "grid") setView(stored);
    setMounted(true);
  }, []);

  function handleChange(v: View) {
    setView(v);
    if (mounted) localStorage.setItem(STORAGE_KEY, v);
  }

  const totalDue = upcoming.reduce((s, u) => s + u.costInUserCurrency, 0);

  return (
    <section className="rounded-xl border border-border bg-surface mb-6 shadow-halo">
      <header className="flex flex-wrap items-center justify-between gap-3 px-7 pt-6 pb-3">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            Upcoming
          </div>
          <div className="mt-1 text-[15px] font-medium">
            {upcoming.length} {upcoming.length === 1 ? "charge" : "charges"} in next 30 days
          </div>
        </div>
        <div className="flex items-center gap-4">
          {upcoming.length > 0 && (
            <div className="text-[13px] tnum text-ink-2">
              <span className="text-muted-foreground">Total due:</span>{" "}
              {formatMoney(totalDue, userCurrency)}
            </div>
          )}
          <Segment<View>
            value={view}
            onChange={handleChange}
            size="sm"
            options={[
              {
                value: "timeline",
                label: (
                  <>
                    <BarChart3 className="h-3 w-3" strokeWidth={1.75} />
                    Timeline
                  </>
                ),
              },
              {
                value: "grid",
                label: (
                  <>
                    <LayoutGrid className="h-3 w-3" strokeWidth={1.75} />
                    Calendar
                  </>
                ),
              },
            ]}
          />
        </div>
      </header>

      {view === "timeline" ? (
        <TimelineRail items={upcoming} userCurrency={userCurrency} />
      ) : (
        <CalendarGrid items={subscriptions} userCurrency={userCurrency} />
      )}
    </section>
  );
}

function TimelineRail({
  items,
  userCurrency,
}: {
  items: DashboardUpcoming[];
  userCurrency: string;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const dt = addDays(today, i);
      const billings = items.filter((it) => isSameDay(it.nextBillingDate, dt));
      const amt = billings.reduce((s, b) => s + b.costInUserCurrency, 0);
      return { dt, billings, amt };
    });
  }, [items, today]);

  const maxAmt = Math.max(1, ...days.map((d) => d.amt));

  if (items.length === 0) {
    return (
      <div className="px-7 pb-7 pt-2 text-[13px] text-muted-foreground">
        Nothing due in the next 30 days.
      </div>
    );
  }

  return (
    <div className="px-7 pb-7">
      <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
        {days.map((day, i) => {
          const isToday = i === 0;
          const has = day.billings.length > 0;
          const height = has ? 22 + (day.amt / maxAmt) * 56 : 0;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-2 min-w-[34px]"
            >
              <div className="h-[80px] flex flex-col items-center justify-end">
                {has ? (
                  <div
                    className="w-7 rounded-t-md flex flex-col items-center justify-end gap-[2px] pb-1"
                    style={{
                      height,
                      background: isToday
                        ? "hsl(var(--accent-emerald))"
                        : "hsl(var(--surface-muted))",
                    }}
                  >
                    {day.billings.slice(0, 3).map((b, j) => (
                      <div
                        key={j}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: isToday
                            ? "rgba(255,255,255,0.85)"
                            : b.categoryColor ?? "#84807A",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-px w-4 bg-border" />
                )}
              </div>
              <div
                className={`text-[10px] tnum ${isToday ? "font-semibold text-ink" : "text-muted-foreground"}`}
              >
                {day.dt.getDate()}
              </div>
              {(i === 0 || day.dt.getDate() === 1) && (
                <div className="text-[9px] uppercase tracking-wider text-faint">
                  {format(day.dt, "MMM")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.slice(0, 3).map((it) => {
          const days = differenceInCalendarDays(
            startOfDay(it.nextBillingDate),
            today,
          );
          return (
            <Link
              key={it.id}
              href={`/subscriptions/${it.id}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-muted hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <Logo
                sub={{
                  name: it.name,
                  faviconUrl: it.faviconUrl,
                  categoryColor: it.categoryColor,
                }}
                size={32}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate">{it.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {format(it.nextBillingDate, "MMM d")}
                  {" · "}
                  {days <= 0 ? "today" : `in ${days}d`}
                </div>
              </div>
              <div className="tnum text-[13px] font-medium">
                {formatMoney(it.cost, it.currency)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CalendarGrid({
  items,
  userCurrency,
}: {
  items: DashboardSubscription[];
  userCurrency: string;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const cells = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const subsByDay = (dt: Date) =>
    items.filter((s) => isSameDay(s.nextBillingDate, dt));

  return (
    <div className="px-5 pb-6">
      <div className="grid grid-cols-7 gap-px mb-1.5">
        {dayNames.map((n) => (
          <div
            key={n}
            className="text-center text-[10.5px] uppercase tracking-[0.1em] py-1.5 text-muted-foreground"
          >
            {n}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden bg-border">
        {cells.map((dt) => {
          const inMonth = dt.getMonth() === today.getMonth();
          const subs = subsByDay(dt);
          const total = subs.reduce((s, x) => s + x.costInUserCurrency, 0);
          const isToday = isSameDay(dt, today);
          return (
            <div
              key={dt.toISOString()}
              className={`min-h-[78px] p-2 flex flex-col ${inMonth ? "bg-surface" : "bg-surface-muted"}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`text-[11px] tnum ${
                    isToday
                      ? "font-semibold text-ink"
                      : inMonth
                        ? "text-ink-2"
                        : "text-faint"
                  }`}
                >
                  {dt.getDate()}
                </div>
                {isToday && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "hsl(var(--accent-emerald))" }}
                  />
                )}
              </div>
              <div className="mt-auto flex flex-col gap-0.5">
                {subs.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 text-[10px] truncate rounded px-1 py-0.5 bg-surface-muted text-ink-2"
                    style={{
                      borderLeft: `2px solid ${s.categoryColor ?? "#84807A"}`,
                    }}
                  >
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
                {subs.length > 2 && (
                  <div className="text-[10px] tnum text-muted-foreground">
                    +{subs.length - 2} more
                  </div>
                )}
                {subs.length > 0 && (
                  <div className="text-[10px] tnum mt-0.5 text-muted-foreground">
                    {formatMoney(total, userCurrency)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
