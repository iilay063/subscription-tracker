import Link from "next/link";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Logo } from "@/components/halo/logo";
import { formatMoney } from "@/lib/money";
import type { DashboardSubscription } from "@/lib/dashboard";

export function PriceChangesCard({
  items,
}: {
  items: DashboardSubscription[];
}) {
  const recent = items.filter((s) => s.priceChange);
  if (recent.length === 0) return null;
  return (
    <section className="col-span-12 md:col-span-6 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-coral" strokeWidth={1.75} />
        <div className="text-[14px] font-medium">Recent price changes</div>
      </div>
      <ul className="space-y-3">
        {recent.slice(0, 3).map((s) => {
          const pc = s.priceChange!;
          const up = pc.change > 0;
          return (
            <li key={s.id} className="flex items-center gap-3">
              <Logo
                sub={{
                  name: s.name,
                  faviconUrl: s.faviconUrl,
                  categoryColor: s.categoryColor,
                }}
                size={32}
                ring
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/subscriptions/${s.id}`}
                  className="text-[13.5px] font-medium truncate hover:underline block"
                >
                  {s.name}
                </Link>
                <div className="text-[11.5px] tnum text-muted-foreground">
                  {formatMoney(pc.previous, s.currency)} →{" "}
                  {formatMoney(s.cost, s.currency)}
                </div>
              </div>
              <span
                className={`text-[12px] tnum inline-flex items-center gap-1 ${up ? "text-coral" : "text-emerald"}`}
              >
                {up ? (
                  <ArrowUp className="h-3 w-3" strokeWidth={1.75} />
                ) : (
                  <ArrowDown className="h-3 w-3" strokeWidth={1.75} />
                )}
                {up ? "+" : "-"}
                {formatMoney(Math.abs(pc.change), s.currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
