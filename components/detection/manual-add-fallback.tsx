import Link from "next/link";
import { PenLine } from "lucide-react";

/**
 * Escape hatch shown alongside the detection flow. When automated detection
 * misses a subscription — which happens for one-time-looking receipts,
 * non-English emails, or services paid via Apple/Google IAP that send no
 * email — the user can still log it manually in one click.
 */
export function ManualAddFallback({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-md border border-dashed bg-muted/30 p-4 text-center text-sm ${className}`}
    >
      <p className="text-muted-foreground">
        Don&apos;t see what you expected?
      </p>
      <Link
        href="/subscriptions/new?from=detect"
        className="inline-flex items-center gap-1.5 font-medium underline hover:no-underline"
      >
        <PenLine className="h-3.5 w-3.5" />
        Add a subscription manually
      </Link>
    </div>
  );
}
