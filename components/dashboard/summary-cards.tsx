import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export function SummaryCards({
  monthlyTotal,
  yearlyTotal,
  currency,
  activeCount,
}: {
  monthlyTotal: number;
  yearlyTotal: number;
  currency: string;
  activeCount: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <CardDescription>Monthly</CardDescription>
          <CardTitle className="mt-2 text-3xl">{formatMoney(monthlyTotal, currency)}</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <CardDescription>Yearly</CardDescription>
          <CardTitle className="mt-2 text-3xl">{formatMoney(yearlyTotal, currency)}</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <CardDescription>Active subscriptions</CardDescription>
          <CardTitle className="mt-2 text-3xl">{activeCount}</CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}
