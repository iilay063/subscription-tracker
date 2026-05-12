import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Nav({ userName }: { userName?: string | null }) {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="font-semibold">
            Subscription Tracker
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/subscriptions/cancelled"
            className="text-muted-foreground hover:text-foreground"
          >
            Cancelled
          </Link>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground"
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {userName ? <span className="hidden sm:inline text-muted-foreground">{userName}</span> : null}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
