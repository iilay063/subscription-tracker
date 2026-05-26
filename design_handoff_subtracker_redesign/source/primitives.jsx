// Shared icons (simple SVG, no library) and small primitives used by all directions.

const Icon = ({ name, className = "h-4 w-4", strokeWidth = 1.75 }) => {
  const paths = {
    plus: "M12 5v14M5 12h14",
    search: "M11 19a8 8 0 1 1 5.3-14M21 21l-4.3-4.3",
    calendar: "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    arrowRight: "M5 12h14M13 5l7 7-7 7",
    arrowUp: "M12 19V5M5 12l7-7 7 7",
    arrowDown: "M12 5v14M19 12l-7 7-7-7",
    trendUp: "M3 17l6-6 4 4 8-8M21 7h-6M21 7v6",
    trendDown: "M3 7l6 6 4-4 8 8M21 17h-6M21 17v-6",
    bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    sparkles: "M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3zM19 14l.8 2.2 2.2.8-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14zM5 14l.8 2.2 2.2.8-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z",
    alertTriangle: "M10.3 3.86a2 2 0 0 1 3.4 0l8.36 14a2 2 0 0 1-1.7 3.14H3.64a2 2 0 0 1-1.7-3.14l8.36-14zM12 9v4M12 17h.01",
    check: "M20 6 9 17l-5-5",
    x: "M18 6 6 18M6 6l12 12",
    chevronRight: "m9 18 6-6-6-6",
    chevronLeft: "m15 18-6-6 6-6",
    chevronDown: "m6 9 6 6 6-6",
    moreH: "M5 12h.01M12 12h.01M19 12h.01",
    filter: "M3 6h18M6 12h12M10 18h4",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    pencil: "M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
    archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    creditCard: "M3 6h18v12H3zM3 10h18",
    wallet: "M21 12V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M17 14h2",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
    folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    chart: "M3 3v18h18M7 14l4-4 4 4 5-6",
    spark: "M5 12c5-9 9-9 14 0",
    home: "M3 12 12 4l9 8v8a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
};

// Logo monogram tile — used in place of fetched favicons.
const Logo = ({ sub, size = 36, rounded = "rounded-lg", ring = false }) => {
  const bg = sub.categoryColor ?? "#888";
  const initial = sub.initial ?? sub.name.charAt(0);
  return (
    <div
      className={`${rounded} flex shrink-0 items-center justify-center font-semibold text-white ${ring ? "ring-1 ring-black/5" : ""}`}
      style={{
        background: bg,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.02em",
      }}
    >
      {initial}
    </div>
  );
};

window.Icon = Icon;
window.Logo = Logo;
