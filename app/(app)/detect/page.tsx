import { requireUser } from "@/lib/auth-helpers";
import { getUserById } from "@/lib/db/users";
import { DetectionActionsPanel } from "@/components/detection/detection-actions-panel";

export const dynamic = "force-dynamic";

export default async function DetectPage() {
  const user = await requireUser();
  const dbUser = await getUserById(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Detect subscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Skip the manual entry — let us find subscriptions from your email
          receipts. You review everything before it&apos;s saved.
        </p>
      </div>

      <DetectionActionsPanel
        lastScannedLabel={timeAgo(dbUser?.gmailLastScannedAt ?? null)}
      />
    </div>
  );
}

function timeAgo(date: Date | null): string | null {
  if (!date) return null;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
