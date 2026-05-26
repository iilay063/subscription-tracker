"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-helpers";
import { updateUserSettings } from "@/lib/db/users";

const SettingsInput = z.object({
  preferredCurrency: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{3}$/)),
  reminderLeadDays: z
    .string()
    .or(z.number())
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= 0 && n <= 30, "0–30 only"),
  monthlyBudget: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => (v === null || v === undefined || v === "" ? null : Number(v)))
    .refine(
      (v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 1_000_000),
      "Budget must be ≥ 0",
    ),
});

export type SettingsFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const user = await requireUser();
  const parsed = SettingsInput.safeParse({
    preferredCurrency: formData.get("preferredCurrency"),
    reminderLeadDays: formData.get("reminderLeadDays"),
    monthlyBudget: formData.get("monthlyBudget"),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fe[issue.path.join(".") || "_"] = issue.message;
    }
    return { ok: false, error: "Please check the form.", fieldErrors: fe };
  }
  await updateUserSettings(user.id, {
    preferredCurrency: parsed.data.preferredCurrency,
    reminderLeadDays: parsed.data.reminderLeadDays,
    monthlyBudget:
      parsed.data.monthlyBudget === null
        ? null
        : parsed.data.monthlyBudget.toFixed(2),
  });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true };
}
