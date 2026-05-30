"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmDetectedAction } from "@/app/actions/detection";
import type {
  DedupeCandidate,
  DeduplicationResolution,
} from "@/lib/detection/types";

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const CYCLE_LABEL: Record<string, string> = {
  monthly: "/mo",
  yearly: "/yr",
  weekly: "/wk",
  custom_days: "/cycle",
};

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Default decision per candidate: skip if it looks like an exact duplicate. */
function defaultResolution(c: DedupeCandidate): DeduplicationResolution {
  if (!c.existingMatch) return { action: "add" };
  const priceChanged =
    Math.abs(c.existingMatch.cost - c.detected.cost) > 0.001;
  return priceChanged
    ? { action: "update_price", existingId: c.existingMatch.id }
    : { action: "skip" };
}

export function DedupReviewPanel({
  candidates,
  onDone,
}: {
  candidates: DedupeCandidate[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resolutions, setResolutions] = useState<DeduplicationResolution[]>(
    () => candidates.map(defaultResolution),
  );
  const [error, setError] = useState<string | null>(null);

  function setResolution(index: number, resolution: DeduplicationResolution) {
    setResolutions((prev) => {
      const next = [...prev];
      next[index] = resolution;
      return next;
    });
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const payload = candidates.map((c, i) => ({
        detected: c.detected,
        resolution: resolutions[i],
      }));
      const res = await confirmDetectedAction(payload);
      if (!res.ok) {
        setError(res.error ?? "Could not save changes.");
        return;
      }
      onDone?.();
      router.refresh();
    });
  }

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No subscriptions were found. Try a different receipt or scan again.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {candidates.length} subscription
        {candidates.length === 1 ? "" : "s"}. Review each one before saving —
        nothing is added until you confirm.
      </p>

      <div className="space-y-3">
        {candidates.map((c, i) => {
          const d = c.detected;
          const current = resolutions[i];
          const priceChanged =
            c.existingMatch &&
            Math.abs(c.existingMatch.cost - d.cost) > 0.001;

          return (
            <Card key={i}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CONFIDENCE_STYLES[d.confidence]
                      }`}
                    >
                      {d.confidence}
                    </span>
                  </div>
                  <span className="text-sm">
                    {money(d.cost, d.currency)}
                    <span className="text-muted-foreground">
                      {CYCLE_LABEL[d.billingCycle] ?? ""}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Next billing {d.nextBillingDate}
                  {d.sourceNote ? ` · ${d.sourceNote}` : ""}
                </p>

                {c.existingMatch ? (
                  <div className="rounded-md border bg-muted/40 p-3 text-sm">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Possible match: you already track{" "}
                      <span className="font-semibold text-foreground">
                        {c.existingMatch.name}
                      </span>{" "}
                      at {money(c.existingMatch.cost, c.existingMatch.currency)}.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {priceChanged && (
                        <Choice
                          label="Update price"
                          active={current.action === "update_price"}
                          onClick={() =>
                            setResolution(i, {
                              action: "update_price",
                              existingId: c.existingMatch!.id,
                            })
                          }
                        />
                      )}
                      <Choice
                        label="Track separately"
                        active={current.action === "duplicate"}
                        onClick={() =>
                          setResolution(i, { action: "duplicate" })
                        }
                      />
                      <Choice
                        label="Skip"
                        active={current.action === "skip"}
                        onClick={() => setResolution(i, { action: "skip" })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Choice
                      label="Add"
                      active={current.action === "add"}
                      onClick={() => setResolution(i, { action: "add" })}
                    />
                    <Choice
                      label="Skip"
                      active={current.action === "skip"}
                      onClick={() => setResolution(i, { action: "skip" })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={confirm} disabled={pending}>
          {pending ? "Saving…" : "Confirm selections"}
        </Button>
      </div>
    </div>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}
