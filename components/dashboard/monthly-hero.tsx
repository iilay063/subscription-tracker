import { formatMoney } from "@/lib/money";

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

export function MonthlyHero({
  monthlyTotal,
  yearlyTotal,
  currency,
  monthlyBudget,
  activeCount,
}: {
  monthlyTotal: number;
  yearlyTotal: number;
  currency: string;
  monthlyBudget: number | null;
  activeCount: number;
}) {
  const wholePart = formatNoCents(monthlyTotal, currency);
  const cents = monthlyTotal.toFixed(2).split(".")[1] ?? "00";

  const hasBudget = monthlyBudget !== null && monthlyBudget > 0;
  const over = hasBudget && monthlyTotal > (monthlyBudget as number);
  const pct = hasBudget
    ? Math.min(100, (monthlyTotal / (monthlyBudget as number)) * 100)
    : 0;
  const headroomPct = hasBudget ? Math.max(0, 100 - pct) : 0;

  return (
    <section className="col-span-12 lg:col-span-7 rounded-xl border border-border bg-surface p-7 shadow-halo relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            This month
          </div>
          <div className="mt-2 tnum text-[56px] leading-none font-semibold tracking-[-0.03em]">
            {wholePart}
            <span className="text-[28px] align-top text-faint">.{cents}</span>
          </div>
          <div className="mt-3 text-[13px] flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-2">
            <span className="text-muted-foreground">
              {formatNoCents(yearlyTotal, currency)} / yr projected
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            Active
          </div>
          <div className="mt-2 tnum text-[28px] font-medium">{activeCount}</div>
          <div className="text-[11px] text-muted-foreground">subscriptions</div>
        </div>
      </div>

      {hasBudget && (
        <div className="mt-7 pt-5 border-t border-border">
          <div className="flex items-center justify-between text-[12px] mb-2">
            <span className="text-muted-foreground">Monthly budget</span>
            <span className="tnum text-ink-2">
              {formatMoney(monthlyTotal, currency)}{" "}
              <span className="text-faint">of</span>{" "}
              {formatMoney(monthlyBudget as number, currency)}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-surface-muted">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${pct}%`,
                background: over
                  ? "hsl(var(--coral))"
                  : "hsl(var(--accent-emerald))",
              }}
            />
          </div>
          <div
            className={`mt-2 text-[11.5px] ${over ? "text-coral" : "text-muted-foreground"}`}
          >
            {over
              ? `Over budget by ${formatMoney(monthlyTotal - (monthlyBudget as number), currency)}`
              : `${Math.round(headroomPct)}% headroom this month`}
          </div>
        </div>
      )}
    </section>
  );
}
