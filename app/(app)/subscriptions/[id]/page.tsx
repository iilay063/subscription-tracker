import Link from "next/link";
import { notFound } from "next/navigation";
import {
  format,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  ArrowUp,
  ExternalLink,
} from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getSubscriptionById } from "@/lib/db/subscriptions";
import {
  listBillingForSubscription,
  getRecentBillingPairs,
} from "@/lib/db/billing-history";
import { listCategoriesForUser } from "@/lib/db/categories";
import { getUserById } from "@/lib/db/users";
import { Logo } from "@/components/halo/logo";
import { SubscriptionForm } from "@/components/subscription-form";
import {
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  updateSubscriptionAction,
} from "@/app/actions/subscriptions";
import { formatMoney, round2 } from "@/lib/money";
import { resolveCategoryColor } from "@/lib/categories-presets";

function hostFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function faviconFor(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

const CYCLE_UNIT: Record<string, string> = {
  monthly: "month",
  yearly: "year",
  weekly: "week",
  custom_days: "cycle",
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const sub = await getSubscriptionById(id, user.id);
  if (!sub) notFound();

  const [history, categories, dbUser, pairs] = await Promise.all([
    listBillingForSubscription(id),
    listCategoriesForUser(user.id),
    getUserById(user.id),
    getRecentBillingPairs([id]),
  ]);
  const userCurrency = dbUser?.preferredCurrency ?? "USD";
  const categoryName = sub.categoryId
    ? categories.find((c) => c.id === sub.categoryId)?.name ?? null
    : null;
  const categoryColor = resolveCategoryColor(categoryName);
  const host = hostFromUrl(sub.url);
  const today = startOfDay(new Date());
  const daysUntil = differenceInCalendarDays(
    startOfDay(sub.nextBillingDate),
    today,
  );

  const lifetimePaid = history.reduce(
    (s, h) => s + Number(h.amountInUserCurrency),
    0,
  );

  const pair = pairs.get(id);
  const priceChange =
    pair && pair.previous !== null && pair.previous !== pair.latest
      ? { previous: pair.previous, change: pair.latest - pair.previous, at: pair.latestAt }
      : null;

  const leadDays =
    sub.reminderLeadDaysOverride ?? dbUser?.reminderLeadDays ?? 3;
  const leadSource =
    sub.reminderLeadDaysOverride !== null
      ? "per-subscription"
      : "global default";

  const updateAction = updateSubscriptionAction.bind(null, id);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1080px]">
      <Link
        href="/dashboard"
        className="text-[12.5px] inline-flex items-center gap-1 mb-6 text-muted-foreground hover:text-ink"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.75} /> Back to dashboard
      </Link>

      {/* Hero */}
      <div className="flex flex-wrap items-start gap-5 mb-8">
        <Logo
          sub={{
            name: sub.name,
            faviconUrl: faviconFor(sub.url),
            categoryColor,
          }}
          size={64}
          rounded="rounded-2xl"
          ring
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
              {sub.name}
            </h1>
            {host && sub.url && (
              <a
                href={sub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-muted-foreground hover:text-ink inline-flex items-center gap-1"
              >
                {host}
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </a>
            )}
            {!sub.isActive && (
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-surface-muted text-muted-foreground">
                Cancelled
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            {categoryName && (
              <span className="inline-flex items-center gap-1.5 text-ink-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: categoryColor }}
                />
                {categoryName}
              </span>
            )}
            <span className="text-faint">·</span>
            <span className="text-ink-2">
              Active since {format(sub.startedAt, "MMM d, yyyy")}
            </span>
            {priceChange && (
              <>
                <span className="text-faint">·</span>
                <span className="inline-flex items-center gap-1 text-coral">
                  <ArrowUp className="h-3 w-3" strokeWidth={1.75} />
                  Raised {formatMoney(round2(Math.abs(priceChange.change)), sub.currency)} on{" "}
                  {format(priceChange.at, "MMM d")}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#edit"
            className="h-9 px-3 rounded-md border border-border-strong text-[13px] inline-flex items-center gap-1.5 text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Edit
          </a>
          {sub.isActive ? (
            <form
              action={async () => {
                "use server";
                await cancelSubscriptionAction(id);
              }}
            >
              <button
                type="submit"
                className="h-9 px-3 rounded-md border border-border-strong text-[13px] text-coral hover:bg-coral-tint"
              >
                Cancel subscription
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await reactivateSubscriptionAction(id);
              }}
            >
              <button
                type="submit"
                className="h-9 px-3 rounded-md border border-border-strong text-[13px] text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                Reactivate
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        {[
          {
            label: "Cost",
            value: formatMoney(Number(sub.cost), sub.currency),
            sub: `per ${CYCLE_UNIT[sub.billingCycle] ?? "cycle"} · ${sub.currency}`,
          },
          {
            label: "Next charge",
            value: format(sub.nextBillingDate, "MMM d"),
            sub:
              daysUntil < 0
                ? `${Math.abs(daysUntil)}d overdue`
                : daysUntil === 0
                  ? "today"
                  : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
          },
          {
            label: "Lifetime spend",
            value: formatMoney(lifetimePaid, userCurrency),
            sub: `${history.length} ${history.length === 1 ? "charge" : "charges"} recorded`,
          },
          {
            label: "Reminder",
            value: `${leadDays} day${leadDays === 1 ? "" : "s"} before`,
            sub: leadSource,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="col-span-6 md:col-span-3 rounded-xl border border-border bg-surface p-5"
          >
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-2 tnum text-[22px] font-medium tracking-[-0.02em]">
              {s.value}
            </div>
            <div className="text-[11.5px] mt-0.5 text-muted-foreground">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main row */}
      <div className="grid grid-cols-12 gap-5 mb-8">
        <section className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-surface p-7">
          <div className="text-[15px] font-medium mb-1">Billing history</div>
          <div className="text-[12px] mb-5 text-muted-foreground">
            {history.length === 0
              ? `No billings recorded yet. The first one will be added on ${format(sub.nextBillingDate, "MMM d, yyyy")}.`
              : `The last ${Math.min(history.length, 12)} charges.`}
          </div>
          {history.length > 0 && (
            <div className="space-y-0">
              {history.slice(0, 12).map((h, i) => {
                const amount = Number(h.amount);
                const prev = history[i + 1];
                const changed =
                  prev && Number(prev.amount) !== amount;
                const delta = prev ? amount - Number(prev.amount) : 0;
                return (
                  <div
                    key={h.id}
                    className="grid grid-cols-12 items-center py-2.5 border-b border-border last:border-b-0"
                  >
                    <div className="col-span-4 sm:col-span-3 text-[12.5px] tnum text-ink-2">
                      {format(h.billedAt, "MMM d, yyyy")}
                    </div>
                    <div className="hidden sm:block sm:col-span-5 text-[12.5px] text-muted-foreground">
                      Charged · {h.currency !== h.userCurrency
                        ? `${formatMoney(Number(h.amountInUserCurrency), h.userCurrency)} after FX`
                        : "in account currency"}
                    </div>
                    <div className="col-span-8 sm:col-span-4 text-right tnum text-[13.5px] font-medium">
                      {formatMoney(amount, h.currency)}
                      {changed && (
                        <span
                          className={`ml-2 text-[10.5px] tnum ${delta > 0 ? "text-coral" : "text-emerald"}`}
                        >
                          {delta > 0 ? "+" : "-"}
                          {formatMoney(Math.abs(delta), h.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          {sub.notes && (
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="text-[14px] font-medium mb-3">Notes</div>
              <p className="text-[12.5px] leading-[1.6] text-ink-2 whitespace-pre-wrap">
                {sub.notes}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="text-[14px] font-medium mb-3">Quick actions</div>
            <div className="space-y-1">
              {sub.url && (
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between text-[13px] py-2 px-2.5 rounded-md text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                >
                  Open service
                  <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
                </a>
              )}
              <a
                href="#edit"
                className="w-full flex items-center justify-between text-[13px] py-2 px-2.5 rounded-md text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                Change billing date
                <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
              </a>
              <a
                href="#edit"
                className="w-full flex items-center justify-between text-[13px] py-2 px-2.5 rounded-md text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                Move to another category
                <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
              </a>
              <a
                href="#edit"
                className="w-full flex items-center justify-between text-[13px] py-2 px-2.5 rounded-md text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                Edit reminder lead time
                <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      <section
        id="edit"
        className="rounded-xl border border-border bg-surface p-7 mb-12 scroll-mt-8"
      >
        <div className="mb-5">
          <div className="text-[15px] font-medium">Edit details</div>
          <div className="text-[12.5px] text-muted-foreground">
            Update any field below and save.
          </div>
        </div>
        <SubscriptionForm
          action={updateAction}
          defaults={{
            name: sub.name,
            description: sub.description,
            cost: Number(sub.cost),
            currency: sub.currency,
            billingCycle: sub.billingCycle,
            customDays: sub.customDays,
            nextBillingDate: format(sub.nextBillingDate, "yyyy-MM-dd"),
            categoryName: categoryName ?? "",
            url: sub.url,
            notes: sub.notes,
            isTrial: sub.isTrial,
            trialEndsAt: sub.trialEndsAt
              ? format(sub.trialEndsAt, "yyyy-MM-dd")
              : "",
            reminderLeadDaysOverride: sub.reminderLeadDaysOverride,
          }}
          submitLabel="Save changes"
        />
      </section>
    </div>
  );
}
