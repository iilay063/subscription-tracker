import Link from "next/link";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth-helpers";
import { listCancelledSubscriptionsForUser } from "@/lib/db/subscriptions";
import { getUserById } from "@/lib/db/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CancelledPage() {
  const user = await requireUser();
  const [rows, dbUser] = await Promise.all([
    listCancelledSubscriptionsForUser(user.id),
    getUserById(user.id),
  ]);
  const userCurrency = dbUser?.preferredCurrency ?? "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cancelled subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          History of subscriptions you&apos;ve cancelled, with lifetime spend.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nothing cancelled yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ sub, category, totalPaid }) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/subscriptions/${sub.id}`} className="hover:underline">
                      {sub.name}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category?.name ?? "Uncategorized"}
                    {" · "}
                    Cancelled {sub.cancelledAt ? format(sub.cancelledAt, "MMM d, yyyy") : "—"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Lifetime paid</div>
                  <div className="text-lg font-semibold tabular-nums">
                    {formatMoney(Number(totalPaid), userCurrency)}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
