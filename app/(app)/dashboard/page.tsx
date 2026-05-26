import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { loadDashboard } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section";
import { BudgetBanner } from "@/components/dashboard/budget-banner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await loadDashboard(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Showing totals in {data.userCurrency}.
            {data.ratesNote ? ` Rates updated ${data.ratesNote.hoursAgo}h ago.` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/api/export/subscriptions.csv">Export CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/subscriptions/new">
              <Plus className="h-4 w-4" />
              Add subscription
            </Link>
          </Button>
        </div>
      </div>

      <BudgetBanner
        monthlyTotal={data.monthlyTotal}
        budget={data.monthlyBudget}
        currency={data.userCurrency}
      />

      <SummaryCards
        monthlyTotal={data.monthlyTotal}
        yearlyTotal={data.yearlyTotal}
        currency={data.userCurrency}
        activeCount={data.subscriptions.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.breakdown} currency={data.userCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingList items={data.upcoming} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionsSection
            items={data.subscriptions}
            userCurrency={data.userCurrency}
            categories={data.categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
