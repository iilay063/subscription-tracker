"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Archive, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  Icon: typeof Home;
  exact?: boolean;
};

const NAV: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", Icon: Home, exact: true },
  { href: "/subscriptions", label: "Subscriptions", Icon: CreditCard },
  { href: "/subscriptions/cancelled", label: "Cancelled", Icon: Archive },
  { href: "/settings", label: "Settings", Icon: Settings },
];

function isActive(pathname: string, link: NavLink): boolean {
  if (link.exact) return pathname === link.href;
  if (link.href === "/subscriptions") {
    return pathname.startsWith("/subscriptions") && pathname !== "/subscriptions/cancelled";
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function Sidebar({
  user,
  views,
  signOut,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  views: { name: string; color: string; count: number }[];
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname() ?? "";
  const initials = (user.name ?? user.email ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden md:flex w-[228px] shrink-0 flex-col border-r border-border bg-background sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
          style={{ background: "hsl(var(--accent-emerald))" }}
        >
          S
        </div>
        <div className="text-[14px] font-semibold tracking-tight">
          Sub<span className="text-muted-foreground">·</span>tracker
        </div>
      </div>

      <nav className="px-3 pt-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((link) => {
          const active = isActive(pathname, link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors",
                active
                  ? "bg-surface text-ink shadow-halo font-medium"
                  : "text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
              )}
            >
              <link.Icon className="h-[15px] w-[15px]" strokeWidth={1.75} />
              <span>{link.label}</span>
              {link.href === "/dashboard" && active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: "hsl(var(--accent-emerald))" }}
                />
              )}
            </Link>
          );
        })}

        {views.length > 0 && (
          <>
            <div className="px-2 mt-5 text-[10.5px] uppercase tracking-[0.12em] mb-1.5 text-muted-foreground">
              Views
            </div>
            {views.map((v) => (
              <div
                key={v.name}
                className="px-2.5 py-1.5 text-[12.5px] flex items-center gap-2.5 text-ink-2"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: v.color }}
                />
                <span className="truncate">{v.name}</span>
                <span className="ml-auto text-[11px] tnum text-faint">{v.count}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-border">
        <div className="px-4 py-3 flex items-center gap-2.5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
              style={{ background: "#7A6F5E" }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium truncate">
              {user.name ?? "Account"}
            </div>
            <div className="text-[11.5px] truncate text-muted-foreground">
              {user.email ?? ""}
            </div>
          </div>
        </div>
        <div className="px-2 pb-3 flex items-center gap-1">
          <ThemeToggleInline />
          <form
            action={signOut}
            className="ml-auto"
          >
            <button
              type="submit"
              aria-label="Sign out"
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-ink hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function ThemeToggleInline() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? localStorage.getItem("theme")
      : null) as "light" | "dark" | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (typeof window !== "undefined") {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      );
    }
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-ink hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
