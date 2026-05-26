import { requireUser } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/sidebar";
import { signOut } from "@/auth";
import { listActiveSubscriptionsForUser } from "@/lib/db/subscriptions";
import { resolveCategoryColor } from "@/lib/categories-presets";

async function getSidebarViews(userId: string) {
  const rows = await listActiveSubscriptionsForUser(userId);
  const counts = new Map<string, { color: string; count: number }>();
  for (const { sub: _sub, category } of rows) {
    const name = category?.name ?? "Uncategorized";
    const prev = counts.get(name);
    counts.set(name, {
      color: resolveCategoryColor(category?.name ?? null),
      count: (prev?.count ?? 0) + 1,
    });
  }
  return Array.from(counts.entries())
    .map(([name, v]) => ({ name, color: v.color, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const views = await getSidebarViews(user.id);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar
        user={{ name: user.name, email: user.email, image: user.image }}
        views={views}
        signOut={signOutAction}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
