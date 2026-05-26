// ECLIPSE — Dark fintech direction (Linear / Vercel vibe).
// Near-black canvas, hairline borders, violet accent, sharp grid, calendar hero.

const eclipseTokens = {
  bg: "#0A0A0C",
  bg2: "#0F1014",
  surface: "#111114",
  surfaceHi: "#16171C",
  border: "#1E1F25",
  borderStrong: "#2A2B33",
  ink: "#ECECEE",
  ink2: "#B6B5BC",
  muted: "#75747E",
  faint: "#4D4C56",
};

const eclipseCatColor = (cat) => ({
  "Entertainment": "#E18B6B",
  "Productivity": "#7C9CFF",
  "Software": "#8C6FFF",
  "Cloud Storage": "#5DC2D0",
  "News": "#C9A87C",
  "Health": "#E879B7",
}[cat] ?? "#75747E");

function EclipseShell({ accent, screen, setScreen, children }) {
  const navItems = [
    { id: "dashboard", label: "Overview", icon: "home", shortcut: "O" },
    { id: "detail", label: "Subscriptions", icon: "creditCard", shortcut: "S" },
    { id: "cancelled", label: "Archive", icon: "archive", shortcut: "A" },
    { id: "settings", label: "Settings", icon: "settings", shortcut: "," },
  ];
  return (
    <div className="flex min-h-screen w-full" style={{
      background: `radial-gradient(1200px 600px at 20% -10%, rgba(140,111,255,0.08), transparent 50%), ${eclipseTokens.bg}`,
      color: eclipseTokens.ink,
      fontFamily: "Geist, Inter, sans-serif",
    }}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-[228px] shrink-0 flex-col border-r" style={{ borderColor: eclipseTokens.border }}>
        <div className="px-4 h-12 flex items-center gap-2 border-b" style={{ borderColor: eclipseTokens.border }}>
          <div className="h-5 w-5 rounded-[5px] flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: accent }}>
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="white" strokeWidth="1.5"><circle cx="6" cy="6" r="3" /></svg>
          </div>
          <div className="text-[13px] font-medium tracking-tight">subtrack</div>
          <span className="ml-auto text-[10.5px] tnum px-1.5 py-0.5 rounded" style={{ background: eclipseTokens.surface, color: eclipseTokens.muted }}>v2</span>
        </div>

        {/* Workspace pill */}
        <div className="px-3 py-3 border-b" style={{ borderColor: eclipseTokens.border }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}` }}>
            <div className="h-5 w-5 rounded flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: "#3D3A4A" }}>IW</div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium truncate">Personal</div>
            </div>
            <Icon name="chevronDown" className="h-3 w-3" />
          </div>
        </div>

        <nav className="px-2 py-3 flex flex-col gap-0.5">
          <div className="px-2 text-[10.5px] uppercase tracking-[0.1em] mb-1.5" style={{ color: eclipseTokens.muted }}>Workspace</div>
          {navItems.map((n) => {
            const active = n.id === screen;
            return (
              <button
                key={n.id}
                onClick={() => setScreen(n.id)}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-left transition-colors"
                style={{
                  background: active ? eclipseTokens.surfaceHi : "transparent",
                  color: active ? eclipseTokens.ink : eclipseTokens.ink2,
                  border: active ? `1px solid ${eclipseTokens.border}` : "1px solid transparent",
                }}
              >
                <Icon name={n.icon} className="h-[14px] w-[14px]" />
                <span className="flex-1">{n.label}</span>
                <span className="text-[10.5px] tnum px-1.5 py-px rounded" style={{ background: eclipseTokens.surface, color: eclipseTokens.faint }}>{n.shortcut}</span>
              </button>
            );
          })}

          <div className="px-2 mt-5 text-[10.5px] uppercase tracking-[0.1em] mb-1.5" style={{ color: eclipseTokens.muted }}>Views</div>
          <div className="px-2 py-1.5 text-[12.5px] flex items-center gap-2.5" style={{ color: eclipseTokens.ink2 }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#E18B6B" }} /> Entertainment <span className="ml-auto text-[11px] tnum" style={{ color: eclipseTokens.faint }}>4</span>
          </div>
          <div className="px-2 py-1.5 text-[12.5px] flex items-center gap-2.5" style={{ color: eclipseTokens.ink2 }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7C9CFF" }} /> Productivity <span className="ml-auto text-[11px] tnum" style={{ color: eclipseTokens.faint }}>3</span>
          </div>
          <div className="px-2 py-1.5 text-[12.5px] flex items-center gap-2.5" style={{ color: eclipseTokens.ink2 }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#8C6FFF" }} /> Software <span className="ml-auto text-[11px] tnum" style={{ color: eclipseTokens.faint }}>3</span>
          </div>
        </nav>

        <div className="mt-auto px-3 py-3 border-t flex items-center gap-2.5 text-[12.5px]" style={{ borderColor: eclipseTokens.border }}>
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <div className="min-w-0 flex-1 truncate" style={{ color: eclipseTokens.ink2 }}>Ilay W.</div>
          <Icon name="logout" className="h-3.5 w-3.5" />
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="h-12 px-6 flex items-center justify-between border-b" style={{ borderColor: eclipseTokens.border, background: "rgba(10,10,12,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-2 text-[12.5px]" style={{ color: eclipseTokens.muted }}>
            <span>Personal</span>
            <Icon name="chevronRight" className="h-3 w-3" />
            <span style={{ color: eclipseTokens.ink }}>{screen === "dashboard" ? "Overview" : screen === "detail" ? "Subscriptions" : screen === "cancelled" ? "Archive" : "Settings"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md text-[12px]" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}`, color: eclipseTokens.muted }}>
              <Icon name="search" className="h-3 w-3" /> Search… <span className="ml-3 tnum px-1 rounded" style={{ background: eclipseTokens.bg2, color: eclipseTokens.faint }}>⌘K</span>
            </div>
            <button className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}` }}>
              <Icon name="bell" className="h-3.5 w-3.5" />
            </button>
            <button className="h-7 px-2.5 rounded-md text-[12px] inline-flex items-center gap-1 text-white" style={{ background: accent }}>
              <Icon name="plus" className="h-3 w-3" /> Add
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

// --- Dashboard ---
function EclipseDashboard({ accent }) {
  const monthly = window.MONTHLY_TOTAL;
  const yearly = window.YEARLY_TOTAL;
  const budget = window.SAMPLE_USER.monthlyBudget;
  const pct = (monthly / budget) * 100;
  const trials = window.SUBSCRIPTIONS.filter((s) => s.isTrial);
  const breakdown = window.CATEGORY_BREAKDOWN.map((c) => ({ ...c, color: eclipseCatColor(c.category) }));
  const totalMonthly = breakdown.reduce((s, x) => s + x.monthly, 0);

  return (
    <div className="px-8 py-7 max-w-[1280px] w-full">
      {/* Headline + stats inline */}
      <div className="mb-6">
        <div className="text-[11.5px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>May 2026</div>
        <h1 className="mt-1 text-[24px] font-medium tracking-[-0.01em]">Overview</h1>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-12 gap-px rounded-xl overflow-hidden border mb-6" style={{ borderColor: eclipseTokens.border, background: eclipseTokens.border }}>
        {[
          { label: "Monthly", value: window.fmt(monthly), sub: "+$9.00 vs Apr", trend: "up" },
          { label: "Yearly projected", value: window.fmtNoCents(yearly), sub: "12-month run rate" },
          { label: "Active", value: window.SUBSCRIPTIONS.length.toString(), sub: `${trials.length} trial${trials.length === 1 ? "" : "s"}` },
          { label: "Budget", value: `${Math.round(pct)}%`, sub: `${window.fmt(budget - monthly < 0 ? 0 : budget - monthly)} left`, trend: pct > 80 ? "warn" : null },
        ].map((s, i) => (
          <div key={i} className="col-span-6 md:col-span-3 p-5" style={{ background: eclipseTokens.surface }}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>{s.label}</div>
              {s.trend === "up" && <span className="text-[10.5px] tnum px-1.5 py-0.5 rounded-md" style={{ background: "rgba(140,111,255,0.12)", color: "#A28CFF" }}>+4.6%</span>}
              {s.trend === "warn" && <span className="text-[10.5px] tnum px-1.5 py-0.5 rounded-md" style={{ background: "rgba(225,139,107,0.12)", color: "#E18B6B" }}>watch</span>}
            </div>
            <div className="mt-3 tnum text-[28px] font-medium tracking-[-0.02em]">{s.value}</div>
            <div className="text-[11.5px] mt-1" style={{ color: eclipseTokens.muted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Hero — Calendar grid */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        <section className="col-span-12 lg:col-span-8 rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
          <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: eclipseTokens.border }}>
            <div className="flex items-center gap-3">
              <div className="text-[13.5px] font-medium">May 2026</div>
              <div className="text-[11.5px]" style={{ color: eclipseTokens.muted }}>· {window.UPCOMING.length} charges upcoming</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="h-6 w-6 rounded flex items-center justify-center" style={{ background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}` }}>
                <Icon name="chevronLeft" className="h-3 w-3" />
              </button>
              <button className="h-6 w-6 rounded flex items-center justify-center" style={{ background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}` }}>
                <Icon name="chevronRight" className="h-3 w-3" />
              </button>
            </div>
          </header>
          <EclipseCalendar accent={accent} />
        </section>

        {/* Spending mix */}
        <section className="col-span-12 lg:col-span-4 rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
          <header className="px-5 py-3.5 border-b" style={{ borderColor: eclipseTokens.border }}>
            <div className="text-[13.5px] font-medium">Spending mix</div>
          </header>
          <div className="p-5">
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
              <Donut data={breakdown} total={totalMonthly} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>Monthly</div>
                <div className="tnum text-[22px] font-medium mt-0.5">{window.fmtNoCents(monthly)}</div>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {breakdown.slice(0, 4).map((c, i) => (
                <li key={i} className="flex items-center text-[12.5px] gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1" style={{ color: eclipseTokens.ink2 }}>{c.category}</span>
                  <span className="tnum" style={{ color: eclipseTokens.muted }}>{Math.round((c.monthly / totalMonthly) * 100)}%</span>
                  <span className="tnum w-16 text-right">{window.fmt(c.monthly)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Trials banner */}
      {trials.length > 0 && (
        <div className="mb-6 rounded-xl border p-4 flex items-start gap-3" style={{ background: "rgba(140,111,255,0.06)", borderColor: "rgba(140,111,255,0.25)" }}>
          <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ background: "rgba(140,111,255,0.15)" }}>
            <Icon name="sparkles" className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium">{trials.length} trials converting soon</div>
            <div className="text-[11.5px] mt-0.5" style={{ color: eclipseTokens.ink2 }}>
              {trials.map((t) => `${t.name} (${window.daysUntil(t.trialEndsAt)}d)`).join(" · ")}
            </div>
          </div>
          <button className="text-[12px] px-2.5 h-7 rounded-md" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}` }}>Review</button>
        </div>
      )}

      {/* Subscriptions list — compact */}
      <section className="rounded-xl border mb-10" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
        <header className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: eclipseTokens.border }}>
          <div className="flex items-center gap-2">
            <div className="text-[13.5px] font-medium">Subscriptions</div>
            <span className="text-[11px] tnum px-1.5 py-0.5 rounded" style={{ background: eclipseTokens.surfaceHi, color: eclipseTokens.muted }}>{window.SUBSCRIPTIONS.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-7 px-2 text-[12px] rounded inline-flex items-center gap-1" style={{ color: eclipseTokens.ink2, background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}` }}>
              <Icon name="filter" className="h-3 w-3" /> All
            </button>
            <button className="h-7 px-2 text-[12px] rounded inline-flex items-center gap-1" style={{ color: eclipseTokens.muted }}>
              Sort: Next charge <Icon name="chevronDown" className="h-3 w-3" />
            </button>
          </div>
        </header>
        <EclipseList items={window.SUBSCRIPTIONS} />
      </section>
    </div>
  );
}

function EclipseCalendar({ accent }) {
  // Build a 6-week grid for May 2026 (today = May 26)
  const today = window.TODAY;
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  // pad
  for (let i = 0; i < startDay; i++) {
    const prevMonth = new Date(year, month, -startDay + i + 1);
    cells.push({ date: prevMonth, outside: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), outside: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, outside: next.getMonth() !== month });
  }
  const subsByDay = (dt) =>
    window.SUBSCRIPTIONS.filter((s) => {
      return s.nextBilling.getFullYear() === dt.getFullYear() && s.nextBilling.getMonth() === dt.getMonth() && s.nextBilling.getDate() === dt.getDate();
    });
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="p-3">
      <div className="grid grid-cols-7 gap-px mb-1">
        {dayNames.map((n, i) => (
          <div key={i} className="text-center text-[10.5px] uppercase py-1" style={{ color: eclipseTokens.muted }}>{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden" style={{ background: eclipseTokens.border }}>
        {cells.map((c, i) => {
          const subs = subsByDay(c.date);
          const isToday = c.date.toDateString() === today.toDateString();
          const total = subs.reduce((s, x) => s + x.cost, 0);
          return (
            <div key={i} className="aspect-square min-h-[72px] p-2 relative flex flex-col" style={{ background: c.outside ? eclipseTokens.bg2 : eclipseTokens.surface }}>
              <div className="flex items-center justify-between">
                <div className={`text-[11px] tnum ${isToday ? "font-semibold" : ""}`} style={{ color: c.outside ? eclipseTokens.faint : isToday ? eclipseTokens.ink : eclipseTokens.ink2 }}>
                  {c.date.getDate()}
                </div>
                {isToday && <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />}
              </div>
              <div className="mt-auto flex flex-col gap-0.5">
                {subs.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex items-center gap-1 text-[10px] truncate rounded px-1 py-0.5" style={{ background: eclipseTokens.surfaceHi, color: eclipseTokens.ink2, borderLeft: `2px solid ${eclipseCatColor(s.category)}` }}>
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
                {subs.length > 2 && (
                  <div className="text-[10px] tnum" style={{ color: eclipseTokens.muted }}>+{subs.length - 2} more</div>
                )}
                {subs.length > 0 && (
                  <div className="text-[10px] tnum mt-0.5" style={{ color: eclipseTokens.muted }}>{window.fmt(total)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Donut({ data, total }) {
  // SVG donut chart
  const size = 200;
  const radius = 78;
  const strokeWidth = 18;
  const cx = size / 2;
  const cy = size / 2;
  let cum = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={eclipseTokens.border} strokeWidth={strokeWidth} />
      {data.map((d, i) => {
        const frac = d.monthly / total;
        const circumference = 2 * Math.PI * radius;
        const dash = frac * circumference;
        const gap = circumference - dash;
        const offset = -cum * circumference;
        cum += frac;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash - 2} ${gap + 2}`}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}

function EclipseList({ items }) {
  return (
    <ul>
      {items.map((s, i) => {
        const days = window.daysUntil(s.nextBilling);
        return (
          <li key={s.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3 border-b last:border-b-0 hover:bg-white/[0.02]" style={{ borderColor: eclipseTokens.border }}>
            <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
              <Logo sub={s} size={28} rounded="rounded-md" />
              <div className="min-w-0">
                <div className="text-[13px] font-medium flex items-center gap-2 truncate">
                  {s.name}
                  {s.isTrial && (
                    <span className="text-[10px] px-1.5 py-px rounded" style={{ background: "rgba(140,111,255,0.15)", color: "#A28CFF" }}>Trial</span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: eclipseTokens.muted }}>{s.domain}</div>
              </div>
            </div>
            <div className="hidden md:flex col-span-3 items-center gap-1.5 text-[12px]" style={{ color: eclipseTokens.ink2 }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: eclipseCatColor(s.category) }} />
              {s.category}
            </div>
            <div className="hidden md:block col-span-2 text-[12px]" style={{ color: eclipseTokens.ink2 }}>
              <div className="tnum">{window.fmtDate(s.nextBilling)}</div>
              <div className="text-[10.5px]" style={{ color: eclipseTokens.muted }}>in {days}d</div>
            </div>
            <div className="col-span-4 md:col-span-2 text-right">
              <div className="tnum text-[13px] font-medium flex items-center justify-end gap-1.5">
                {s.priceChange && (
                  <span className="text-[10.5px] tnum px-1 py-0.5 rounded inline-flex items-center" style={{ background: "rgba(225,139,107,0.12)", color: "#E18B6B" }}>
                    <Icon name="arrowUp" className="h-2.5 w-2.5" />{window.fmt(s.priceChange.change)}
                  </span>
                )}
                {window.fmt(s.cost)}
              </div>
              <div className="text-[10.5px] capitalize" style={{ color: eclipseTokens.muted }}>/{s.cycle.replace("ly", "")}</div>
            </div>
            <div className="col-span-3 md:col-span-1 flex justify-end">
              <button className="h-6 w-6 rounded flex items-center justify-center" style={{ color: eclipseTokens.muted }}>
                <Icon name="moreH" className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// --- Detail ---
function EclipseDetail({ accent }) {
  const sub = window.SUBSCRIPTIONS.find((s) => s.id === "spotify");
  const history = Array.from({ length: 10 }).map((_, i) => {
    const dt = new Date(window.TODAY);
    dt.setMonth(dt.getMonth() - i - 1);
    dt.setDate(26);
    return { date: dt, amount: i < 4 ? 11.99 : 10.99 };
  });
  return (
    <div className="px-8 py-7 max-w-[1100px] w-full">
      <button className="text-[12px] inline-flex items-center gap-1 mb-5" style={{ color: eclipseTokens.muted }}>
        <Icon name="chevronLeft" className="h-3 w-3" /> Subscriptions
      </button>

      <header className="flex items-start gap-5 mb-7">
        <Logo sub={sub} size={56} rounded="rounded-xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tnum px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgba(125,200,140,0.12)", color: "#7DC88C" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7DC88C" }} /> Active
            </span>
            <span className="text-[12px]" style={{ color: eclipseTokens.muted }}>{sub.domain}</span>
          </div>
          <h1 className="mt-2 text-[24px] font-medium tracking-[-0.01em]">{sub.name}</h1>
          <div className="mt-1 text-[12.5px]" style={{ color: eclipseTokens.muted }}>
            Active since {window.fmtDateLong(sub.startedAt)} · {sub.cycle} · {sub.currency}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-8 px-3 text-[12.5px] rounded-md" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}` }}>Edit</button>
          <button className="h-8 px-3 text-[12.5px] rounded-md" style={{ background: eclipseTokens.surface, border: `1px solid ${eclipseTokens.border}`, color: "#E18B6B" }}>Cancel</button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Big stats */}
          <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border" style={{ background: eclipseTokens.border, borderColor: eclipseTokens.border }}>
            {[
              { l: "Cost", v: window.fmt(sub.cost), s: "per month" },
              { l: "Next charge", v: window.fmtDate(sub.nextBilling), s: `in ${window.daysUntil(sub.nextBilling)} days` },
              { l: "Lifetime", v: window.fmtNoCents(history.reduce((a, h) => a + h.amount, 0) + 220), s: "since Aug 2019" },
            ].map((s, i) => (
              <div key={i} className="p-5" style={{ background: eclipseTokens.surface }}>
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>{s.l}</div>
                <div className="mt-2 tnum text-[24px] font-medium tracking-[-0.02em]">{s.v}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: eclipseTokens.muted }}>{s.s}</div>
              </div>
            ))}
          </div>

          {/* History chart */}
          <section className="rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
            <header className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: eclipseTokens.border }}>
              <div className="text-[13px] font-medium">Billing history</div>
              <div className="text-[11px]" style={{ color: eclipseTokens.muted }}>Last 10 months</div>
            </header>
            <div className="p-5">
              <HistoryBars data={history.slice().reverse()} accent={accent} />
            </div>
            <div className="border-t" style={{ borderColor: eclipseTokens.border }}>
              {history.slice(0, 6).map((h, i) => (
                <div key={i} className="px-5 py-2.5 flex items-center justify-between border-b last:border-b-0 text-[12.5px]" style={{ borderColor: eclipseTokens.border }}>
                  <div className="tnum" style={{ color: eclipseTokens.ink2 }}>{window.fmtDateLong(h.date)}</div>
                  <div className="text-[11.5px]" style={{ color: eclipseTokens.muted }}>Visa ·· 4242</div>
                  <div className="tnum font-medium">{window.fmt(h.amount)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <div className="rounded-xl border p-5" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
            <div className="text-[13px] font-medium mb-3">Details</div>
            <dl className="text-[12.5px] space-y-2.5">
              <div className="flex justify-between"><dt style={{ color: eclipseTokens.muted }}>Category</dt><dd className="inline-flex items-center gap-1.5" style={{ color: eclipseTokens.ink2 }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: eclipseCatColor(sub.category) }} /> {sub.category}</dd></div>
              <div className="flex justify-between"><dt style={{ color: eclipseTokens.muted }}>Billing cycle</dt><dd className="capitalize" style={{ color: eclipseTokens.ink2 }}>{sub.cycle}</dd></div>
              <div className="flex justify-between"><dt style={{ color: eclipseTokens.muted }}>Currency</dt><dd className="tnum" style={{ color: eclipseTokens.ink2 }}>{sub.currency}</dd></div>
              <div className="flex justify-between"><dt style={{ color: eclipseTokens.muted }}>Reminder</dt><dd style={{ color: eclipseTokens.ink2 }}>3 days before</dd></div>
              {sub.priceChange && (
                <div className="flex justify-between"><dt style={{ color: eclipseTokens.muted }}>Last change</dt><dd className="tnum" style={{ color: "#E18B6B" }}>+{window.fmt(sub.priceChange.change)}</dd></div>
              )}
            </dl>
          </div>
          <div className="rounded-xl border p-5" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
            <div className="text-[13px] font-medium mb-2">Notes</div>
            <p className="text-[12.5px] leading-[1.6]" style={{ color: eclipseTokens.ink2 }}>
              Family plan — shared with sister. Renews on the 26th.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HistoryBars({ data, accent }) {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 h-[140px]">
      {data.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full rounded-t-sm relative group" style={{ background: i === data.length - 1 ? accent : "#3D3A4A", height: `${(h.amount / max) * 100}%` }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] tnum opacity-0 group-hover:opacity-100" style={{ color: eclipseTokens.ink }}>{window.fmt(h.amount)}</div>
          </div>
          <div className="text-[10px] tnum" style={{ color: eclipseTokens.muted }}>{h.date.toLocaleDateString("en-US", { month: "short" })}</div>
        </div>
      ))}
    </div>
  );
}

// --- Settings ---
function EclipseSettings({ accent }) {
  const sections = [
    {
      id: "general",
      label: "General",
      fields: [
        { l: "Display name", desc: "Shown across the app.", v: "Ilay Weizman", kind: "input" },
        { l: "Email", desc: "Where reminders are sent.", v: "ilay@example.com", kind: "input" },
        { l: "Preferred currency", desc: "All totals convert to this.", v: "USD — US Dollar", kind: "select", options: ["USD — US Dollar", "EUR — Euro", "GBP — Pound", "ILS — Shekel"] },
        { l: "Date format", desc: null, v: "MMM d, yyyy", kind: "select", options: ["MMM d, yyyy", "yyyy-MM-dd", "d MMM yyyy"] },
      ],
    },
    {
      id: "billing",
      label: "Billing & budget",
      fields: [
        { l: "Monthly budget", desc: "Warn at 80%, alert at 100%.", v: "$220", kind: "input" },
        { l: "Default reminder", desc: "Days before each renewal.", v: "3", kind: "segmented", options: ["1", "3", "7", "14"] },
      ],
    },
  ];
  return (
    <div className="px-8 py-7 max-w-[900px] w-full">
      <h1 className="text-[24px] font-medium tracking-[-0.01em] mb-1">Settings</h1>
      <p className="text-[12.5px] mb-7" style={{ color: eclipseTokens.muted }}>Workspace · Personal</p>

      <div className="grid grid-cols-12 gap-6">
        <nav className="col-span-12 md:col-span-3">
          <ul className="space-y-1 text-[13px]">
            {sections.concat([{ id: "notif", label: "Notifications" }, { id: "danger", label: "Danger zone" }]).map((s, i) => (
              <li key={i}>
                <button className={`w-full text-left px-2.5 py-1.5 rounded-md ${i === 0 ? "" : ""}`} style={{ background: i === 0 ? eclipseTokens.surfaceHi : "transparent", color: i === 0 ? eclipseTokens.ink : eclipseTokens.ink2, border: i === 0 ? `1px solid ${eclipseTokens.border}` : "none" }}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-12 md:col-span-9 space-y-6">
          {sections.map((sec) => (
            <section key={sec.id} className="rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
              <div className="px-5 py-3.5 border-b text-[13px] font-medium" style={{ borderColor: eclipseTokens.border }}>{sec.label}</div>
              <div className="divide-y" style={{ borderColor: eclipseTokens.border }}>
                {sec.fields.map((f, i) => (
                  <div key={i} className="grid grid-cols-12 items-center gap-4 px-5 py-4" style={{ borderColor: eclipseTokens.border }}>
                    <div className="col-span-12 md:col-span-6">
                      <div className="text-[13px]">{f.l}</div>
                      {f.desc && <div className="text-[11.5px] mt-0.5" style={{ color: eclipseTokens.muted }}>{f.desc}</div>}
                    </div>
                    <div className="col-span-12 md:col-span-6 md:flex md:justify-end">
                      {f.kind === "input" && (
                        <input defaultValue={f.v} className="h-8 px-2.5 rounded-md text-[12.5px] w-full md:w-60 outline-none" style={{ background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}`, color: eclipseTokens.ink }} />
                      )}
                      {f.kind === "select" && (
                        <select className="h-8 px-2.5 rounded-md text-[12.5px] w-full md:w-60 outline-none" style={{ background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}`, color: eclipseTokens.ink }}>
                          {f.options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      )}
                      {f.kind === "segmented" && (
                        <div className="inline-flex rounded-md p-0.5" style={{ background: eclipseTokens.surfaceHi, border: `1px solid ${eclipseTokens.border}` }}>
                          {f.options.map((o) => (
                            <button key={o} className="px-2.5 h-6 text-[11.5px] tnum rounded" style={{ background: o === f.v ? accent : "transparent", color: o === f.v ? "#fff" : eclipseTokens.ink2 }}>{o}d</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
            <div className="px-5 py-3.5 border-b text-[13px] font-medium" style={{ borderColor: eclipseTokens.border }}>Notifications</div>
            <div className="p-5 space-y-3">
              {["Renewal reminders", "Trial-ending reminders", "Budget alerts", "Weekly digest"].map((n, i) => (
                <div key={n} className="flex items-center justify-between text-[12.5px]">
                  <div>{n}</div>
                  <button className="relative h-5 w-9 rounded-full" style={{ background: i < 3 ? accent : eclipseTokens.borderStrong }}>
                    <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white" style={{ left: i < 3 ? "calc(100% - 18px)" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Cancelled ---
function EclipseCancelled({ accent }) {
  const items = window.CANCELLED;
  const totalLifetime = items.reduce((s, i) => s + i.lifetimeSpend, 0);
  return (
    <div className="px-8 py-7 max-w-[1100px] w-full">
      <div className="mb-7">
        <div className="text-[11.5px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>Archive</div>
        <h1 className="mt-1 text-[24px] font-medium tracking-[-0.01em]">Cancelled subscriptions</h1>
      </div>

      <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border mb-6" style={{ background: eclipseTokens.border, borderColor: eclipseTokens.border }}>
        {[
          { l: "Cancelled", v: items.length.toString(), s: "lifetime" },
          { l: "Lifetime spend", v: window.fmt(totalLifetime), s: "across archive" },
          { l: "Saved monthly", v: window.fmt(items.reduce((s, i) => s + i.cost, 0)), s: "what you no longer pay" },
        ].map((s, i) => (
          <div key={i} className="p-5" style={{ background: eclipseTokens.surface }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: eclipseTokens.muted }}>{s.l}</div>
            <div className="mt-2 tnum text-[24px] font-medium tracking-[-0.02em]">{s.v}</div>
            <div className="text-[11.5px]" style={{ color: eclipseTokens.muted }}>{s.s}</div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border" style={{ background: eclipseTokens.surface, borderColor: eclipseTokens.border }}>
        <header className="px-5 py-3 border-b text-[13px] font-medium" style={{ borderColor: eclipseTokens.border }}>Archive</header>
        {items.map((it) => {
          const months = Math.round((it.cancelledAt - it.startedAt) / (1000 * 60 * 60 * 24 * 30));
          return (
            <div key={it.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3.5 border-b last:border-b-0" style={{ borderColor: eclipseTokens.border }}>
              <div className="col-span-5 flex items-center gap-3">
                <Logo sub={it} size={32} rounded="rounded-md" />
                <div>
                  <div className="text-[13px] font-medium">{it.name}</div>
                  <div className="text-[11px]" style={{ color: eclipseTokens.muted }}>{it.category}</div>
                </div>
              </div>
              <div className="col-span-3 text-[12px]" style={{ color: eclipseTokens.ink2 }}>
                <div className="tnum">{window.fmtDate(it.startedAt)} – {window.fmtDate(it.cancelledAt)}</div>
                <div className="text-[10.5px]" style={{ color: eclipseTokens.muted }}>{months} months</div>
              </div>
              <div className="col-span-2 text-right tnum text-[12.5px]" style={{ color: eclipseTokens.ink2 }}>{window.fmt(it.cost)}/mo</div>
              <div className="col-span-2 text-right tnum text-[13px] font-medium">{window.fmt(it.lifetimeSpend)}</div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

window.Eclipse = {
  Shell: EclipseShell,
  Dashboard: EclipseDashboard,
  Detail: EclipseDetail,
  Settings: EclipseSettings,
  Cancelled: EclipseCancelled,
  tokens: eclipseTokens,
  defaultAccent: "#8C6FFF",
};
