"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettingsAction, type SettingsFormState } from "@/app/actions/settings";
import { CURRENCIES } from "@/lib/currencies";

const initial: SettingsFormState = { ok: false };

export function SettingsForm({
  defaultCurrency,
  defaultLeadDays,
}: {
  defaultCurrency: string;
  defaultLeadDays: number;
}) {
  const [state, action, pending] = useActionState(updateSettingsAction, initial);
  const [currency, setCurrency] = useState(defaultCurrency);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="preferredCurrency">Preferred currency</Label>
        <input type="hidden" name="preferredCurrency" value={currency} />
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="preferredCurrency"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fe.preferredCurrency && <p className="text-xs text-destructive">{fe.preferredCurrency}</p>}
        <p className="text-xs text-muted-foreground">Totals and conversions are displayed in this currency.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderLeadDays">Reminder lead time (days)</Label>
        <Input
          id="reminderLeadDays"
          name="reminderLeadDays"
          type="number"
          min={0}
          max={30}
          defaultValue={defaultLeadDays}
        />
        {fe.reminderLeadDays && <p className="text-xs text-destructive">{fe.reminderLeadDays}</p>}
        <p className="text-xs text-muted-foreground">
          We&apos;ll email you this many days before each renewal.
        </p>
      </div>

      {state.ok && <p className="text-sm text-green-600">Saved.</p>}
      {state.error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
