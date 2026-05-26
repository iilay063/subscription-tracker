import Link from "next/link";
import {
  format,
  differenceInCalendarMonths,
} from "date-fns";
import { requireUser } from "@/lib/auth-helpers";
import { listCancelledSubscriptionsForUser } from "@/lib/db/subscriptions";
import { getUserById } from "@/lib/db/users";
import { Logo } from "@/components/halo/logo";
import { formatMoney } from "@/lib/money";
import { resolveCategoryColor } from "@/lib/categories-presets";

export const dynamic = "force-dynamic";

function faviconFor(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

export default async function CancelledPage() {
  const user = await requireUser();
  const [rows, dbUser] = await Promise.all([
    listCancelledSubscriptionsForUser(user.id),
    getUserById(user.id),
  ]);
  const userCurrency = dbUser?.preferredCurrency ?? "USD";
  const lifetimeTotal = rows.reduce((s, r) => s + Number(r.totalPaid), 0);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1080px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            Archive
          </div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
            Cancelled subscriptions
          </h1>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Lifetime spend (cancelled)
          </div>
          <div className="mt-1 tnum text-[24px] font-semibold tracking-[-0.02em]">
            {formatMoney(lifetimeTotal, userCurrency)}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
          Nothing cancelled yet.
        </div>
      ) : (
        <section className="rounded-xl border border-border bg-surface">
          <div className="hidden md:grid border-b border-border grid-cols-12 px-7 py-3 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <div className="col-span-5">Service</div>
            <div className="col-span-3">Active period</div>
            <div className="col-span-2 text-right">Last cost</div>
            <div className="col-span-2 text-right">Lifetime</div>
          </div>
          {rows.map(({ sub, category, totalPaid }) => {
            const months =
              sub.cancelledAt
                ? Math.max(
                    1,
                    differenceInCalendarMonths(sub.cancelledAt, sub.startedAt),
                  )
                : 0;
            const catName = category?.name ?? null;
            const catColor = resolveCategoryColor(catName);
            return (
              <div
                key={sub.id}
                className="grid grid-cols-12 px-7 py-4 border-b border-border last:border-b-0 items-center gap-3"
              >
                <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
                  <Logo
                    sub={{
                      name: sub.name,
                      faviconUrl: faviconFor(sub.url),
                      categoryColor: catColor,
                    }}
                    size={32}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="text-[13.5px] font-medium hover:underline truncate block"
                    >
                      {sub.name}
                    </Link>
                    <div className="text-[11.5px] text-muted-foreground inline-flex items-center gap-1.5">
                      {catName && (
                        <>
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: catColor }}
                          />
                          {catName}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-3 text-[12.5px] text-ink-2">
                  <div className="tnum">
                    {format(sub.startedAt, "MMM d, yyyy")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {sub.cancelledAt
                      ? `→ ${format(sub.cancelledAt, "MMM d, yyyy")} (${months}mo)`
                      : "—"}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-2 text-right tnum text-[13px]">
                  {formatMoney(Number(sub.cost), sub.currency)}
                </div>
                <div className="col-span-6 md:col-span-2 text-right tnum text-[13px] font-medium">
                  {formatMoney(Number(totalPaid), userCurrency)}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <p className="mt-5 text-[12px] text-muted-foreground">
        Cancelled subscriptions are kept so totals stay accurate. To restart
        one, add it again as new.
      </p>
    </div>
  );
}
