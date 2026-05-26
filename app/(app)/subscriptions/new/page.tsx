import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SubscriptionForm } from "@/components/subscription-form";
import { addSubscriptionAction } from "@/app/actions/subscriptions";

export default function NewSubscriptionPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="px-6 md:px-10 py-8 max-w-[680px]">
      <Link
        href="/dashboard"
        className="text-[12.5px] inline-flex items-center gap-1 mb-6 text-muted-foreground hover:text-ink"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.75} /> Back to dashboard
      </Link>
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          Add
        </div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
          New subscription
        </h1>
      </div>

      <section className="rounded-xl border border-border bg-surface p-7">
        <SubscriptionForm
          action={addSubscriptionAction}
          defaults={{
            nextBillingDate: today,
            currency: "USD",
            billingCycle: "monthly",
          }}
          submitLabel="Add subscription"
        />
      </section>
    </div>
  );
}
