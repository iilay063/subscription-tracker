"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatMoney } from "@/lib/money";

type Datum = { category: string; color: string; monthly: number };

export function CategoryChart({ data, currency }: { data: Datum[]; currency: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No active subscriptions yet.
      </div>
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="monthly"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => formatMoney(v, currency)}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
