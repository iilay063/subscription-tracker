// AURORA — Light fintech direction (Mercury / Stripe vibe).
// Warm off-white canvas, ink type, single emerald accent, generous whitespace.

const auroraLight = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  surfaceMuted: "#F5F3EE",
  border: "#ECEAE3",
  borderStrong: "#DFDBD2",
  ink: "#0E0E0C",
  ink2: "#3B3935",
  muted: "#84807A",
  faint: "#B0ACA4",
  shadow: "0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08)",
  shadowSubtle: "0 1px 0 rgba(20,20,20,0.04), 0 1px 2px rgba(20,20,20,0.04)",
  rowHover: "rgba(0,0,0,0.03)",
  rowHoverSubtle: "rgba(0,0,0,0.02)",
  isDark: false,
};
const auroraDark = {
  bg: "#0E0D0B",           // warm near-black
  surface: "#16140F",
  surfaceMuted: "#1C1A14",
  border: "#26241C",
  borderStrong: "#34322A",
  ink: "#F5F1E8",
  ink2: "#C9C2B3",
  muted: "#8A8475",
  faint: "#5C574B",
  shadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
  shadowSubtle: "0 1px 0 rgba(255,255,255,0.02) inset",
  rowHover: "rgba(255,255,255,0.03)",
  rowHoverSubtle: "rgba(255,255,255,0.02)",
  isDark: true,
};
const auroraTokens = auroraLight; // legacy export

// Categories get a curated, harmonious palette in Aurora (we ignore the brand red for chart aesthetics).
const auroraCatColor = (cat) => ({
  "Entertainment": "#C36A4A",
  "Productivity": "#2B8F66",
  "Software": "#476FC7",
  "Cloud Storage": "#7C8FA8",
  "News": "#8E7A4A",
  "Health": "#A45C8C",
}[cat] ?? "#84807A");

function AuroraShell({ accent, screen, setScreen, children , dark }) {
  const t = dark ? auroraDark : auroraLight;
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "detail", label: "Subscriptions", icon: "creditCard" },
    { id: "cancelled", label: "Cancelled", icon: "archive" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <div className="flex min-h-screen w-full" style={{ background: t.bg, color: t.ink, fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-[224px] shrink-0 flex-col border-r" style={{ borderColor: t.border }}>
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: accent }}>S</div>
          <div className="text-[14px] font-semibold tracking-tight">Sub<span style={{ color: t.muted }}>·</span>tracker</div>
        </div>
        <nav className="px-3 pt-2 flex flex-col gap-0.5">
          {navItems.map((n) => {
            const active = n.id === screen;
            return (
              <button
                key={n.id}
                onClick={() => setScreen(n.id)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] text-left transition-colors ${
                  active ? "font-medium" : "hover:bg-black/[0.03]"
                }`}
                style={{
                  background: active ? t.surface : "transparent",
                  color: active ? t.ink : t.ink2,
                  boxShadow: active ? "0 1px 0 rgba(20,20,20,0.04), 0 1px 2px rgba(20,20,20,0.04)" : "none",
                }}
              >
                <Icon name={n.icon} className="h-[15px] w-[15px]" />
                {n.label}
                {n.id === "dashboard" && active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t" style={{ borderColor: t.border }}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold" style={{ background: "#7A6F5E" }}>IW</div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium truncate">Ilay Weizman</div>
              <div className="text-[11.5px] truncate" style={{ color: t.muted }}>ilay@example.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

// --- Dashboard ---
function AuroraDashboard({ accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  const monthlyTotal = window.MONTHLY_TOTAL;
  const yearly = window.YEARLY_TOTAL;
  const budget = window.SAMPLE_USER.monthlyBudget;
  const pct = Math.min(100, (monthlyTotal / budget) * 100);
  const over = monthlyTotal > budget;
  const upcoming = window.UPCOMING.slice(0, 8);
  const recent = window.SUBSCRIPTIONS.filter((s) => s.priceChange).slice(0, 3);
  const trials = window.SUBSCRIPTIONS.filter((s) => s.isTrial);
  const breakdown = window.CATEGORY_BREAKDOWN.map((c) => ({ ...c, color: auroraCatColor(c.category) }));
  const totalMonthly = breakdown.reduce((s, x) => s + x.monthly, 0);

  return (
    <div className="px-10 py-8 max-w-[1200px]">
      {/* Greeting bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Tuesday, May 26</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Good evening, Ilay.</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-md border text-[13px] inline-flex items-center gap-1.5 hover:bg-black/[0.03]" style={{ borderColor: t.borderStrong, color: t.ink2 }}>
            <Icon name="download" className="h-3.5 w-3.5" /> Export
          </button>
          <button className="h-9 px-3.5 rounded-md text-[13px] font-medium inline-flex items-center gap-1.5 text-white" style={{ background: accent }}>
            <Icon name="plus" className="h-3.5 w-3.5" /> Add subscription
          </button>
        </div>
      </div>

      {/* Hero — monthly + budget + upcoming timeline */}
      <div className="grid grid-cols-12 gap-5 mb-8">
        <section className="col-span-12 lg:col-span-7 rounded-xl border p-7 relative overflow-hidden"
          style={{ background: t.surface, borderColor: t.border, boxShadow: "0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08)" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>This month</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="tnum text-[56px] leading-none font-semibold tracking-[-0.03em]">
                  {window.fmtNoCents(monthlyTotal)}
                  <span className="text-[28px] align-top" style={{ color: t.faint }}>.{monthlyTotal.toFixed(2).split(".")[1]}</span>
                </div>
              </div>
              <div className="mt-3 text-[13px] flex items-center gap-3" style={{ color: t.ink2 }}>
                <span className="inline-flex items-center gap-1" style={{ color: over ? "#B85C3C" : "#2B8F66" }}>
                  <Icon name="trendUp" className="h-3.5 w-3.5" /> +$9.00
                </span>
                <span style={{ color: t.muted }}>vs last month</span>
                <span style={{ color: t.faint }}>·</span>
                <span style={{ color: t.muted }}>{window.fmtNoCents(yearly)} / yr projected</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Active</div>
              <div className="mt-2 tnum text-[28px] font-medium">{window.SUBSCRIPTIONS.length}</div>
              <div className="text-[11px]" style={{ color: t.muted }}>subscriptions</div>
            </div>
          </div>

          {/* Budget bar */}
          <div className="mt-7 pt-5 border-t" style={{ borderColor: t.border }}>
            <div className="flex items-center justify-between text-[12px] mb-2">
              <span style={{ color: t.muted }}>Monthly budget</span>
              <span className="tnum" style={{ color: t.ink2 }}>
                {window.fmt(monthlyTotal)} <span style={{ color: t.faint }}>of</span> {window.fmt(budget)}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.surfaceMuted }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? "#B85C3C" : accent }} />
            </div>
            <div className="mt-2 text-[11.5px]" style={{ color: over ? "#B85C3C" : t.muted }}>
              {over ? `Over budget by ${window.fmt(monthlyTotal - budget)}` : `${Math.round(100 - pct)}% headroom this month`}
            </div>
          </div>
        </section>

        {/* Category breakdown — compact stacked */}
        <section className="col-span-12 lg:col-span-5 rounded-xl border p-7"
          style={{ background: t.surface, borderColor: t.border, boxShadow: "0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>By category</div>
              <div className="mt-1 text-[15px] font-medium">Spending mix</div>
            </div>
            <button className="text-[12px]" style={{ color: t.muted }}>This month</button>
          </div>
          {/* Stacked bar */}
          <div className="flex h-2 rounded-full overflow-hidden">
            {breakdown.map((c, i) => (
              <div key={i} style={{ width: `${(c.monthly / totalMonthly) * 100}%`, background: c.color }} title={c.category} />
            ))}
          </div>
          <ul className="mt-5 space-y-2.5">
            {breakdown.map((c, i) => (
              <li key={i} className="flex items-center gap-3 text-[13px]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="flex-1">{c.category}</span>
                <span className="tnum text-[12px]" style={{ color: t.muted }}>{c.count}</span>
                <span className="tnum w-20 text-right">{window.fmt(c.monthly)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Upcoming timeline — horizontal day rail */}
      <section className="rounded-xl border mb-8"
        style={{ background: t.surface, borderColor: t.border, boxShadow: "0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08)" }}>
        <header className="flex items-center justify-between px-7 pt-6 pb-2">
          <div>
            <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Upcoming</div>
            <div className="mt-1 text-[15px] font-medium">Next 30 days</div>
          </div>
          <div className="text-[13px] tnum" style={{ color: t.ink2 }}>
            <span style={{ color: t.muted }}>Total due:</span> {window.fmt(upcoming.reduce((s, u) => s + u.cost, 0))}
          </div>
        </header>
        <AuroraTimeline items={window.UPCOMING} accent={accent} dark={dark} />
      </section>

      {/* Trials + price changes */}
      {(trials.length > 0 || recent.length > 0) && (
        <div className="grid grid-cols-12 gap-5 mb-8">
          {trials.length > 0 && (
            <section className="col-span-12 md:col-span-6 rounded-xl border p-6"
              style={{ background: t.surface, borderColor: t.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="sparkles" className="h-4 w-4" />
                <div className="text-[14px] font-medium">Trials ending soon</div>
              </div>
              <ul className="space-y-3">
                {trials.map((t) => {
                  const days = window.daysUntil(t.trialEndsAt);
                  const urgent = days <= 3;
                  return (
                    <li key={t.id} className="flex items-center gap-3">
                      <Logo sub={t} size={32} rounded="rounded-md" ring />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-medium truncate">{t.name}</div>
                        <div className="text-[11.5px]" style={{ color: t.muted }}>Converts to {window.fmt(t.cost)} / mo</div>
                      </div>
                      <span className="text-[12px] tnum px-2 py-0.5 rounded-full" style={{ background: urgent ? "rgba(184,92,60,0.14)" : t.surfaceMuted, color: urgent ? (t.isDark ? "#E18B6B" : "#B85C3C") : t.ink2 }}>
                        {days}d left
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {recent.length > 0 && (
            <section className="col-span-12 md:col-span-6 rounded-xl border p-6"
              style={{ background: t.surface, borderColor: t.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="trendUp" className="h-4 w-4" />
                <div className="text-[14px] font-medium">Recent price changes</div>
              </div>
              <ul className="space-y-3">
                {recent.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <Logo sub={s} size={32} rounded="rounded-md" ring />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium truncate">{s.name}</div>
                      <div className="text-[11.5px] tnum" style={{ color: t.muted }}>
                        {window.fmt(s.priceChange.previous)} → {window.fmt(s.cost)}
                      </div>
                    </div>
                    <span className="text-[12px] tnum inline-flex items-center gap-1" style={{ color: "#B85C3C" }}>
                      <Icon name="arrowUp" className="h-3 w-3" />
                      +{window.fmt(s.priceChange.change)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Active subscriptions */}
      <section className="rounded-xl border mb-12"
        style={{ background: t.surface, borderColor: t.border, boxShadow: "0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08)" }}>
        <header className="flex items-center justify-between px-7 pt-6 pb-4">
          <div>
            <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Active</div>
            <div className="mt-1 text-[15px] font-medium">{window.SUBSCRIPTIONS.length} subscriptions</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon name="search" className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input placeholder="Search…" className="h-8 pl-7 pr-3 rounded-md border text-[12.5px] w-44 outline-none focus:ring-2 focus:ring-offset-0" style={{ borderColor: t.borderStrong, background: t.surface }} />
            </div>
            <button className="h-8 px-3 rounded-md border text-[12.5px] inline-flex items-center gap-1.5" style={{ borderColor: t.borderStrong, color: t.ink2 }}>
              <Icon name="filter" className="h-3 w-3" /> Filter
            </button>
          </div>
        </header>
        <AuroraTable items={window.SUBSCRIPTIONS} accent={accent} dark={dark} />
      </section>
    </div>
  );
}

function AuroraTimeline({ items, accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  // Build 30-day rail
  const days = [];
  for (let i = 0; i < 30; i++) {
    const dt = new Date(window.TODAY);
    dt.setDate(dt.getDate() + i);
    const billings = items.filter((it) => {
      const d = it.nextBilling;
      return d.getFullYear() === dt.getFullYear() && d.getMonth() === dt.getMonth() && d.getDate() === dt.getDate();
    });
    days.push({ dt, billings });
  }
  const maxAmt = Math.max(...days.map((d) => d.billings.reduce((s, b) => s + b.cost, 0)), 1);

  return (
    <div className="px-7 pb-7">
      <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
        {days.map((day, i) => {
          const amt = day.billings.reduce((s, b) => s + b.cost, 0);
          const isToday = i === 0;
          const has = day.billings.length > 0;
          const height = has ? 22 + (amt / maxAmt) * 56 : 0;
          return (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[34px]">
              <div className="h-[80px] flex flex-col items-center justify-end">
                {has ? (
                  <div className="w-7 rounded-t-md flex flex-col items-center justify-end gap-[2px] pb-1"
                    style={{ height, background: isToday ? accent : t.surfaceMuted, opacity: 1 }}>
                    {day.billings.slice(0, 3).map((b, j) => (
                      <div key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: isToday ? "rgba(255,255,255,0.8)" : auroraCatColor(b.category) }} />
                    ))}
                  </div>
                ) : (
                  <div className="h-px w-4" style={{ background: t.border }} />
                )}
              </div>
              <div className={`text-[10px] tnum ${isToday ? "font-semibold" : ""}`} style={{ color: isToday ? t.ink : t.muted }}>
                {day.dt.getDate()}
              </div>
              {(i === 0 || day.dt.getDate() === 1) && (
                <div className="text-[9px] uppercase tracking-wider" style={{ color: t.faint }}>
                  {day.dt.toLocaleDateString("en-US", { month: "short" })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Featured upcoming items */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.slice(0, 3).map((it) => {
          const days = window.daysUntil(it.nextBilling);
          return (
            <div key={it.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: t.border, background: t.surfaceMuted }}>
              <Logo sub={it} size={32} rounded="rounded-md" ring />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate">{it.name}</div>
                <div className="text-[11px]" style={{ color: t.muted }}>
                  {window.fmtDate(it.nextBilling)} · {days === 0 ? "today" : `in ${days}d`}
                </div>
              </div>
              <div className="tnum text-[13px] font-medium">{window.fmt(it.cost)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuroraTable({ items, accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  return (
    <div className="border-t" style={{ borderColor: t.border }}>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.1em]" style={{ color: t.muted }}>
            <th className="px-7 py-3 font-normal">Service</th>
            <th className="px-3 py-3 font-normal">Category</th>
            <th className="px-3 py-3 font-normal">Cycle</th>
            <th className="px-3 py-3 font-normal">Next charge</th>
            <th className="px-3 py-3 font-normal text-right">Cost</th>
            <th className="px-7 py-3 font-normal text-right">Monthly</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, i) => {
            const days = window.daysUntil(s.nextBilling);
            return (
              <tr key={s.id} className="border-t hover:bg-black/[0.02]" style={{ borderColor: t.border }}>
                <td className="px-7 py-3.5">
                  <div className="flex items-center gap-3">
                    <Logo sub={s} size={28} rounded="rounded-md" ring />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {s.name}
                        {s.isTrial && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(140,108,200,0.18)", color: t.isDark ? "#C7A8E8" : "#7A4CAF" }}>Trial</span>
                        )}
                        {s.priceChange && (
                          <span className="text-[10.5px] tnum inline-flex items-center gap-0.5" style={{ color: "#B85C3C" }}>
                            <Icon name="arrowUp" className="h-2.5 w-2.5" /> {window.fmt(s.priceChange.change)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px]" style={{ color: t.muted }}>{s.domain}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: t.ink2 }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: auroraCatColor(s.category) }} />
                    {s.category}
                  </span>
                </td>
                <td className="px-3 py-3.5 capitalize text-[12.5px]" style={{ color: t.ink2 }}>{s.cycle}</td>
                <td className="px-3 py-3.5 text-[12.5px]" style={{ color: t.ink2 }}>
                  <div className="tnum">{window.fmtDate(s.nextBilling)}</div>
                  <div className="text-[11px]" style={{ color: t.muted }}>
                    {days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right tnum font-medium">{window.fmt(s.cost)}</td>
                <td className="px-7 py-3.5 text-right tnum" style={{ color: t.muted }}>{window.fmt(window.calcMonthly(s))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Subscription detail ---
function AuroraDetail({ accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  const sub = window.SUBSCRIPTIONS.find((s) => s.id === "spotify");
  const history = [
    { date: new Date(2026, 3, 26), amount: 11.99, status: "Charged" },
    { date: new Date(2026, 2, 26), amount: 11.99, status: "Charged" },
    { date: new Date(2026, 1, 26), amount: 11.99, status: "Charged" },
    { date: new Date(2026, 0, 26), amount: 10.99, status: "Charged" },
    { date: new Date(2025, 11, 26), amount: 10.99, status: "Charged" },
    { date: new Date(2025, 10, 26), amount: 10.99, status: "Charged" },
  ];
  const lifetime = history.reduce((s, h) => s + h.amount, 0) + 220;
  return (
    <div className="px-10 py-8 max-w-[1080px]">
      <button className="text-[12.5px] inline-flex items-center gap-1 mb-6" style={{ color: t.muted }}>
        <Icon name="chevronLeft" className="h-3 w-3" /> Back to subscriptions
      </button>

      <div className="flex items-start gap-5 mb-8">
        <Logo sub={sub} size={64} rounded="rounded-2xl" ring />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{sub.name}</h1>
            <a className="text-[12px]" style={{ color: t.muted }}>{sub.domain}</a>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5" style={{ color: t.ink2 }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: auroraCatColor(sub.category) }} />
              {sub.category}
            </span>
            <span style={{ color: t.faint }}>·</span>
            <span style={{ color: t.ink2 }}>Active since {window.fmtDateLong(sub.startedAt)}</span>
            {sub.priceChange && (
              <>
                <span style={{ color: t.faint }}>·</span>
                <span className="inline-flex items-center gap-1" style={{ color: "#B85C3C" }}>
                  <Icon name="arrowUp" className="h-3 w-3" /> Raised {window.fmt(sub.priceChange.change)} on {window.fmtDate(sub.priceChange.at)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-md border text-[13px] inline-flex items-center gap-1.5" style={{ borderColor: t.borderStrong, color: t.ink2 }}>
            <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
          </button>
          <button className="h-9 px-3 rounded-md border text-[13px]" style={{ borderColor: t.borderStrong, color: "#B85C3C" }}>
            Cancel subscription
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        {[
          { label: "Cost", value: window.fmt(sub.cost), sub: `per ${sub.cycle.replace("ly", "")} · USD` },
          { label: "Next charge", value: window.fmtDate(sub.nextBilling), sub: `in ${window.daysUntil(sub.nextBilling)} days` },
          { label: "Lifetime spend", value: window.fmtNoCents(lifetime), sub: "since Aug 2019" },
          { label: "Reminder", value: "3 days before", sub: "global default" },
        ].map((s, i) => (
          <div key={i} className="col-span-6 md:col-span-3 rounded-xl border p-5" style={{ background: t.surface, borderColor: t.border }}>
            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>{s.label}</div>
            <div className="mt-2 tnum text-[22px] font-medium tracking-[-0.02em]">{s.value}</div>
            <div className="text-[11.5px] mt-0.5" style={{ color: t.muted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* History + side info */}
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-8 rounded-xl border p-7" style={{ background: t.surface, borderColor: t.border }}>
          <div className="text-[15px] font-medium mb-1">Billing history</div>
          <div className="text-[12px] mb-5" style={{ color: t.muted }}>The last 6 charges. Earlier history available in CSV export.</div>
          <div className="space-y-1">
            {history.map((h, i) => {
              const changed = i < history.length - 1 && history[i + 1].amount !== h.amount;
              return (
                <div key={i} className="grid grid-cols-12 items-center py-2.5 border-b" style={{ borderColor: t.border }}>
                  <div className="col-span-3 text-[12.5px] tnum" style={{ color: t.ink2 }}>{window.fmtDateLong(h.date)}</div>
                  <div className="col-span-5 text-[12.5px]" style={{ color: t.muted }}>{h.status} · Card ending 4242</div>
                  <div className="col-span-4 text-right tnum text-[13.5px] font-medium">
                    {window.fmt(h.amount)}
                    {changed && (
                      <span className="ml-2 text-[10.5px] tnum" style={{ color: "#B85C3C" }}>+$1.00</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <div className="rounded-xl border p-6" style={{ background: t.surface, borderColor: t.border }}>
            <div className="text-[14px] font-medium mb-3">Notes</div>
            <p className="text-[12.5px] leading-[1.6]" style={{ color: t.ink2 }}>
              Family plan — shared with sister. Renews on the 26th. Consider downgrading to Duo if she gets her own account.
            </p>
          </div>
          <div className="rounded-xl border p-6" style={{ background: t.surface, borderColor: t.border }}>
            <div className="text-[14px] font-medium mb-3">Quick actions</div>
            <div className="space-y-1.5">
              {["Open service", "Pause for 1 month", "Change billing date", "Move to another category"].map((a) => (
                <button key={a} className="w-full flex items-center justify-between text-[13px] py-2 px-2.5 rounded-md hover:bg-black/[0.03]" style={{ color: t.ink2 }}>
                  {a}
                  <Icon name="chevronRight" className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Settings ---
function AuroraSettings({ accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  return (
    <div className="px-10 py-8 max-w-[820px]">
      <div className="mb-8">
        <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Account</div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Settings</h1>
      </div>

      <SettingsSection title="Preferences" desc="How totals are shown, and when we ping you." tokens={t}>
        <SettingsField label="Preferred currency" hint="All totals convert to this." tokens={t}>
          <select className="h-9 px-3 rounded-md border text-[13px] tnum w-44" style={{ background: t.surface, borderColor: t.borderStrong }}>
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — Pound</option>
            <option>ILS — Shekel</option>
          </select>
        </SettingsField>
        <SettingsField label="Reminder lead time" hint="Default days before each renewal." tokens={t}>
          <div className="inline-flex items-center rounded-md border overflow-hidden" style={{ borderColor: t.borderStrong }}>
            {[1, 3, 7, 14].map((d, i) => (
              <button key={d} className={`px-3 h-9 text-[12.5px] tnum ${d === 3 ? "text-white" : ""}`} style={{ background: d === 3 ? accent : "transparent", color: d === 3 ? "#fff" : t.ink2 }}>
                {d}d
              </button>
            ))}
          </div>
        </SettingsField>
        <SettingsField label="Monthly budget" hint="We'll warn you at 80% and again at 100%." tokens={t}>
          <div className="inline-flex items-center h-9 rounded-md border overflow-hidden" style={{ borderColor: t.borderStrong }}>
            <span className="px-3 text-[13px]" style={{ color: t.muted, background: t.surfaceMuted }}>$</span>
            <input defaultValue="220" className="h-9 w-24 px-2 text-[13px] tnum outline-none" style={{ background: t.surface }} />
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Notifications" desc="Email-only for now." tokens={t}>
        {[
          { label: "Renewal reminders", desc: "Heads-up before each charge.", on: true },
          { label: "Trial-ending reminders", desc: "Stronger ping before a free trial converts.", on: true },
          { label: "Budget alerts", desc: "Once per month if you exceed your cap.", on: true },
          { label: "Weekly digest", desc: "Sunday recap of upcoming charges.", on: false },
        ].map((n) => (
          <div key={n.label} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: t.border }}>
            <div>
              <div className="text-[13.5px] font-medium">{n.label}</div>
              <div className="text-[12px]" style={{ color: t.muted }}>{n.desc}</div>
            </div>
            <button className="relative h-5 w-9 rounded-full transition-colors" style={{ background: n.on ? accent : t.borderStrong }}>
              <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: n.on ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
            </button>
          </div>
        ))}
      </SettingsSection>

      <SettingsSection title="Data" desc="Take your data with you, anytime." tokens={t}>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="h-9 px-3.5 rounded-md border text-[13px] inline-flex items-center gap-1.5" style={{ borderColor: t.borderStrong, color: t.ink2 }}>
            <Icon name="download" className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="h-9 px-3.5 rounded-md border text-[13px]" style={{ borderColor: t.borderStrong, color: "#B85C3C" }}>
            Delete account
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, desc, children, tokens }) {
  return (
    <section className="mb-8 rounded-xl border p-7" style={{ background: tokens.surface, borderColor: tokens.border }}>
      <div className="mb-5">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="text-[12.5px]" style={{ color: tokens.muted }}>{desc}</div>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SettingsField({ label, hint, children, tokens }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3 border-b last:border-b-0" style={{ borderColor: tokens.border }}>
      <div className="col-span-12 md:col-span-7">
        <div className="text-[13.5px] font-medium">{label}</div>
        <div className="text-[12px]" style={{ color: tokens.muted }}>{hint}</div>
      </div>
      <div className="col-span-12 md:col-span-5 md:flex md:justify-end">{children}</div>
    </div>
  );
}

// --- Cancelled ---
function AuroraCancelled({ accent , dark }) {
  const t = dark ? auroraDark : auroraLight;
  const items = window.CANCELLED;
  const total = items.reduce((s, i) => s + i.lifetimeSpend, 0);
  return (
    <div className="px-10 py-8 max-w-[1080px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Archive</div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Cancelled subscriptions</h1>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>Lifetime spend (cancelled)</div>
          <div className="mt-1 tnum text-[24px] font-semibold tracking-[-0.02em]">{window.fmt(total)}</div>
        </div>
      </div>

      <section className="rounded-xl border" style={{ background: t.surface, borderColor: t.border }}>
        <div className="border-b grid grid-cols-12 px-7 py-3 text-[11px] uppercase tracking-[0.1em]" style={{ color: t.muted, borderColor: t.border }}>
          <div className="col-span-5">Service</div>
          <div className="col-span-3">Active period</div>
          <div className="col-span-2 text-right">Last cost</div>
          <div className="col-span-2 text-right">Lifetime</div>
        </div>
        {items.map((it, i) => {
          const months = Math.round((it.cancelledAt - it.startedAt) / (1000 * 60 * 60 * 24 * 30));
          return (
            <div key={it.id} className="grid grid-cols-12 px-7 py-4 border-b last:border-b-0 items-center hover:bg-black/[0.02]" style={{ borderColor: t.border }}>
              <div className="col-span-5 flex items-center gap-3">
                <Logo sub={it} size={32} rounded="rounded-md" ring />
                <div>
                  <div className="text-[13.5px] font-medium">{it.name}</div>
                  <div className="text-[11.5px]" style={{ color: t.muted }}>{it.category}</div>
                </div>
              </div>
              <div className="col-span-3 text-[12.5px]" style={{ color: t.ink2 }}>
                <div className="tnum">{window.fmtDateLong(it.startedAt)}</div>
                <div className="text-[11px]" style={{ color: t.muted }}>→ {window.fmtDate(it.cancelledAt)} ({months}mo)</div>
              </div>
              <div className="col-span-2 text-right tnum text-[13px]">{window.fmt(it.cost)}</div>
              <div className="col-span-2 text-right tnum text-[13px] font-medium">{window.fmt(it.lifetimeSpend)}</div>
            </div>
          );
        })}
      </section>

      <p className="mt-5 text-[12px]" style={{ color: t.muted }}>
        Cancelled subscriptions are kept so totals stay accurate. To restart one, add it again as new.
      </p>
    </div>
  );
}

// Public API
window.Aurora = {
  Shell: AuroraShell,
  Dashboard: AuroraDashboard,
  Detail: AuroraDetail,
  Settings: AuroraSettings,
  Cancelled: AuroraCancelled,
  tokens: auroraTokens,
  defaultAccent: "#2B8F66",
};
