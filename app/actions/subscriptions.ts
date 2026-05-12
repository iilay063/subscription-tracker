"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionById,
  reactivateSubscription,
  updateSubscription,
} from "@/lib/db/subscriptions";
import { findOrCreateCategory } from "@/lib/db/categories";

const CURRENCY = /^[A-Z]{3}$/;

const SubscriptionInput = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional().or(z.literal("")),
    cost: z
      .string()
      .or(z.number())
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v >= 0, "Cost must be ≥ 0"),
    currency: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .pipe(z.string().regex(CURRENCY, "Use a 3-letter currency code")),
    billingCycle: z.enum(["monthly", "yearly", "weekly", "custom_days"]),
    customDays: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((v) => (v === null || v === undefined || v === "" ? null : Number(v)))
      .refine(
        (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 3650),
        "custom days must be 1–3650",
      ),
    nextBillingDate: z
      .string()
      .min(1)
      .transform((s) => new Date(s))
      .refine((d) => !isNaN(d.getTime()), "Invalid date"),
    categoryName: z.string().trim().max(60).optional().or(z.literal("")),
    url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .transform((s) => (s ? s : null)),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (d) => d.billingCycle !== "custom_days" || (d.customDays !== null),
    { message: "customDays is required for custom cycle", path: ["customDays"] },
  );

export type SubscriptionFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  const data = {
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    cost: formData.get("cost"),
    currency: formData.get("currency"),
    billingCycle: formData.get("billingCycle"),
    customDays: formData.get("customDays"),
    nextBillingDate: formData.get("nextBillingDate"),
    categoryName: formData.get("categoryName") ?? "",
    url: formData.get("url") ?? "",
    notes: formData.get("notes") ?? "",
  };
  return SubscriptionInput.safeParse(data);
}

export async function addSubscriptionAction(
  _prev: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const user = await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please check the form.", fieldErrors };
  }
  const v = parsed.data;
  let categoryId: string | null = null;
  if (v.categoryName) {
    const cat = await findOrCreateCategory(user.id, v.categoryName);
    categoryId = cat.id;
  }
  await createSubscription({
    userId: user.id,
    categoryId,
    name: v.name,
    description: v.description || null,
    cost: v.cost.toFixed(2),
    currency: v.currency,
    billingCycle: v.billingCycle,
    customDays: v.customDays,
    nextBillingDate: v.nextBillingDate,
    url: v.url,
    notes: v.notes || null,
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateSubscriptionAction(
  id: string,
  _prev: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const user = await requireUser();
  const existing = await getSubscriptionById(id, user.id);
  if (!existing) return { ok: false, error: "Not found" };
  const parsed = parseForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "_"] = issue.message;
    }
    return { ok: false, error: "Please check the form.", fieldErrors };
  }
  const v = parsed.data;
  let categoryId: string | null = existing.categoryId;
  if (v.categoryName) {
    const cat = await findOrCreateCategory(user.id, v.categoryName);
    categoryId = cat.id;
  }
  await updateSubscription(id, user.id, {
    categoryId,
    name: v.name,
    description: v.description || null,
    cost: v.cost.toFixed(2),
    currency: v.currency,
    billingCycle: v.billingCycle,
    customDays: v.customDays,
    nextBillingDate: v.nextBillingDate,
    url: v.url,
    notes: v.notes || null,
  });
  revalidatePath("/dashboard");
  revalidatePath(`/subscriptions/${id}`);
  redirect(`/subscriptions/${id}`);
}

export async function cancelSubscriptionAction(id: string) {
  const user = await requireUser();
  await cancelSubscription(id, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/subscriptions/cancelled");
}

export async function reactivateSubscriptionAction(id: string) {
  const user = await requireUser();
  await reactivateSubscription(id, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/subscriptions/cancelled");
}
