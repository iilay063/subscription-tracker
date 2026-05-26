"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type LogoSub = {
  name: string;
  faviconUrl?: string | null;
  categoryColor?: string | null;
};

export function Logo({
  sub,
  size = 32,
  rounded = "rounded-md",
  ring = false,
  className,
}: {
  sub: LogoSub;
  size?: number;
  rounded?: string;
  ring?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const bg = sub.categoryColor ?? "#84807A";
  const initial = sub.name.trim().charAt(0).toUpperCase() || "?";
  const showFavicon = sub.faviconUrl && !imgFailed;

  return (
    <div
      className={cn(
        rounded,
        "flex shrink-0 items-center justify-center overflow-hidden font-semibold text-white",
        ring && "ring-1 ring-black/5",
        className,
      )}
      style={{
        background: showFavicon ? "transparent" : bg,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        letterSpacing: "-0.02em",
      }}
      aria-hidden="true"
    >
      {showFavicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sub.faviconUrl!}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
