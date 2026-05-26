import Link from "next/link";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/halo/logo";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription } from "@/lib/dashboard";

export function TrialsCard({
  trials,
}: {
  trials: DashboardSubscription[];
}) {
  if (trials.length === 0) return null;
  const today = startOfDay(new Date());
  return (
    <section className="col-span-12 md:col-span-6 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-violet" strokeWidth={1.75} />
        <div className="text-[14px] font-medium">Trials ending soon</div>
      </div>
      <ul className="space-y-3">
        {trials.map((tr) => {
          if (!tr.trialEndsAt) return null;
          const days = Math.max(
            0,
            differenceInCalendarDays(startOfDay(tr.trialEndsAt), today),
          );
          const urgent = days <= 3;
          return (
            <li key={tr.id} className="flex items-center gap-3">
              <Logo
                sub={{
                  name: tr.name,
                  faviconUrl: tr.faviconUrl,
                  categoryColor: tr.categoryColor,
                }}
                size={32}
                ring
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/subscriptions/${tr.id}`}
                  className="text-[13.5px] font-medium truncate hover:underline block"
                >
                  {tr.name}
                </Link>
                <div className="text-[11.5px] text-muted-foreground">
                  Converts to {formatMoney(tr.cost, tr.currency)} /{" "}
                  {tr.billingCycle === "yearly" ? "yr" : "mo"} on{" "}
                  {format(tr.trialEndsAt, "MMM d")}
                </div>
              </div>
              <span
                className={`text-[12px] tnum px-2 py-0.5 rounded-full ${
                  urgent
                    ? "bg-coral-tint text-coral"
                    : "bg-violet-tint text-violet"
                }`}
              >
                {days}d left
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
