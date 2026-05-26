import { formatMoney } from "@/lib/money";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function BudgetBanner({
  monthlyTotal,
  budget,
  currency,
}: {
  monthlyTotal: number;
  budget: number | null;
  currency: string;
}) {
  if (budget === null) return null;
  if (budget === 0) return null;

  const pct = (monthlyTotal / budget) * 100;
  const over = monthlyTotal > budget;
  const warn = !over && pct >= 80;

  if (!over && !warn) return null;

  const bg = over
    ? "border-destructive/30 bg-destructive/5 text-destructive"
    : "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400";

  const Icon = over ? AlertTriangle : TrendingUp;
  const headline = over
    ? `You're over your monthly budget of ${formatMoney(budget, currency)}.`
    : `You're at ${Math.round(pct)}% of your monthly budget.`;

  return (
    <div
      className={`flex items-center gap-3 rounded-md border p-3 text-sm ${bg}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div>
        <span className="font-medium">{headline}</span>{" "}
        <span className="opacity-80">
          {formatMoney(monthlyTotal, currency)} / {formatMoney(budget, currency)}
        </span>
      </div>
    </div>
  );
}
