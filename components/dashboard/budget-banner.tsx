import { AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/money";

/**
 * One-line callout shown ONLY when the user is over their monthly budget.
 * Under-budget / approaching-budget states are surfaced in the MonthlyHero
 * card's footer instead.
 */
export function BudgetBanner({
  monthlyTotal,
  budget,
  currency,
}: {
  monthlyTotal: number;
  budget: number | null;
  currency: string;
}) {
  if (budget === null || budget === 0) return null;
  if (monthlyTotal <= budget) return null;
  const over = monthlyTotal - budget;
  return (
    <div className="flex items-center gap-2 rounded-md border border-coral/30 bg-coral-tint p-3 text-[13px] text-coral">
      <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>
        You&apos;re over your monthly budget by{" "}
        <span className="font-medium tnum">
          {formatMoney(over, currency)}
        </span>{" "}
        ({formatMoney(monthlyTotal, currency)} of {formatMoney(budget, currency)}).
      </span>
    </div>
  );
}
