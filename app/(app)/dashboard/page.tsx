import Link from "next/link";
import { Plus, Download, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth-helpers";
import { loadDashboard } from "@/lib/dashboard";
import { MonthlyHero } from "@/components/dashboard/monthly-hero";
import { SpendingMixCard } from "@/components/dashboard/spending-mix-card";
import { UpcomingCard } from "@/components/dashboard/upcoming-card";
import { TrialsCard } from "@/components/dashboard/trials-card";
import { PriceChangesCard } from "@/components/dashboard/price-changes-card";
import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section";
import { BudgetBanner } from "@/components/dashboard/budget-banner";

export const dynamic = "force-dynamic";

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(name: string | null | undefined): string | null {
  if (!name) return null;
  return name.trim().split(/\s+/)[0] || null;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await loadDashboard(user.id);
  const now = new Date();
  const fname = firstName(user.name);
  const trials = data.subscriptions.filter((s) => s.isTrial && s.trialEndsAt);
  const hasPriceChanges = data.subscriptions.some((s) => s.priceChange);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1200px]">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground tnum">
            {format(now, "EEEE, MMMM d")}
          </div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            {greeting(now)}
            {fname ? `, ${fname}.` : "."}
          </h1>
          {data.ratesNote && (
            <div className="mt-1 text-[11.5px] text-muted-foreground">
              Showing totals in {data.userCurrency}. Rates updated{" "}
              {data.ratesNote.hoursAgo}h ago.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/export/subscriptions.csv"
            className="h-9 px-3 rounded-md border border-border-strong text-[13px] inline-flex items-center gap-1.5 text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Export
          </Link>
          <Link
            href="/detect"
            className="h-9 px-3 rounded-md border border-border-strong text-[13px] inline-flex items-center gap-1.5 text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> Detect
          </Link>
          <Link
            href="/subscriptions/new"
            className="h-9 px-3.5 rounded-md text-[13px] font-medium inline-flex items-center gap-1.5 text-white hover:opacity-90"
            style={{ background: "hsl(var(--accent-emerald))" }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add subscription
          </Link>
        </div>
      </div>

      <BudgetBanner
        monthlyTotal={data.monthlyTotal}
        budget={data.monthlyBudget}
        currency={data.userCurrency}
      />

      {/* Hero row */}
      <div className="grid grid-cols-12 gap-5 mb-6 mt-6">
        <MonthlyHero
          monthlyTotal={data.monthlyTotal}
          yearlyTotal={data.yearlyTotal}
          currency={data.userCurrency}
          monthlyBudget={data.monthlyBudget}
          activeCount={data.subscriptions.length}
        />
        <SpendingMixCard
          breakdown={data.breakdown}
          monthlyTotal={data.monthlyTotal}
          currency={data.userCurrency}
          subscriptions={data.subscriptions}
        />
      </div>

      <UpcomingCard
        upcoming={data.upcoming}
        subscriptions={data.subscriptions}
        userCurrency={data.userCurrency}
      />

      {(trials.length > 0 || hasPriceChanges) && (
        <div className="grid grid-cols-12 gap-5 mb-6">
          <TrialsCard trials={trials} />
          <PriceChangesCard items={data.subscriptions} />
        </div>
      )}

      <SubscriptionsSection
        items={data.subscriptions}
        userCurrency={data.userCurrency}
        categories={data.categories}
      />
    </div>
  );
}
