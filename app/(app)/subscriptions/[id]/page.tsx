import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth-helpers";
import { getSubscriptionById } from "@/lib/db/subscriptions";
import { listBillingForSubscription } from "@/lib/db/billing-history";
import { listCategoriesForUser } from "@/lib/db/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionForm } from "@/components/subscription-form";
import {
  cancelSubscriptionAction,
  reactivateSubscriptionAction,
  updateSubscriptionAction,
} from "@/app/actions/subscriptions";
import { formatMoney } from "@/lib/money";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const sub = await getSubscriptionById(id, user.id);
  if (!sub) notFound();

  const [history, categories] = await Promise.all([
    listBillingForSubscription(id),
    listCategoriesForUser(user.id),
  ]);
  const categoryName = sub.categoryId
    ? categories.find((c) => c.id === sub.categoryId)?.name
    : "";

  const updateAction = updateSubscriptionAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{sub.name}</h1>
        <div className="flex items-center gap-2">
          {sub.isActive ? (
            <form
              action={async () => {
                "use server";
                await cancelSubscriptionAction(id);
              }}
            >
              <Button type="submit" variant="destructive">
                Cancel
              </Button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await reactivateSubscriptionAction(id);
              }}
            >
              <Button type="submit" variant="secondary">
                Reactivate
              </Button>
            </form>
          )}
          <Button asChild variant="ghost">
            <Link href="/dashboard">Back</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No billings recorded yet. The first one will be added on{" "}
              {format(sub.nextBillingDate, "MMM d, yyyy")}.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2">
                  <span>{format(h.billedAt, "MMM d, yyyy")}</span>
                  <span className="tabular-nums">
                    {formatMoney(Number(h.amount), h.currency)}
                    {h.currency !== h.userCurrency && (
                      <span className="ml-2 text-muted-foreground">
                        ({formatMoney(Number(h.amountInUserCurrency), h.userCurrency)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
