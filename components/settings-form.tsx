"use client";

import { useActionState, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { updateSettingsAction, type SettingsFormState } from "@/app/actions/settings";
import { CURRENCIES } from "@/lib/currencies";

const initial: SettingsFormState = { ok: false };
const LEAD_OPTIONS = [1, 3, 7, 14] as const;

const NOTIF_KEY = "subtracker.notifications";
type NotifState = {
  renewal: boolean;
  trial: boolean;
  budget: boolean;
  digest: boolean;
};
const DEFAULT_NOTIFS: NotifState = {
  renewal: true,
  trial: true,
  budget: true,
  digest: false,
};

export function SettingsForm({
  defaultCurrency,
  defaultLeadDays,
  defaultMonthlyBudget,
}: {
  defaultCurrency: string;
  defaultLeadDays: number;
  defaultMonthlyBudget: number | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initial,
  );
  const [currency, setCurrency] = useState(defaultCurrency);
  const [leadDays, setLeadDays] = useState<number>(
    LEAD_OPTIONS.includes(defaultLeadDays as 1 | 3 | 7 | 14)
      ? defaultLeadDays
      : 3,
  );
  const [budget, setBudget] = useState<string>(
    defaultMonthlyBudget !== null ? String(defaultMonthlyBudget) : "",
  );

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden inputs to submit current values */}
      <input type="hidden" name="preferredCurrency" value={currency} />
      <input type="hidden" name="reminderLeadDays" value={leadDays} />
      <input type="hidden" name="monthlyBudget" value={budget} />

      <SettingsSection
        title="Preferences"
        desc="How totals are shown, and when we ping you."
      >
        <Field
          label="Preferred currency"
          hint="All totals convert to this."
          error={fe.preferredCurrency}
        >
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-9 px-3 rounded-md border border-border-strong bg-surface text-[13px] tnum w-44 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-surface"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Reminder lead time"
          hint="Default days before each renewal."
          error={fe.reminderLeadDays}
        >
          <div className="inline-flex items-center rounded-md border border-border-strong overflow-hidden">
            {LEAD_OPTIONS.map((d) => {
              const active = d === leadDays;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLeadDays(d)}
                  className={`px-3 h-9 text-[12.5px] tnum transition-colors ${
                    active ? "text-white" : "text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  }`}
                  style={active ? { background: "hsl(var(--accent-emerald))" } : undefined}
                >
                  {d}d
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="Monthly budget"
          hint="We'll warn you when projected spend exceeds it."
          error={fe.monthlyBudget}
        >
          <div className="inline-flex items-center h-9 rounded-md border border-border-strong overflow-hidden">
            <span className="px-3 text-[13px] text-muted-foreground bg-surface-muted h-full inline-flex items-center">
              {currency === "USD" ? "$" : currency}
            </span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              type="number"
              min={0}
              step="0.01"
              placeholder="Leave blank to disable"
              className="h-9 w-32 px-2 text-[13px] tnum outline-none bg-surface placeholder:text-faint"
            />
          </div>
        </Field>
      </SettingsSection>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-md text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
          style={{ background: "hsl(var(--accent-emerald))" }}
        >
          {pending ? "Saving…" : "Save preferences"}
        </button>
        {state.ok && (
          <span className="text-[12.5px] text-emerald">Saved.</span>
        )}
        {state.error && (
          <span className="text-[12.5px] text-coral">{state.error}</span>
        )}
      </div>

      <NotificationsSection />

      <SettingsSection
        title="Data"
        desc="Take your data with you, anytime."
      >
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <a
            href="/api/export/subscriptions.csv"
            className="h-9 px-3.5 rounded-md border border-border-strong text-[13px] inline-flex items-center gap-1.5 text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Export CSV
          </a>
          <a
            href="mailto:support@example.com?subject=Delete%20my%20account"
            className="h-9 px-3.5 rounded-md border border-border-strong text-[13px] text-coral hover:bg-coral-tint inline-flex items-center"
          >
            Delete account
          </a>
        </div>
      </SettingsSection>
    </form>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState<NotifState>(DEFAULT_NOTIFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotifState>;
        setNotifs({ ...DEFAULT_NOTIFS, ...parsed });
      }
    } catch {}
    setMounted(true);
  }, []);

  function set<K extends keyof NotifState>(k: K, v: boolean) {
    const next = { ...notifs, [k]: v };
    setNotifs(next);
    if (mounted) localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  const rows: {
    key: keyof NotifState;
    label: string;
    desc: string;
  }[] = [
    {
      key: "renewal",
      label: "Renewal reminders",
      desc: "Heads-up before each charge.",
    },
    {
      key: "trial",
      label: "Trial-ending reminders",
      desc: "Stronger ping before a free trial converts.",
    },
    {
      key: "budget",
      label: "Budget alerts",
      desc: "Once per month if you exceed your cap.",
    },
    {
      key: "digest",
      label: "Weekly digest",
      desc: "Sunday recap of upcoming charges.",
    },
  ];

  return (
    <SettingsSection
      title="Notifications"
      desc="Email-only for now. Preference is stored locally."
    >
      {rows.map((r, i) => {
        const on = notifs[r.key];
        return (
          <div
            key={r.key}
            className={`flex items-center justify-between py-3 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
          >
            <div>
              <div className="text-[13.5px] font-medium">{r.label}</div>
              <div className="text-[12px] text-muted-foreground">{r.desc}</div>
            </div>
            <Toggle on={on} onChange={(v) => set(r.key, v)} label={r.label} />
          </div>
        );
      })}
    </SettingsSection>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 rounded-full transition-colors shrink-0"
      style={{
        background: on
          ? "hsl(var(--accent-emerald))"
          : "hsl(var(--border-strong))",
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left]"
        style={{
          left: on ? "calc(100% - 18px)" : "2px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

function SettingsSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-7">
      <div className="mb-5">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3 border-b border-border last:border-b-0">
      <div className="col-span-12 md:col-span-7">
        <div className="text-[13.5px] font-medium">{label}</div>
        {hint && (
          <div className="text-[12px] text-muted-foreground">{hint}</div>
        )}
        {error && (
          <div className="text-[11.5px] text-coral mt-1">{error}</div>
        )}
      </div>
      <div className="col-span-12 md:col-span-5 md:flex md:justify-end">
        {children}
      </div>
    </div>
  );
}
