"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentOption<V extends string> = {
  value: V;
  label: React.ReactNode;
};

export function Segment<V extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: V;
  onChange: (v: V) => void;
  options: SegmentOption<V>[];
  className?: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-7" : "h-9";
  const px = size === "sm" ? "px-2" : "px-3";
  const tx = size === "sm" ? "text-[11.5px]" : "text-[13px]";
  return (
    <div
      className={cn(
        "inline-flex p-0.5 rounded-md border border-border-strong bg-surface-muted",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              h, px, tx,
              "rounded inline-flex items-center gap-1.5 transition-colors",
              active
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
