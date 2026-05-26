import { requireUser } from "@/lib/auth-helpers";
import { getUserById } from "@/lib/db/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const dbUser = await getUserById(user.id);

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            defaultCurrency={dbUser?.preferredCurrency ?? "USD"}
            defaultLeadDays={dbUser?.reminderLeadDays ?? 3}
            defaultMonthlyBudget={
              dbUser?.monthlyBudget ? Number(dbUser.monthlyBudget) : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
