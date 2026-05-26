type Slice = { label: string; value: number; color: string };

export function Donut({
  data,
  size = 150,
  stroke = 16,
  trackColor = "hsl(var(--donut-track))",
}: {
  data: Slice[];
  size?: number;
  stroke?: number;
  trackColor?: string;
}) {
  const radius = (size - stroke) / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
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
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * circumference;
        const gap = circumference - dash;
        const offset = -cumulative * circumference;
        cumulative += frac;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(0, dash - 2)} ${gap + 2}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}
