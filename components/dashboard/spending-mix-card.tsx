import { Donut } from "@/components/halo/donut";

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

export function SpendingMixCard({
  breakdown,
  monthlyTotal,
  currency,
}: {
  breakdown: { category: string; color: string; monthly: number }[];
  monthlyTotal: number;
  currency: string;
}) {
  const total = breakdown.reduce((s, b) => s + b.monthly, 0) || 1;
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
      <div className="flex items-center gap-6">
        <div className="relative w-[150px] h-[150px] shrink-0">
          <Donut
            data={breakdown.map((b) => ({
              label: b.category,
              value: b.monthly,
              color: b.color,
            }))}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Monthly
            </div>
            <div className="tnum text-[18px] font-semibold mt-0.5">
              {formatNoCents(monthlyTotal, currency)}
            </div>
          </div>
        </div>
        <ul className="flex-1 space-y-2 min-w-0">
          {breakdown.map((c) => (
            <li
              key={c.category}
              className="flex items-center gap-2.5 text-[12.5px]"
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
      </div>
    </section>
  );
}
