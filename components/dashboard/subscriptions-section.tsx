"use client";

import { useMemo, useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { SubscriptionsTable } from "./subscriptions-table";
import type { DashboardSubscription } from "@/lib/dashboard";

type SortKey = "nextBilling" | "name" | "costDesc" | "costAsc";

const SORT_LABEL: Record<SortKey, string> = {
  nextBilling: "Next billing",
  name: "Name A–Z",
  costDesc: "Cost (high → low)",
  costAsc: "Cost (low → high)",
};

export function SubscriptionsSection({
  items,
  userCurrency,
  categories,
}: {
  items: DashboardSubscription[];
  userCurrency: string;
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("nextBilling");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items;
    if (q) out = out.filter((s) => s.name.toLowerCase().includes(q));
    if (category !== "all") {
      out = out.filter(
        (s) => (s.categoryName ?? "Uncategorized") === category,
      );
    }
    out = [...out];
    switch (sort) {
      case "name":
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "costDesc":
        out.sort((a, b) => b.monthlyInUserCurrency - a.monthlyInUserCurrency);
        break;
      case "costAsc":
        out.sort((a, b) => a.monthlyInUserCurrency - b.monthlyInUserCurrency);
        break;
      case "nextBilling":
      default:
        out.sort(
          (a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime(),
        );
        break;
    }
    return out;
  }, [items, query, category, sort]);

  return (
    <section className="rounded-xl border border-border bg-surface mb-12 shadow-halo">
      <header className="flex flex-wrap items-center justify-between gap-3 px-7 pt-6 pb-4">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            Active
          </div>
          <div className="mt-1 text-[15px] font-medium">
            {items.length} {items.length === 1 ? "subscription" : "subscriptions"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 pl-7 pr-3 rounded-md border border-border-strong bg-surface text-[12.5px] w-44 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-surface placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="h-8 px-3 rounded-md border border-border-strong text-[12.5px] inline-flex items-center gap-1.5 text-ink-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            >
              <Filter className="h-3 w-3" strokeWidth={1.75} />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-9 z-20 w-56 rounded-md border border-border bg-surface shadow-halo p-3 space-y-3">
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                    Category
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-8 rounded-md border border-border-strong bg-surface px-2 text-[12.5px] outline-none"
                  >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                    Sort by
                  </div>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="w-full h-8 rounded-md border border-border-strong bg-surface px-2 pr-7 text-[12.5px] outline-none appearance-none"
                    >
                      {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                        <option key={k} value={k}>
                          {SORT_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Showing {filtered.length} of {items.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <SubscriptionsTable items={filtered} userCurrency={userCurrency} />
    </section>
  );
}
