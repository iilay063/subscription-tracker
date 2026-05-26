import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { loadDashboard } from "@/lib/dashboard";
import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section";

export const dynamic = "force-dynamic";

export default async function SubscriptionsIndexPage() {
  const user = await requireUser();
  const data = await loadDashboard(user.id);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1200px]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            All active
          </div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Subscriptions
          </h1>
        </div>
        <Link
          href="/subscriptions/new"
          className="h-9 px-3.5 rounded-md text-[13px] font-medium inline-flex items-center gap-1.5 text-white hover:opacity-90"
          style={{ background: "hsl(var(--accent-emerald))" }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add subscription
        </Link>
      </div>

      <SubscriptionsSection
        items={data.subscriptions}
        userCurrency={data.userCurrency}
        categories={data.categories}
      />
    </div>
  );
}
