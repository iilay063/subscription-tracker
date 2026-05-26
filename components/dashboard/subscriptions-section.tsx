"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionsTable } from "./subscriptions-table";
import type { DashboardSubscription } from "@/lib/dashboard";

type SortKey = "nextBilling" | "name" | "costDesc" | "costAsc";

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items;
    if (q) {
      out = out.filter((s) => s.name.toLowerCase().includes(q));
    }
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextBilling">Next billing</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="costDesc">Cost (high → low)</SelectItem>
            <SelectItem value="costAsc">Cost (low → high)</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {items.length}
        </span>
      </div>
      <SubscriptionsTable items={filtered} userCurrency={userCurrency} />
    </div>
  );
}
