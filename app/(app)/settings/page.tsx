import { requireUser } from "@/lib/auth-helpers";
import { getUserById } from "@/lib/db/users";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const dbUser = await getUserById(user.id);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[820px]">
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          Account
        </div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">
          Settings
        </h1>
      </div>

      <SettingsForm
        defaultCurrency={dbUser?.preferredCurrency ?? "USD"}
        defaultLeadDays={dbUser?.reminderLeadDays ?? 3}
        defaultMonthlyBudget={
          dbUser?.monthlyBudget ? Number(dbUser.monthlyBudget) : null
        }
      />
    </div>
  );
}
