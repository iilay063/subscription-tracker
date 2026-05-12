"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionFormState } from "@/app/actions/subscriptions";
import { CURRENCIES } from "@/lib/currencies";

const initial: SubscriptionFormState = { ok: false };

type Defaults = {
  name?: string;
  description?: string | null;
  cost?: string | number;
  currency?: string;
  billingCycle?: "monthly" | "yearly" | "weekly" | "custom_days";
  customDays?: number | null;
  nextBillingDate?: string;
  categoryName?: string;
  url?: string | null;
  notes?: string | null;
};

export function SubscriptionForm({
  action,
  defaults,
  submitLabel = "Save",
}: {
  action: (state: SubscriptionFormState, fd: FormData) => Promise<SubscriptionFormState>;
  defaults?: Defaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [cycle, setCycle] = useState<string>(defaults?.billingCycle ?? "monthly");
  const [currency, setCurrency] = useState<string>(defaults?.currency ?? "USD");
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={defaults?.name} placeholder="Netflix" />
        {fe.name && <p className="text-xs text-destructive">{fe.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={defaults?.cost}
            placeholder="9.99"
          />
          {fe.cost && <p className="text-xs text-destructive">{fe.cost}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <input type="hidden" name="currency" value={currency} />
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fe.currency && <p className="text-xs text-destructive">{fe.currency}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing cycle</Label>
          <input type="hidden" name="billingCycle" value={cycle} />
          <Select value={cycle} onValueChange={setCycle}>
            <SelectTrigger id="billingCycle"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="custom_days">Custom (days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customDays">Custom days</Label>
          <Input
            id="customDays"
            name="customDays"
            type="number"
            min="1"
            max="3650"
            disabled={cycle !== "custom_days"}
            defaultValue={defaults?.customDays ?? ""}
            placeholder="e.g. 90"
          />
          {fe.customDays && <p className="text-xs text-destructive">{fe.customDays}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextBillingDate">Next billing date</Label>
        <Input
          id="nextBillingDate"
          name="nextBillingDate"
          type="date"
          required
          defaultValue={defaults?.nextBillingDate}
        />
        {fe.nextBillingDate && <p className="text-xs text-destructive">{fe.nextBillingDate}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryName">Category</Label>
        <Input
          id="categoryName"
          name="categoryName"
          defaultValue={defaults?.categoryName}
          placeholder="Streaming, Software, …"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL (optional)</Label>
        <Input id="url" name="url" type="url" defaultValue={defaults?.url ?? ""} placeholder="https://" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" defaultValue={defaults?.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={defaults?.notes ?? ""} rows={3} />
      </div>

      {state.error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
