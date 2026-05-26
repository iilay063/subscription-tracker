// FOLIO — Editorial fintech direction.
// Cream paper, Fraunces display serif, Inter body, terracotta accent.
// List-style with big service tiles and an editorial timeline.

const folioTokens = {
  bg: "#F4EFE7",        // cream paper
  bg2: "#EBE5D9",
  surface: "#FBF8F2",
  surfaceHi: "#FFFFFF",
  border: "#E0D9CB",
  borderStrong: "#CFC6B3",
  ink: "#1F1A14",       // espresso
  ink2: "#494135",
  muted: "#8A7F6C",
  faint: "#B5A990",
  serif: "Fraunces, 'Instrument Serif', Georgia, serif",
};

const folioCatColor = (cat) => ({
  "Entertainment": "#B85C3C",
  "Productivity": "#5F7A3F",
  "Software": "#3C5C8C",
  "Cloud Storage": "#8A6FA0",
  "News": "#806C42",
  "Health": "#A04C6A",
}[cat] ?? "#8A7F6C");

function FolioShell({ accent, screen, setScreen, children }) {
  const navItems = [
    { id: "dashboard", label: "Overview" },
    { id: "detail", label: "Subscriptions" },
    { id: "cancelled", label: "Archive" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="min-h-screen" style={{ background: folioTokens.bg, color: folioTokens.ink, fontFamily: "Inter, sans-serif" }}>
      {/* Masthead */}
      <header className="border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="max-w-[1180px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[12px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Vol. II · No. 12</div>
            <div className="hidden md:block h-4 w-px" style={{ background: folioTokens.borderStrong }} />
            <div className="hidden md:block text-[12px] tnum" style={{ color: folioTokens.muted }}>Tuesday, May 26, 2026</div>
          </div>
          <div className="flex-1 text-center">
            <div style={{ fontFamily: folioTokens.serif }} className="text-[28px] font-medium tracking-tight leading-none">
              The Ledger
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.28em] mt-1" style={{ color: folioTokens.muted }}>a personal subscription review</div>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <button className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: folioTokens.surface, border: `1px solid ${folioTokens.border}` }}><Icon name="search" className="h-3.5 w-3.5" /></button>
            <button className="h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-white text-[12.5px]" style={{ background: accent }}>
              <Icon name="plus" className="h-3 w-3" /> Add subscription
            </button>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: folioTokens.border }}>
          <nav className="max-w-[1180px] mx-auto px-8 flex items-center gap-7 text-[13px]">
            {navItems.map((n) => {
              const active = n.id === screen;
              return (
                <button key={n.id} onClick={() => setScreen(n.id)} className="py-3 relative" style={{ color: active ? folioTokens.ink : folioTokens.muted }}>
                  {n.label}
                  {active && <span className="absolute left-0 right-0 -bottom-px h-px" style={{ background: accent }} />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="max-w-[1180px] mx-auto">{children}</div>

      <footer className="max-w-[1180px] mx-auto border-t mt-12 px-8 py-6 flex items-center justify-between text-[11px]" style={{ borderColor: folioTokens.border, color: folioTokens.muted }}>
        <div>The Ledger · Personal subscription review</div>
        <div className="tnum">Printed Tuesday, May 26 · Page 1 of 1</div>
      </footer>
    </div>
  );
}

function FolioDashboard({ accent }) {
  const monthly = window.MONTHLY_TOTAL;
  const yearly = window.YEARLY_TOTAL;
  const budget = window.SAMPLE_USER.monthlyBudget;
  const over = monthly > budget;
  const pct = (monthly / budget) * 100;
  const trials = window.SUBSCRIPTIONS.filter((s) => s.isTrial);
  const recent = window.SUBSCRIPTIONS.filter((s) => s.priceChange);
  const breakdown = window.CATEGORY_BREAKDOWN.map((c) => ({ ...c, color: folioCatColor(c.category) }));
  const totalMonthly = breakdown.reduce((s, x) => s + x.monthly, 0);
  const upcoming = window.UPCOMING;

  return (
    <div className="px-8 pt-10">
      {/* Lede */}
      <section className="grid grid-cols-12 gap-8 pb-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="col-span-12 md:col-span-7">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>Monthly summary</div>
          <h1 style={{ fontFamily: folioTokens.serif }} className="mt-3 text-[64px] leading-[0.95] font-medium tracking-[-0.02em]">
            You'll spend{" "}
            <span style={{ color: accent }}>{window.fmtNoCents(monthly)}</span>
            {" "}this month <span style={{ color: folioTokens.muted, fontStyle: "italic", fontWeight: 300 }}>across {window.SUBSCRIPTIONS.length} active services.</span>
          </h1>
          <p className="mt-6 text-[14px] leading-[1.6] max-w-prose" style={{ color: folioTokens.ink2 }}>
            That's <span className="tnum">$9.00</span> more than April, driven by price hikes at{" "}
            <span style={{ fontFamily: folioTokens.serif, fontStyle: "italic" }}>The New York Times</span> and{" "}
            <span style={{ fontFamily: folioTokens.serif, fontStyle: "italic" }}>Spotify</span>. At this rate, your annual run-rate is{" "}
            <span className="tnum font-medium" style={{ color: folioTokens.ink }}>{window.fmtNoCents(yearly)}</span>.
          </p>
        </div>

        {/* Side index */}
        <aside className="col-span-12 md:col-span-5">
          <div className="rounded-sm p-6" style={{ background: folioTokens.surfaceHi, border: `1px solid ${folioTokens.border}` }}>
            <div className="text-[10.5px] uppercase tracking-[0.22em] pb-3 border-b" style={{ color: folioTokens.muted, borderColor: folioTokens.border }}>In this issue</div>
            <ul className="mt-3 text-[13px] divide-y" style={{ borderColor: folioTokens.border }}>
              {[
                { l: "Monthly total", v: window.fmt(monthly) },
                { l: "Annual run-rate", v: window.fmtNoCents(yearly) },
                { l: "Active subscriptions", v: window.SUBSCRIPTIONS.length.toString() },
                { l: "Trials ending", v: trials.length.toString() },
                { l: "Price increases (30d)", v: recent.length.toString() },
                { l: "Budget headroom", v: over ? "Exceeded" : window.fmt(budget - monthly) },
              ].map((row, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <span style={{ color: folioTokens.ink2 }}>{row.l}</span>
                  <span className="tnum font-medium">{row.v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Budget bar */}
          <div className="mt-5 rounded-sm p-5" style={{ background: folioTokens.surface, border: `1px solid ${folioTokens.border}` }}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[10.5px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Budget</div>
              <div className="text-[12px] tnum"><span style={{ color: folioTokens.muted }}>cap</span> {window.fmt(budget)}</div>
            </div>
            <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ background: folioTokens.bg2 }}>
              <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, background: over ? "#A04C3C" : accent }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span style={{ color: folioTokens.muted }}>{Math.round(pct)}% spent</span>
              <span className="tnum" style={{ color: folioTokens.ink2 }}>{window.fmt(monthly)} of {window.fmt(budget)}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Schedule — editorial timeline */}
      <section className="py-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="flex items-baseline justify-between mb-6">
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[28px] tracking-tight">The Schedule</h2>
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Next 30 days · {upcoming.length} charges</div>
        </div>

        <FolioTimeline items={upcoming} accent={accent} />

        {/* Upcoming list */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 columns-2-fill">
          {upcoming.slice(0, 8).map((it, i) => {
            const days = window.daysUntil(it.nextBilling);
            const dayLabel = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
            return (
              <div key={it.id} className="flex items-baseline gap-4 py-2.5 border-b" style={{ borderColor: folioTokens.border }}>
                <div className="tnum text-[12.5px] w-12" style={{ color: folioTokens.muted }}>{window.fmtDate(it.nextBilling)}</div>
                <div className="flex-1 text-[14px]" style={{ fontFamily: folioTokens.serif }}>{it.name}
                  {it.isTrial && <span className="ml-2 text-[10px] uppercase tracking-wider" style={{ color: accent, fontFamily: "Inter" }}>trial ends</span>}
                </div>
                <div className="text-[11.5px] italic" style={{ fontFamily: folioTokens.serif, color: folioTokens.muted }}>{dayLabel}</div>
                <div className="tnum text-[13px] w-16 text-right font-medium">{window.fmt(it.cost)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-column editorial — categories + trials */}
      <section className="grid grid-cols-12 gap-10 py-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="col-span-12 md:col-span-7">
          <div className="text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: accent }}>Where it goes</div>
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[28px] tracking-tight mb-6">Spending mix.</h2>
          <ul className="space-y-3.5">
            {breakdown.map((c, i) => {
              const w = (c.monthly / totalMonthly) * 100;
              return (
                <li key={i}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-[13.5px]">{c.category}</span>
                      <span className="text-[11.5px] tnum" style={{ color: folioTokens.muted }}>{c.count} services</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[11.5px] tnum" style={{ color: folioTokens.muted }}>{Math.round(w)}%</span>
                      <span className="tnum text-[13.5px] font-medium w-20 text-right">{window.fmt(c.monthly)}</span>
                    </div>
                  </div>
                  <div className="h-px" style={{ background: folioTokens.border }}>
                    <div className="h-full" style={{ width: `${w}%`, background: c.color, opacity: 0.8 }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: accent }}>Worth a look</div>
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[28px] tracking-tight mb-6">Trials & changes.</h2>

          {trials.map((t) => {
            const days = window.daysUntil(t.trialEndsAt);
            return (
              <div key={t.id} className="flex items-start gap-4 py-4 border-b" style={{ borderColor: folioTokens.border }}>
                <Logo sub={t} size={48} rounded="rounded-md" ring />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: accent }}>Trial · {days} days left</div>
                  <div style={{ fontFamily: folioTokens.serif }} className="text-[18px] mt-0.5">{t.name}</div>
                  <p className="text-[12.5px] mt-1" style={{ color: folioTokens.ink2 }}>
                    Converts to <span className="tnum font-medium">{window.fmt(t.cost)}/mo</span> on {window.fmtDate(t.trialEndsAt)}.
                  </p>
                </div>
                <button className="text-[11.5px] underline decoration-dotted" style={{ color: folioTokens.ink2 }}>Review</button>
              </div>
            );
          })}

          {recent.slice(0, 2).map((s) => (
            <div key={s.id} className="flex items-start gap-4 py-4 border-b" style={{ borderColor: folioTokens.border }}>
              <Logo sub={s} size={48} rounded="rounded-md" ring />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "#A04C3C" }}>Price increase</div>
                <div style={{ fontFamily: folioTokens.serif }} className="text-[18px] mt-0.5">{s.name}</div>
                <p className="text-[12.5px] mt-1 tnum" style={{ color: folioTokens.ink2 }}>
                  {window.fmt(s.priceChange.previous)} → {window.fmt(s.cost)}{" "}
                  <span style={{ color: folioTokens.muted, fontFamily: folioTokens.serif, fontStyle: "italic" }}>(+{window.fmt(s.priceChange.change)})</span>
                </p>
              </div>
            </div>
          ))}
        </aside>
      </section>

      {/* The Register — full subscription roster as editorial list */}
      <section className="py-10">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>The Register</div>
            <h2 style={{ fontFamily: folioTokens.serif }} className="text-[28px] tracking-tight">All active services.</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-8 px-3 rounded-full text-[12px] border" style={{ borderColor: folioTokens.borderStrong, color: folioTokens.ink2 }}>Filter</button>
            <button className="h-8 px-3 rounded-full text-[12px] border inline-flex items-center gap-1.5" style={{ borderColor: folioTokens.borderStrong, color: folioTokens.ink2 }}>Sort: Cost <Icon name="chevronDown" className="h-3 w-3" /></button>
          </div>
        </div>

        <FolioRegister items={window.SUBSCRIPTIONS} accent={accent} />
      </section>
    </div>
  );
}

function FolioTimeline({ items, accent }) {
  // 4-week strip
  const weeks = [];
  for (let w = 0; w < 5; w++) {
    const start = new Date(window.TODAY);
    start.setDate(start.getDate() + w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const bills = items.filter((it) => it.nextBilling >= start && it.nextBilling <= end);
    weeks.push({ start, end, bills });
  }
  return (
    <div className="grid grid-cols-5 gap-px rounded-sm overflow-hidden" style={{ background: folioTokens.border, border: `1px solid ${folioTokens.border}` }}>
      {weeks.map((w, i) => {
        const total = w.bills.reduce((s, b) => s + b.cost, 0);
        return (
          <div key={i} className="p-5" style={{ background: folioTokens.surface }}>
            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: folioTokens.muted }}>
              Week of {window.fmtDate(w.start)}
            </div>
            <div className="mt-3 tnum text-[24px] font-medium tracking-[-0.02em]" style={{ fontFamily: folioTokens.serif }}>
              {window.fmt(total)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: folioTokens.muted }}>{w.bills.length} charge{w.bills.length === 1 ? "" : "s"}</div>
            <div className="mt-3 space-y-1.5">
              {w.bills.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center gap-2 text-[11.5px]">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: folioCatColor(b.category) }} />
                  <span className="truncate flex-1" style={{ color: folioTokens.ink2 }}>{b.name}</span>
                  <span className="tnum" style={{ color: folioTokens.muted }}>{window.fmtDate(b.nextBilling)}</span>
                </div>
              ))}
              {w.bills.length > 3 && (
                <div className="text-[10.5px]" style={{ color: folioTokens.muted, fontFamily: folioTokens.serif, fontStyle: "italic" }}>
                  +{w.bills.length - 3} more
                </div>
              )}
              {w.bills.length === 0 && (
                <div className="text-[11px]" style={{ color: folioTokens.faint, fontStyle: "italic", fontFamily: folioTokens.serif }}>Nothing due.</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FolioRegister({ items, accent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
      {items.map((s, i) => {
        const days = window.daysUntil(s.nextBilling);
        return (
          <div key={s.id} className="flex items-center gap-4 py-4 border-b" style={{ borderColor: folioTokens.border }}>
            <Logo sub={s} size={44} rounded="rounded-md" ring />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div style={{ fontFamily: folioTokens.serif }} className="text-[17px] truncate">{s.name}</div>
                {s.isTrial && <span className="text-[10px] uppercase tracking-wider" style={{ color: accent }}>trial</span>}
                {s.priceChange && (
                  <span className="text-[10.5px] tnum inline-flex items-center gap-0.5" style={{ color: "#A04C3C" }}>
                    <Icon name="arrowUp" className="h-2.5 w-2.5" />{window.fmt(s.priceChange.change)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11.5px]" style={{ color: folioTokens.muted }}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: folioCatColor(s.category) }} />
                  {s.category}
                </span>
                <span>·</span>
                <span className="tnum">Next {window.fmtDate(s.nextBilling)} ({days}d)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="tnum text-[15px] font-medium">{window.fmt(s.cost)}</div>
              <div className="text-[10.5px] capitalize" style={{ color: folioTokens.muted, fontFamily: folioTokens.serif, fontStyle: "italic" }}>per {s.cycle.replace("ly", "")}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Detail ---
function FolioDetail({ accent }) {
  const sub = window.SUBSCRIPTIONS.find((s) => s.id === "spotify");
  const history = Array.from({ length: 8 }).map((_, i) => {
    const dt = new Date(window.TODAY);
    dt.setMonth(dt.getMonth() - i - 1);
    dt.setDate(26);
    return { date: dt, amount: i < 4 ? 11.99 : 10.99 };
  });
  const lifetime = history.reduce((s, h) => s + h.amount, 0) + 350;
  return (
    <div className="px-8 pt-10">
      <button className="text-[11.5px] uppercase tracking-[0.18em] inline-flex items-center gap-1 mb-6" style={{ color: folioTokens.muted }}>
        <Icon name="chevronLeft" className="h-3 w-3" /> Back to register
      </button>

      {/* Editorial hero */}
      <section className="grid grid-cols-12 gap-10 pb-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="col-span-12 md:col-span-7">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>{sub.category}</div>
          <div className="mt-3 flex items-start gap-5">
            <Logo sub={sub} size={84} rounded="rounded-lg" ring />
            <div>
              <h1 style={{ fontFamily: folioTokens.serif }} className="text-[54px] leading-[0.95] tracking-[-0.02em] font-medium">{sub.name}</h1>
              <p className="mt-3 text-[13px]" style={{ color: folioTokens.muted }}>
                {sub.domain} · Active since {window.fmtDateLong(sub.startedAt)}
              </p>
            </div>
          </div>
          <p className="mt-6 text-[14.5px] leading-[1.65] max-w-prose" style={{ color: folioTokens.ink2 }}>
            You've been a {sub.name} subscriber for{" "}
            <span style={{ fontFamily: folioTokens.serif, fontStyle: "italic" }}>six years and nine months</span>, paying{" "}
            <span className="tnum font-medium">{window.fmtNoCents(lifetime)}</span> in total. The price{" "}
            <span style={{ color: "#A04C3C" }}>rose by {window.fmt(sub.priceChange.change)}</span> last month —
            the first increase since you joined.
          </p>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <dl className="rounded-sm overflow-hidden" style={{ background: folioTokens.surfaceHi, border: `1px solid ${folioTokens.border}` }}>
            {[
              { l: "Cost", v: window.fmt(sub.cost), s: `per ${sub.cycle.replace("ly", "")}` },
              { l: "Next charge", v: window.fmtDate(sub.nextBilling), s: `in ${window.daysUntil(sub.nextBilling)} days` },
              { l: "Lifetime spend", v: window.fmtNoCents(lifetime), s: "all time" },
              { l: "Average / mo", v: window.fmt(lifetime / 81), s: "since start" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 items-baseline px-5 py-4 border-b last:border-b-0" style={{ borderColor: folioTokens.border }}>
                <dt className="col-span-5 text-[11.5px] uppercase tracking-[0.18em]" style={{ color: folioTokens.muted }}>{row.l}</dt>
                <dd className="col-span-7 text-right">
                  <div style={{ fontFamily: folioTokens.serif }} className="text-[22px] tracking-tight tnum">{row.v}</div>
                  <div className="text-[11px] italic" style={{ color: folioTokens.muted, fontFamily: folioTokens.serif }}>{row.s}</div>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-2">
            <button className="h-9 flex-1 rounded-full text-[12.5px] inline-flex items-center justify-center gap-1.5" style={{ background: folioTokens.surface, border: `1px solid ${folioTokens.borderStrong}`, color: folioTokens.ink2 }}>
              <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
            </button>
            <button className="h-9 flex-1 rounded-full text-[12.5px]" style={{ background: folioTokens.surface, border: `1px solid ${folioTokens.borderStrong}`, color: "#A04C3C" }}>
              Cancel subscription
            </button>
          </div>
        </aside>
      </section>

      {/* History */}
      <section className="py-10">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>Billing record</div>
            <h2 style={{ fontFamily: folioTokens.serif }} className="text-[28px] tracking-tight">A history of charges.</h2>
          </div>
          <button className="text-[12px] underline decoration-dotted" style={{ color: folioTokens.ink2 }}>Export CSV</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {history.map((h, i) => {
            const prev = history[i + 1];
            const changed = prev && prev.amount !== h.amount;
            return (
              <div key={i} className="flex items-baseline gap-4 py-3 border-b" style={{ borderColor: folioTokens.border }}>
                <div className="tnum text-[12.5px] w-24" style={{ color: folioTokens.muted }}>{window.fmtDateLong(h.date)}</div>
                <div className="flex-1 text-[12.5px]" style={{ color: folioTokens.ink2 }}>
                  Charged · Visa ··4242
                  {changed && <span className="ml-2 text-[10.5px]" style={{ color: "#A04C3C" }}>price increase</span>}
                </div>
                <div className="tnum text-[14px] font-medium">{window.fmt(h.amount)}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// --- Settings ---
function FolioSettings({ accent }) {
  return (
    <div className="px-8 pt-10">
      <section className="pb-8 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>Account</div>
        <h1 style={{ fontFamily: folioTokens.serif }} className="text-[44px] tracking-[-0.02em] mt-2">Preferences.</h1>
        <p className="mt-4 max-w-prose text-[14px] leading-[1.65]" style={{ color: folioTokens.ink2 }}>
          Tune how the Ledger talks to you. You can pick a different display currency, set a budget the editor will respect when warning you,
          and choose how many days of warning you'd like before a charge appears.
        </p>
      </section>

      <section className="grid grid-cols-12 gap-10 py-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="col-span-12 md:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Display</div>
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[24px] mt-1">Currency & format.</h2>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-5">
          <FolioField label="Preferred currency" hint="All totals convert to this." accent={accent}>
            <select className="h-10 px-3 rounded-sm text-[13.5px] w-full md:w-72 outline-none" style={{ background: folioTokens.surfaceHi, border: `1px solid ${folioTokens.borderStrong}`, fontFamily: "Inter" }}>
              <option>USD — US Dollar</option>
              <option>EUR — Euro</option>
              <option>GBP — Pound Sterling</option>
              <option>ILS — Israeli Shekel</option>
            </select>
          </FolioField>
          <FolioField label="Theme" hint="The Ledger looks best in cream." accent={accent}>
            <div className="inline-flex rounded-sm overflow-hidden" style={{ border: `1px solid ${folioTokens.borderStrong}` }}>
              {["Cream", "Paper", "Dusk"].map((t, i) => (
                <button key={t} className="px-4 h-10 text-[12.5px]" style={{ background: i === 0 ? accent : folioTokens.surfaceHi, color: i === 0 ? "#fff" : folioTokens.ink2 }}>{t}</button>
              ))}
            </div>
          </FolioField>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-10 py-10 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="col-span-12 md:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Boundaries</div>
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[24px] mt-1">Budget & reminders.</h2>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-5">
          <FolioField label="Monthly budget" hint="We'll write a stronger note past 100%." accent={accent}>
            <div className="inline-flex items-center rounded-sm overflow-hidden h-10" style={{ border: `1px solid ${folioTokens.borderStrong}` }}>
              <span className="px-3 text-[14px]" style={{ background: folioTokens.bg2, color: folioTokens.muted }}>$</span>
              <input defaultValue="220" className="h-full w-28 px-2 text-[14px] tnum outline-none" style={{ background: folioTokens.surfaceHi }} />
            </div>
          </FolioField>
          <FolioField label="Reminder lead time" hint="Days before each renewal." accent={accent}>
            <div className="inline-flex rounded-sm overflow-hidden" style={{ border: `1px solid ${folioTokens.borderStrong}` }}>
              {[1, 3, 7, 14].map((d) => (
                <button key={d} className="px-4 h-10 text-[12.5px] tnum" style={{ background: d === 3 ? accent : folioTokens.surfaceHi, color: d === 3 ? "#fff" : folioTokens.ink2 }}>{d} days</button>
              ))}
            </div>
          </FolioField>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-10 py-10">
        <div className="col-span-12 md:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: folioTokens.muted }}>Correspondence</div>
          <h2 style={{ fontFamily: folioTokens.serif }} className="text-[24px] mt-1">Email notes.</h2>
        </div>
        <div className="col-span-12 md:col-span-8">
          <ul className="divide-y" style={{ borderColor: folioTokens.border }}>
            {[
              { l: "Renewal reminders", d: "A polite heads-up before each charge.", on: true },
              { l: "Trial-ending reminders", d: "A stronger note before a trial converts.", on: true },
              { l: "Budget alerts", d: "Once per month if you exceed the cap.", on: true },
              { l: "Weekly digest", d: "Sunday recap of what's due next.", on: false },
            ].map((n, i) => (
              <li key={i} className="flex items-center justify-between py-4">
                <div>
                  <div className="text-[14px]" style={{ fontFamily: folioTokens.serif }}>{n.l}</div>
                  <div className="text-[12px]" style={{ color: folioTokens.muted }}>{n.d}</div>
                </div>
                <button className="relative h-5 w-9 rounded-full" style={{ background: n.on ? accent : folioTokens.borderStrong }}>
                  <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white" style={{ left: n.on ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function FolioField({ label, hint, children, accent }) {
  return (
    <div>
      <div className="text-[13.5px] font-medium">{label}</div>
      <div className="text-[12px] mb-3" style={{ color: folioTokens.muted }}>{hint}</div>
      {children}
    </div>
  );
}

// --- Cancelled ---
function FolioCancelled({ accent }) {
  const items = window.CANCELLED;
  const lifetime = items.reduce((s, i) => s + i.lifetimeSpend, 0);
  return (
    <div className="px-8 pt-10">
      <section className="pb-8 border-b" style={{ borderColor: folioTokens.borderStrong }}>
        <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>Archive</div>
        <h1 style={{ fontFamily: folioTokens.serif }} className="text-[44px] tracking-[-0.02em] mt-2 leading-[1]">
          Cancelled.{" "}
          <span style={{ color: folioTokens.muted, fontStyle: "italic", fontWeight: 300 }}>
            A record of what you've let go.
          </span>
        </h1>
        <p className="mt-4 max-w-prose text-[14px] leading-[1.65]" style={{ color: folioTokens.ink2 }}>
          You've cancelled <span className="tnum font-medium">{items.length}</span> subscriptions to date. Together they cost{" "}
          <span className="tnum font-medium">{window.fmt(lifetime)}</span> over their lifetimes — a tidy {window.fmt(items.reduce((s, i) => s + i.cost, 0))} saved
          per month.
        </p>
      </section>

      <section className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {items.map((it, i) => {
            const months = Math.round((it.cancelledAt - it.startedAt) / (1000 * 60 * 60 * 24 * 30));
            return (
              <article key={it.id} className="py-5 border-b" style={{ borderColor: folioTokens.border }}>
                <div className="flex items-start gap-4">
                  <Logo sub={it} size={56} rounded="rounded-md" ring />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: folioTokens.muted }}>{it.category} · {months} months</div>
                    <h3 style={{ fontFamily: folioTokens.serif }} className="text-[24px] mt-1 tracking-tight">{it.name}</h3>
                    <p className="text-[12.5px] mt-1" style={{ color: folioTokens.muted, fontFamily: folioTokens.serif, fontStyle: "italic" }}>
                      {window.fmtDateLong(it.startedAt)} – {window.fmtDateLong(it.cancelledAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: folioTokens.muted }}>Lifetime</div>
                    <div style={{ fontFamily: folioTokens.serif }} className="text-[26px] tracking-tight tnum">{window.fmt(it.lifetimeSpend)}</div>
                    <div className="text-[11px]" style={{ color: folioTokens.muted, fontFamily: folioTokens.serif, fontStyle: "italic" }}>
                      ≈ {window.fmt(it.cost)}/mo
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

window.Folio = {
  Shell: FolioShell,
  Dashboard: FolioDashboard,
  Detail: FolioDetail,
  Settings: FolioSettings,
  Cancelled: FolioCancelled,
  tokens: folioTokens,
  defaultAccent: "#B85C3C",
};
