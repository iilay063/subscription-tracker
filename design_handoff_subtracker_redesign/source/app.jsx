// App shell — direction switcher + screen routing + Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "halo",
  "screen": "dashboard",
  "haloAccent": "#2B8F66",
  "haloDark": true,
  "haloCalendar": "timeline",
  "auroraAccent": "#2B8F66",
  "auroraDark": false,
  "eclipseAccent": "#8C6FFF",
  "folioAccent": "#B85C3C"
}/*EDITMODE-END*/;

const DIRECTIONS = [
  { id: "halo", label: "Halo", sub: "Aurora × Eclipse hybrid (recommended)" },
  { id: "aurora", label: "Aurora", sub: "Light · Mercury-ish · emerald" },
  { id: "eclipse", label: "Eclipse", sub: "Dark · Linear-ish · violet" },
  { id: "folio", label: "Folio", sub: "Editorial · cream paper · terracotta" },
];

const SCREENS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "detail", label: "Subscription detail" },
  { id: "cancelled", label: "Cancelled" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const direction = t.direction;
  const screen = t.screen;

  const setScreen = (s) => setTweak({ screen: s });
  const setDirection = (d) => setTweak({ direction: d });
  const setCalendarView = (v) => setTweak({ haloCalendar: v });

  const accentKey = `${direction}Accent`;
  const accent = t[accentKey];

  const Dir =
    direction === "halo" ? window.Halo :
    direction === "aurora" ? window.Aurora :
    direction === "eclipse" ? window.Eclipse :
    window.Folio;

  // Per-direction extra props
  let extraProps = {};
  if (direction === "halo") {
    extraProps = { dark: t.haloDark, calendarView: t.haloCalendar, setCalendarView };
  } else if (direction === "aurora") {
    extraProps = { dark: t.auroraDark };
  }

  let screenEl = null;
  if (screen === "dashboard") screenEl = <Dir.Dashboard accent={accent} {...extraProps} />;
  else if (screen === "detail") screenEl = <Dir.Detail accent={accent} {...extraProps} />;
  else if (screen === "settings") screenEl = <Dir.Settings accent={accent} {...extraProps} />;
  else if (screen === "cancelled") screenEl = <Dir.Cancelled accent={accent} {...extraProps} />;

  return (
    <div className="min-h-screen w-full">
      <DirectionSwitcher direction={direction} setDirection={setDirection} screen={screen} setScreen={setScreen} />

      <div data-screen-label={`${direction}-${screen}`}>
        <Dir.Shell accent={accent} screen={screen} setScreen={setScreen} {...extraProps}>
          {screenEl}
        </Dir.Shell>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Direction" />
        <TweakSelect
          label="Style"
          value={direction}
          options={DIRECTIONS.map((d) => ({ value: d.id, label: d.label }))}
          onChange={(v) => setDirection(v)}
        />

        <TweakSection label="Screen" />
        <TweakSelect
          label="View"
          value={screen}
          options={SCREENS.map((s) => ({ value: s.id, label: s.label }))}
          onChange={(v) => setScreen(v)}
        />

        {direction === "halo" && (
          <>
            <TweakSection label="Halo" />
            <TweakToggle
              label="Dark mode"
              value={t.haloDark}
              onChange={(v) => setTweak({ haloDark: v })}
            />
            <TweakRadio
              label="Calendar"
              value={t.haloCalendar}
              options={[{ value: "timeline", label: "Timeline" }, { value: "grid", label: "Grid" }]}
              onChange={(v) => setTweak({ haloCalendar: v })}
            />
            <TweakColor
              label="Accent"
              value={t.haloAccent}
              options={["#2B8F66", "#8C6FFF", "#476FC7", "#B85C3C", "#C99A2E"]}
              onChange={(v) => setTweak({ haloAccent: v })}
            />
          </>
        )}

        {direction === "aurora" && (
          <>
            <TweakSection label="Aurora" />
            <TweakToggle
              label="Dark mode"
              value={t.auroraDark}
              onChange={(v) => setTweak({ auroraDark: v })}
            />
            <TweakColor
              label="Accent"
              value={t.auroraAccent}
              options={["#2B8F66", "#476FC7", "#B85C3C", "#7A4CAF", "#C99A2E"]}
              onChange={(v) => setTweak({ auroraAccent: v })}
            />
          </>
        )}

        {direction === "eclipse" && (
          <>
            <TweakSection label="Eclipse" />
            <TweakColor
              label="Accent"
              value={t.eclipseAccent}
              options={["#8C6FFF", "#5DC2D0", "#E879B7", "#7DC88C", "#E18B6B"]}
              onChange={(v) => setTweak({ eclipseAccent: v })}
            />
          </>
        )}

        {direction === "folio" && (
          <>
            <TweakSection label="Folio" />
            <TweakColor
              label="Accent"
              value={t.folioAccent}
              options={["#B85C3C", "#5F7A3F", "#3C5C8C", "#806C42", "#A04C6A"]}
              onChange={(v) => setTweak({ folioAccent: v })}
            />
          </>
        )}
      </TweaksPanel>
    </div>
  );
}

function DirectionSwitcher({ direction, setDirection, screen, setScreen }) {
  return (
    <div className="sticky top-0 z-30 w-full flex justify-center pointer-events-none">
      <div className="pointer-events-auto mt-3 inline-flex items-center gap-1 rounded-full p-1 border"
        style={{
          background: "rgba(20,20,22,0.85)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 30px -10px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}>
        {DIRECTIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDirection(d.id)}
            className="px-3 h-7 rounded-full text-[12px] font-medium"
            style={{
              backgroundColor: direction === d.id ? "#fff" : "transparent",
              color: direction === d.id ? "#111" : "rgba(255,255,255,0.78)",
            }}
          >
            {d.label}
          </button>
        ))}
        <div className="h-4 w-px mx-1" style={{ background: "rgba(255,255,255,0.12)" }} />
        <select
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
          className="bg-transparent text-[12px] px-2 outline-none cursor-pointer"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {SCREENS.map((s) => (
            <option key={s.id} value={s.id} style={{ background: "#181820", color: "#fff" }}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
