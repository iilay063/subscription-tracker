"use client";

type Slice = { label: string; value: number; color: string };

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  // Single full-circle arc would render as nothing; offset slightly.
  const safeEnd = endAngle - startAngle >= 360 ? endAngle - 0.001 : endAngle;
  const start = polarToCartesian(cx, cy, r, safeEnd);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = safeEnd - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function Donut({
  data,
  size = 150,
  stroke = 16,
  trackColor = "hsl(var(--donut-track))",
  hoveredIndex,
  onHover,
}: {
  data: Slice[];
  size?: number;
  stroke?: number;
  trackColor?: string;
  hoveredIndex?: number | null;
  onHover?: (index: number | null) => void;
}) {
  const radius = (size - stroke) / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const gapDeg = data.length > 1 ? 2 : 0;

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const frac = d.value / total;
    const angleSpan = frac * 360;
    const startAngle = cumulative + gapDeg / 2;
    const endAngle = cumulative + angleSpan - gapDeg / 2;
    cumulative += angleSpan;
    return {
      d,
      i,
      path:
        angleSpan > gapDeg
          ? describeArc(cx, cy, radius, startAngle, endAngle)
          : null,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      {slices.map(({ d, i, path }) =>
        path ? (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            className="transition-opacity duration-150 cursor-pointer"
            style={{
              opacity:
                hoveredIndex === null || hoveredIndex === undefined
                  ? 1
                  : hoveredIndex === i
                    ? 1
                    : 0.35,
              pointerEvents: "stroke",
            }}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
          />
        ) : null,
      )}
    </svg>
  );
}
