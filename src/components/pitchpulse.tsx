import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleUserRound,
  Download,
  Gauge,
  Globe2,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import {
  buildOverlayJson,
  buildRecapJson,
  events,
  eventsUpTo,
  match,
  scoreAt,
  statsAt,
  STORIES,
  type EventType,
} from "@/data/match";

type Mode = "Fan" | "Analyst" | "Broadcast";
type Scene = { path: string; number: string; label: string; short: string; icon: typeof Activity };
const scenes: Scene[] = [
  { path: "/", number: "01", label: "Live Match", short: "Command Centre", icon: Activity },
  { path: "/tactical", number: "02", label: "Tactical", short: "Intelligence", icon: Gauge },
  {
    path: "/studio",
    number: "03",
    label: "Story Studio",
    short: "Story & Overlay",
    icon: Sparkles,
  },
  { path: "/recap", number: "04", label: "Recap", short: "Match Recap", icon: Trophy },
  { path: "/stack", number: "05", label: "System", short: "Technology Stack", icon: BarChart3 },
  { path: "/explorer", number: "06", label: "Replay", short: "Event Explorer", icon: Activity },
  {
    path: "/personalise",
    number: "07",
    label: "Preferences",
    short: "Personalisation",
    icon: CircleUserRound,
  },
  {
    path: "/recap-studio",
    number: "08",
    label: "Full Time",
    short: "Recap Studio",
    icon: BookOpen,
  },
];
const sceneCopy: Record<string, { kicker: string; title: string; description: string }> = {
  "/": {
    kicker: "LIVE MATCH COMMAND CENTRE",
    title: "Every event has a story.",
    description: "Synthetic match intelligence, in motion.",
  },
  "/tactical": {
    kicker: "TACTICAL INTELLIGENCE",
    title: "See the patterns.",
    description: "Read the game beyond the scoreboard.",
  },
  "/studio": {
    kicker: "STORY & OVERLAY STUDIO",
    title: "Make the moment matter.",
    description: "One verified event. Three ways to tell it.",
  },
  "/recap": {
    kicker: "MATCH RECAP",
    title: "The complete picture.",
    description: "Key moments, context and the final word.",
  },
  "/stack": {
    kicker: "MICROSOFT TECHNOLOGY STACK",
    title: "Build smarter.",
    description: "A planned architecture for football intelligence.",
  },
  "/explorer": {
    kicker: "APP NAVIGATION & LIVE MATCH",
    title: "Replay the evidence.",
    description: "A forensic timeline for every event.",
  },
  "/personalise": {
    kicker: "MULTI-LANGUAGE & PERSONALISATION",
    title: "Your match. Your language.",
    description: "The same intelligence, tuned to you.",
  },
  "/recap-studio": {
    kicker: "FULL TIME. FULL STORY.",
    title: "More than a score.",
    description: "Assemble the story worth replaying.",
  },
};

function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`hud-panel ${className}`}>
      {title && <div className="panel-label">{title}</div>}
      {children}
    </section>
  );
}
function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={accent ? "lime" : ""}>{value}</strong>
    </div>
  );
}
function MiniPitch({ selected = 67, heat = false }: { selected?: number; heat?: boolean }) {
  return (
    <div className={`mini-pitch ${heat ? "heat" : ""}`}>
      <div className="pitch-half" />
      <div className="pitch-circle" />
      <div className="pitch-box left" />
      <div className="pitch-box right" />
      {events.slice(0, 6).map((event) => (
        <span
          key={event.id}
          className={`player-dot ${event.minute === selected ? "selected" : ""}`}
          style={{ left: `${event.x}%`, top: `${event.y}%` }}
        />
      ))}
      <span className="ball" style={{ left: "62%", top: "46%" }} />
    </div>
  );
}
function Bars({ values }: { values: number[] }) {
  return (
    <div className="bars" aria-label="Tactical intensity chart">
      {values.map((v, i) => (
        <i key={i} style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

export function PitchPulseApp() {
  const location = useLocation();
  const path = location.pathname;
  const copy = sceneCopy[path] ?? sceneCopy["/"]!;
  const [clock, setClock] = useState(
    path === "/recap" || path === "/recap-studio" ? 90 : match.clock,
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<Mode>("Fan");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Tamil">("English");
  const [selectedEvent, setSelectedEvent] = useState(events[3]!);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const stats = useMemo(() => statsAt(clock), [clock]);
  const visibleEvents = eventsUpTo(clock).slice().reverse();
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setClock((current) => (current >= 90 ? 0 : current + speed)),
      800,
    );
    return () => window.clearInterval(timer);
  }, [playing, speed]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const download = (name: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    notify("EXPORT READY · JSON downloaded");
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className={`rail ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">P</span>
          <span>
            PITCH<span className="lime">PULSE</span>
          </span>
          <button
            className="close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="rail-status">
          <span className="status-dot" /> SYNTHETIC DEMO
        </div>
        <nav aria-label="Primary navigation">
          <p className="nav-heading">MATCH INTELLIGENCE</p>
          {scenes.slice(0, 4).map((scene) => (
            <NavItem key={scene.path} scene={scene} active={path === scene.path} />
          ))}
          <p className="nav-heading">SYSTEM</p>
          {scenes.slice(4).map((scene) => (
            <NavItem key={scene.path} scene={scene} active={path === scene.path} />
          ))}
        </nav>
        <div className="rail-footer">
          <span className="crosshair">+</span>
          <p>
            REAL EVENTS.
            <br />
            <b>REAL INSIGHTS.</b>
          </p>
        </div>
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            PITCHPULSE <span>/</span> {copy.kicker}
          </div>
          <div className="top-meta">
            <span className="live-pill">
              <span className="status-dot" /> LIVE
            </span>
            <span className="clock">{formatClock(clock)}</span>
            <span className="signal">⌁⌁⌁</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="canvas">
          <div className="scene-header">
            <div>
              <p className="eyebrow">{copy.kicker}</p>
              <h1>{copy.title}</h1>
              <p className="scene-description">{copy.description}</p>
            </div>
            <div className="scene-index">
              <span>{scenes.find((scene) => scene.path === path)?.number ?? "01"}</span>
              <small>/ 08</small>
            </div>
          </div>
          {path === "/" && (
            <LiveScene
              clock={clock}
              playing={playing}
              setPlaying={setPlaying}
              speed={speed}
              setSpeed={setSpeed}
              stats={stats}
              visibleEvents={visibleEvents}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              setClock={setClock}
            />
          )}
          {path === "/tactical" && <TacticalScene />}
          {path === "/studio" && (
            <StudioScene
              mode={mode}
              setMode={setMode}
              language={language}
              setLanguage={setLanguage}
              notify={notify}
              download={download}
            />
          )}
          {path === "/recap" && <RecapScene />}
          {path === "/stack" && <StackScene />}
          {path === "/explorer" && (
            <ExplorerScene
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              setClock={setClock}
            />
          )}
          {path === "/personalise" && (
            <PreferencesScene
              mode={mode}
              setMode={setMode}
              language={language}
              setLanguage={setLanguage}
            />
          )}
          {path === "/recap-studio" && <RecapStudio download={download} notify={notify} />}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      <div className="mobile-nav">
        {scenes.slice(0, 4).map((scene) => (
          <NavItem key={scene.path} scene={scene} active={path === scene.path} />
        ))}
      </div>
    </div>
  );
}
function NavItem({ scene, active }: { scene: Scene; active: boolean }) {
  const Icon = scene.icon;
  return (
    <Link to={scene.path} className={`nav-item ${active ? "active" : ""}`}>
      <Icon />
      <span>{scene.label}</span>
    </Link>
  );
}
function formatClock(seconds: number) {
  const m = Math.floor(seconds);
  return `${String(m).padStart(2, "0")}:${String(Math.floor((seconds % 1) * 60)).padStart(2, "0")}`;
}

function LiveScene({
  clock,
  playing,
  setPlaying,
  speed,
  setSpeed,
  stats,
  visibleEvents,
  selectedEvent,
  setSelectedEvent,
  setClock,
}: {
  clock: number;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  stats: ReturnType<typeof statsAt>;
  visibleEvents: typeof events;
  selectedEvent: (typeof events)[number];
  setSelectedEvent: (v: (typeof events)[number]) => void;
  setClock: (v: number) => void;
}) {
  return (
    <div className="live-grid">
      <Panel className="pitch-panel">
        <div className="match-strip">
          <span>
            {match.shortHome}{" "}
            <b>
              {scoreAt(clock)[0]} — {scoreAt(clock)[1]}
            </b>{" "}
            {match.shortAway}
          </span>
          <span className="live-pill">● {formatClock(clock)}</span>
        </div>
        <MiniPitch selected={selectedEvent.minute} />
        <div className="pitch-legend">
          <span>
            <i className="dot lime-bg" /> CITY CONTROL
          </span>
          <span>
            <i className="dot teal-bg" /> TRACKING ACTIVE
          </span>
          <span>DATASET: SYNTHETIC</span>
        </div>
        <div className="control-deck">
          <button
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "Pause playback" : "Play playback"}
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <button onClick={() => setClock(0)} aria-label="Restart playback">
            <RotateCcw />
          </button>
          <div className="speed-group">
            {[1, 2, 4].map((n) => (
              <button key={n} className={speed === n ? "selected" : ""} onClick={() => setSpeed(n)}>
                {n}×
              </button>
            ))}
          </div>
          <input
            aria-label="Match timeline"
            type="range"
            min="0"
            max="90"
            step="0.1"
            value={clock}
            onChange={(e) => setClock(Number(e.target.value))}
          />
          <span className="pixel">{playing ? "PLAYING" : "PAUSED"}</span>
        </div>
      </Panel>
      <div className="right-stack">
        <Panel title="MATCH STATS">
          <Stat label="POSSESSION" value={`${stats.possession}%`} accent />
          <Stat label="SHOTS" value={stats.shots} />
          <Stat label="ON TARGET" value={stats.onTarget} accent />
          <Stat label="PASS ACCURACY" value={`${stats.passAccuracy}%`} accent />
        </Panel>
        <Panel title="EVENT FEED">
          <div className="event-list">
            {visibleEvents.slice(0, 5).map((event) => (
              <button
                className={`event-row ${selectedEvent.id === event.id ? "selected" : ""}`}
                key={event.id}
                onClick={() => setSelectedEvent(event)}
              >
                <time>
                  {String(event.minute).padStart(2, "0")}:{event.type === "Goal" ? "00" : "32"}
                </time>
                <span>
                  <b>{event.type}</b> · {event.player}
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="LATEST INSIGHT">
          <p className="insight-copy">
            High press success is creating fast transitions. <b>{stats.recoveries} recoveries</b>{" "}
            recorded in the attacking half.
          </p>
          <div className="evidence-line">
            <span>EV-021 · EV-052</span>
            <b>VERIFIED SYNTHETIC DATA</b>
          </div>
        </Panel>
        <Panel title="PLAYER FOCUS · TRACKING LOCK">
          <div className="focus-player">
            <span className="player-number">09</span>
            <div>
              <b>ERLING HAALAND</b>
              <small>2 GOALS · 4 SHOTS · 8.7 RATING</small>
            </div>
            <ChevronRight />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TacticalScene() {
  const [pattern, setPattern] = useState("HIGH-PRESS SUCCESS");
  const patterns = [
    ["HIGH-PRESS SUCCESS", "EV-021 · EV-052", "3 recoveries in 90 seconds"],
    ["MOMENTUM SHIFT", "EV-028 · EV-067", "City control after 43'"],
    ["PLAYER IMPACT", "EV-001 · EV-028", "Haaland 2 goals · 4 shots"],
  ];
  const selected = patterns.find(([name]) => name === pattern) ?? patterns[0]!;
  return (
    <div className="tactical-grid scene-console">
      <Panel title="HEATMAP & PRESSURE ZONES · 1ST HALF · 0'–45'" className="heat-panel">
        <div className="viewport-labels">
          <span>MCI / ATTACKING HALF</span>
          <span>TRACK: {selected[0]}</span>
        </div>
        <MiniPitch heat />
        <div className="heat-callout">
          <b>◎ {selected[0]}</b>
          <small>{selected[2]}</small>
          <small>{selected[1]}</small>
        </div>
        <div className="heat-legend">
          <span>LOW</span>
          <i />
          <i />
          <i />
          <i />
          <span>HIGH</span>
          <em>● MCI &nbsp; ● LIV &nbsp; — PASS &nbsp; ⌁ PRESSURE ZONE</em>
        </div>
      </Panel>
      <Panel title="PASSING NETWORK" className="network-panel">
        <div className="network">
          <svg viewBox="0 0 320 190" aria-label="Passing network diagram">
            <g stroke="currentColor" opacity=".55">
              {[
                [40, 140, 130, 42],
                [130, 42, 220, 70],
                [40, 140, 180, 150],
                [180, 150, 260, 95],
                [130, 42, 260, 95],
                [40, 140, 260, 95],
                [220, 70, 180, 150],
              ].map((line, i) => (
                <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} />
              ))}
            </g>
            {[
              [40, 140],
              [130, 42],
              [220, 70],
              [180, 150],
              [260, 95],
            ].map((p, i) => (
              <circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r="8"
                fill={i === 1 ? "#D9FD91" : "#012420"}
                stroke="currentColor"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
        <div className="player-rank">
          <span>#10 HAALAND</span>
          <b>8.7</b>
          <span>#17 DE BRUYNE</span>
          <b>8.4</b>
          <span>#16 RODRI</span>
          <b>7.9</b>
        </div>
      </Panel>
      <Panel title="TACTICAL METRICS" className="metrics-panel">
        <Stat label="PRESSURE INDEX" value="72 / 100" accent />
        <Stat label="MOMENTUM" value="+3.2" accent />
        <Stat label="CONTROL VS CHAOS" value="68 / 100" />
        <Stat label="FINAL-THIRD ENTRIES" value="24" />
        <div className="metric-foot">
          <span>TOTAL PASSES</span>
          <b>482</b>
          <span>COMPLETION RATE</span>
          <b>87%</b>
        </div>
      </Panel>
      <Panel title="PATTERNS DETECTED · SELECT TO INSPECT EVIDENCE" className="patterns-panel">
        <div className="pattern-tabs">
          {patterns.map(([name]) => (
            <button
              key={name}
              className={pattern === name ? "selected" : ""}
              onClick={() => setPattern(name ?? "")}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="pattern-evidence">
          <span>◎</span>
          <div>
            <b>{selected[0]}</b>
            <small>{selected[2]}</small>
            <small className="pixel">EVIDENCE: {selected[1]}</small>
          </div>
          <ChevronRight />
        </div>
        <Bars values={[32, 48, 38, 68, 55, 82, 62, 92, 74, 86]} />
      </Panel>
    </div>
  );
}
function StudioScene({
  mode,
  setMode,
  language,
  setLanguage,
  notify,
  download,
}: {
  mode: Mode;
  setMode: (v: Mode) => void;
  language: "English" | "Hindi" | "Tamil";
  setLanguage: (v: "English" | "Hindi" | "Tamil") => void;
  notify: (v: string) => void;
  download: (n: string, c: string) => void;
}) {
  return (
    <div className="studio-grid">
      <Panel title="CHOOSE MODE" className="mode-panel">
        {(["Fan", "Analyst", "Broadcast"] as Mode[]).map((item) => (
          <button
            className={`mode-button ${mode === item ? "selected" : ""}`}
            key={item}
            onClick={() => setMode(item)}
          >
            <Sparkles /> {item} Mode
          </button>
        ))}
        <div className="field-label">LANGUAGE</div>
        <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
          <option>English</option>
          <option>Hindi</option>
          <option>Tamil</option>
        </select>
      </Panel>
      <Panel className="story-panel">
        <div className="story-art">
          <span>GOAL</span>
          <strong>09</strong>
        </div>
        <div>
          <p className="eyebrow">43&apos; · MCI 2–0 LIV</p>
          <h2>{STORIES[mode][language]}</h2>
          <p className="body-copy">
            The Norwegian forward shows his class once more, finishing with precision after a
            brilliant through ball. His movement and timing continue to be unstoppable.
          </p>
          <span className="tag">PLAYER IMPACT</span>
        </div>
      </Panel>
      <Panel title="BROADCAST OVERLAY PREVIEW" className="overlay-panel">
        <div className="broadcast-card">
          <span>43:00 · LIVE</span>
          <strong>{STORIES.Broadcast.English}</strong>
          <small>MANCHESTER CITY · #9 HAALAND</small>
        </div>
        <div className="button-row">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(buildOverlayJson(mode, language));
              notify("OVERLAY JSON COPIED");
            }}
          >
            COPY JSON
          </button>
          <button
            onClick={() => download("pitchpulse-overlay.json", buildOverlayJson(mode, language))}
          >
            <Download /> DOWNLOAD
          </button>
        </div>
      </Panel>
    </div>
  );
}
function RecapScene() {
  const moments = events.filter(
    (e) => e.type === "Goal" || e.type === "Shot" || e.type === "Tackle",
  );
  return (
    <div className="recap-grid scene-console">
      <Panel className="score-card">
        <div className="score-header">
          <div>
            <p className="eyebrow">MATCH RECAP · FULL TIME · 90:00</p>
            <h2>
              MANCHESTER CITY <b>2 — 0</b> LIVERPOOL
            </h2>
          </div>
          <span className="full-time-mark">
            FT
            <br />
            <small>90:00</small>
          </span>
        </div>
        <div className="score-stats">
          <span>
            POSSESSION <b>62%</b>
            <i style={{ width: "62%" }} />
          </span>
          <span>
            SHOTS <b>10 — 4</b>
            <i style={{ width: "76%" }} />
          </span>
          <span>
            ON TARGET <b>8 — 2</b>
            <i style={{ width: "82%" }} />
          </span>
          <span>
            CORNERS <b>4 — 1</b>
            <i style={{ width: "54%" }} />
          </span>
        </div>
      </Panel>
      <Panel title="KEY MOMENTS · MATCH TIMELINE">
        <div className="timeline-rail">
          {moments.map((event) => (
            <div className="timeline-row" key={event.id}>
              <b>{event.minute}&apos;</b>
              <span className={`dot ${event.type === "Goal" ? "lime-bg" : "teal-bg"}`} />
              <div>
                <strong>
                  {event.type} · {event.player}
                </strong>
                <small>{event.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="STANDOUT PLAYER" className="standout">
        <div className="player-number">09</div>
        <div>
          <p className="eyebrow">MCI · FORWARD</p>
          <h2>ERLING HAALAND</h2>
          <p className="lime big-number">9.2</p>
          <small>MATCH RATING · 2 GOALS · 4 SHOTS</small>
        </div>
      </Panel>
      <Panel title="TACTICAL TAKEAWAYS" className="takeaway-panel">
        <div className="mini-takeaway">
          <MiniPitch heat />
          <div>
            <b>HIGH-PRESS SUCCESS</b>
            <p>City&apos;s high press created fast recoveries and short, high-value possessions.</p>
          </div>
        </div>
      </Panel>
      <Panel title="PERSONALISED STORY · FAN MODE">
        <p className="body-copy">
          City&apos;s high press and quick transitions made the difference. Haaland&apos;s clinical
          finishing and De Bruyne&apos;s creativity proved decisive.
        </p>
        <button className="primary-action">
          READ FULL STORY <ChevronRight />
        </button>
      </Panel>
    </div>
  );
}
function StackScene() {
  const tech = [
    ["GitHub", "Code · collaborate · ship", "FRONTEND DEMO"],
    ["GitHub Copilot", "AI pair programmer", "FRONTEND DEMO"],
    ["Microsoft Foundry", "AI models · storytelling", "PLANNED INTEGRATION"],
    ["Azure AI Translator", "Multi-language support", "PLANNED INTEGRATION"],
    ["Azure SQL Database", "Match history · data storage", "PLANNED INTEGRATION"],
    ["Azure Static Web Apps", "Frontend hosting", "FRONTEND DEMO"],
    ["Microsoft Fabric", "Analytics · data pipeline", "PLANNED INTEGRATION"],
    ["Azure for Students", "$100 credits · eligible", "FRONTEND DEMO"],
  ] as const;
  const steps = [
    ["INGEST", "Synthetic event stream"],
    ["PROCESS", "Event processing"],
    ["ANALYSE", "Tactical rules"],
    ["GENERATE", "Grounded narrative"],
    ["DELIVER", "Broadcast / recap"],
  ] as const;
  return (
    <div className="stack-grid scene-console">
      <Panel title="PLANNED DATA FLOW · SYNTHETIC DEMO" className="pipeline">
        <div className="pipeline-line">
          {steps.map(([label, detail], i) => (
            <div key={label}>
              <span>0{i + 1}</span>
              <b>{label}</b>
              <small>{detail}</small>
              {i < 4 && <ChevronRight />}
            </div>
          ))}
        </div>
        <div className="flow-trace">
          <span>EVENT FEED</span>
          <i />
          <span>RULES</span>
          <i />
          <span>STORY + OVERLAY + RECAP</span>
        </div>
        <p className="system-note">
          FRONTEND PROTOTYPE · NO SERVICES CONNECTED · STATUS LABELS ARE HONEST
        </p>
      </Panel>
      <Panel title="THE POWER BEHIND THE GAME" className="principles">
        <div className="principle-mark">▦</div>
        <h3>BUILD SMARTER.</h3>
        {[
          "Evidence-based",
          "Explainable",
          "Multi-language",
          "Audience-personalised",
          "Broadcast-ready",
        ].map((item) => (
          <div className="principle" key={item}>
            <span>✓</span>
            {item}
          </div>
        ))}
      </Panel>
      <Panel title="MICROSOFT TECHNOLOGY STACK" className="tech-cards">
        {tech.map(([item, detail, status]) => (
          <div className="tech-tile" key={item}>
            <span className="tech-icon">✦</span>
            <div>
              <b>{item}</b>
              <small>{detail}</small>
              <em>{status}</em>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
function ExplorerScene({
  selectedEvent,
  setSelectedEvent,
  setClock,
}: {
  selectedEvent: (typeof events)[number];
  setSelectedEvent: (v: (typeof events)[number]) => void;
  setClock: (v: number) => void;
}) {
  const [filter, setFilter] = useState<EventType | "All">("All");
  const [team, setTeam] = useState("All teams");
  const filtered = events.filter(
    (event) =>
      (filter === "All" || event.type === filter) && (team === "All teams" || event.team === team),
  );
  const select = (event: (typeof events)[number]) => {
    setSelectedEvent(event);
    setClock(event.minute);
  };
  return (
    <div className="explorer-grid scene-console">
      <Panel title="FILTERS · EVENT INDEX" className="filter-panel">
        <label>
          TEAM
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option>All teams</option>
            <option>MCI</option>
            <option>LIV</option>
          </select>
        </label>
        <label>
          EVENT TYPE
          <select value={filter} onChange={(e) => setFilter(e.target.value as EventType | "All")}>
            <option>All</option>
            {["Goal", "Shot", "Pass", "Tackle", "Recovery", "Pressure", "Corner"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          PLAYER
          <select>
            <option>All players</option>
            <option>Erling Haaland</option>
            <option>Rodri</option>
            <option>Kevin De Bruyne</option>
          </select>
        </label>
        <label>
          MINUTE RANGE
          <input type="range" min="0" max="90" defaultValue="67" />
        </label>
        <div className="button-row">
          <button
            className="primary-action"
            onClick={() => {
              setFilter("All");
              setTeam("All teams");
            }}
          >
            APPLY FILTERS
          </button>
          <button
            onClick={() => {
              setFilter("All");
              setTeam("All teams");
            }}
          >
            RESET
          </button>
        </div>
        <p className="pixel">{filtered.length} EVENTS INDEXED</p>
        <MiniPitch selected={selectedEvent.minute} />
        <div className="event-counts">
          {["Pass", "Shot", "Tackle", "Foul", "Recovery", "Goal"].map((type) => (
            <span key={type}>
              {type}
              <b>{events.filter((e) => e.type === type).length}</b>
            </span>
          ))}
        </div>
      </Panel>
      <div className="explorer-center">
        <Panel title="EVENT POSITION · SELECTED MARKER">
          <MiniPitch selected={selectedEvent.minute} />
          <div className="pitch-legend">
            <span>● MCI</span>
            <span>● LIV</span>
            <span>◎ SELECTED EVENT</span>
          </div>
        </Panel>
        <Panel title={`EVENT DETAILS · ${selectedEvent.id}`} className="event-detail">
          <div className="detail-frame">
            <MiniPitch selected={selectedEvent.minute} />
            <span className="detail-play">▶</span>
          </div>
          <div>
            <p className="eyebrow">
              {selectedEvent.type} · {formatClock(selectedEvent.minute)}
            </p>
            <h3>{selectedEvent.player}</h3>
            <p className="body-copy">{selectedEvent.detail}</p>
            <small>
              {selectedEvent.team} · x {selectedEvent.x} · y {selectedEvent.y} · synthetic event
            </small>
          </div>
        </Panel>
        <Panel title="EVENT TIMELINE · REPLAY">
          <input
            className="timeline-input"
            type="range"
            min="0"
            max="90"
            value={selectedEvent.minute}
            onChange={(e) => setClock(Number(e.target.value))}
          />
          <div className="timeline-markers">
            {events.map((event) => (
              <button
                key={event.id}
                style={{ left: `${event.minute}%` }}
                onClick={() => select(event)}
                title={`${event.minute}' ${event.type}`}
              />
            ))}
          </div>
          <div className="control-deck">
            <button onClick={() => setClock(Math.max(0, selectedEvent.minute - 1))}>
              <RotateCcw />
            </button>
            <button onClick={() => setClock(selectedEvent.minute + 1)}>
              <Play />
            </button>
            <span className="pixel">{formatClock(selectedEvent.minute)} · 1× 2× 4×</span>
          </div>
        </Panel>
      </div>
      <div className="explorer-right">
        <Panel title="EVENT LOG · SELECT ROW TO REPLAY">
          <div className="event-table">
            <table>
              <caption className="sr-only">Synthetic event log</caption>
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>TYPE</th>
                  <th>PLAYER</th>
                  <th>TEAM</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr
                    key={event.id}
                    className={selectedEvent.id === event.id ? "selected" : ""}
                    onClick={() => select(event)}
                  >
                    <td>{event.minute}&apos;</td>
                    <td>{event.type}</td>
                    <td>{event.player.replace("Erling ", "")}</td>
                    <td>{event.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="EVENT PAYLOAD · JSON">
          <pre className="json-view">{JSON.stringify(selectedEvent, null, 2)}</pre>
        </Panel>
      </div>
    </div>
  );
}
function PreferencesScene({
  mode,
  setMode,
  language,
  setLanguage,
}: {
  mode: Mode;
  setMode: (v: Mode) => void;
  language: "English" | "Hindi" | "Tamil";
  setLanguage: (v: "English" | "Hindi" | "Tamil") => void;
}) {
  const [club, setClub] = useState("Manchester City");
  const [player, setPlayer] = useState("Erling Haaland #9");
  const [focus, setFocus] = useState("Match story");
  const story = STORIES[mode][language];
  const languagePreview =
    language === "English"
      ? "Haaland strikes again!"
      : language === "Hindi"
        ? "हालैंड फिर चमके!"
        : "ஹாலண்ட் மீண்டும் அசத்தினார்!";
  return (
    <div className="preferences-grid scene-console">
      <Panel title="LANGUAGE · YOUR PREFERENCES" className="preference-panel">
        <div className="language-cards">
          {(["English", "Hindi", "Tamil"] as const).map((item) => (
            <button
              key={item}
              className={language === item ? "selected" : ""}
              onClick={() => setLanguage(item)}
            >
              <Globe2 />
              <b>{item}</b>
              <small>{item === "English" ? "Full experience" : "Translated preview"}</small>
            </button>
          ))}
        </div>
        <label>
          FAVOURITE CLUB
          <select value={club} onChange={(e) => setClub(e.target.value)}>
            <option>Manchester City</option>
            <option>Liverpool</option>
          </select>
        </label>
        <label>
          FAVOURITE PLAYER
          <select value={player} onChange={(e) => setPlayer(e.target.value)}>
            <option>Erling Haaland #9</option>
            <option>Kevin De Bruyne #17</option>
            <option>Phil Foden #47</option>
          </select>
        </label>
        <div className="field-label">FOCUS MODE</div>
        <div className="segmented">
          {["Match story", "Favourite player", "Attacking play", "Tactical insights"].map(
            (item) => (
              <button
                key={item}
                className={focus === item ? "selected" : ""}
                onClick={() => setFocus(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <div className="field-label">VIEWING MODE</div>
        <div className="segmented">
          {(["Fan", "Analyst", "Broadcast"] as Mode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? "selected" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          className="primary-action"
          onClick={() =>
            window.localStorage.setItem(
              "pitchpulse-preferences",
              JSON.stringify({ language, club, player, focus, mode }),
            )
          }
        >
          SAVE PREFERENCES
        </button>
      </Panel>
      <div className="preference-workspace">
        <Panel
          title={`YOUR PERSONALISED EXPERIENCE · ${mode.toUpperCase()} MODE`}
          className="experience experience-main"
        >
          <div className="experience-story">
            <div className="player-portrait">
              <span>09</span>
              <b>
                ERLING
                <br />
                HAALAND
              </b>
            </div>
            <div>
              <p className="eyebrow">
                {language} · {club} · {focus}
              </p>
              <h2>{languagePreview}</h2>
              <p className="body-copy">{story}</p>
              <span className="tag">PLAYER IMPACT · 2 GOALS · 4 SHOTS</span>
            </div>
          </div>
        </Panel>
        <Panel title="WHY IT MATTERS" className="why-panel">
          <p className="body-copy">
            Haaland&apos;s movement dragged Liverpool&apos;s centre-backs out of position, creating
            space for Foden&apos;s chance just minutes later.
          </p>
          <MiniPitch heat />
        </Panel>
        <Panel title="MORE STORIES FOR YOU" className="recommendations">
          {events
            .filter((e) => e.type === "Goal" || e.type === "Pressure")
            .map((e) => (
              <button key={e.id} onClick={() => setLanguage(language)}>
                <span>{e.minute}&apos;</span>
                <b>
                  {e.player} · {e.type}
                </b>
                <small>{e.detail}</small>
              </button>
            ))}
        </Panel>
        <Panel title="LANGUAGE PREVIEW" className="translation-preview">
          <p>{story}</p>
          <span>{formatClock(43)} · MCI 2 — 0 LIV</span>
        </Panel>
      </div>
    </div>
  );
}
function RecapStudio({
  download,
  notify,
}: {
  download: (n: string, c: string) => void;
  notify: (v: string) => void;
}) {
  const [style, setStyle] = useState("Short fan recap");
  const stories: Record<string, { headline: string; body: string }> = {
    "Short fan recap": {
      headline: "City close it out with another Haaland masterclass.",
      body: "Manchester City&apos;s clinical finishing and high pressing proved too much for Liverpool, with Haaland bagging a brace in the first half.",
    },
    "Analyst brief": {
      headline: "High recoveries made the difference in the final third.",
      body: "City compressed the pitch, recovered possession quickly and converted pressure into two high-value finishing sequences.",
    },
    "Broadcast script": {
      headline: "CITY DOUBLE THEIR ADVANTAGE — HAALAND WITH THE FINISH.",
      body: "Two goals. One commanding performance. Manchester City turn pressure into a statement win.",
    },
  };
  const story = stories[style]!;
  const copyRecap = async () => {
    try {
      await navigator.clipboard.writeText(`${story.headline}\n\n${story.body}`);
      notify("RECAP COPIED TO CLIPBOARD");
    } catch {
      notify("COPY BLOCKED · USE EXPORT");
    }
  };
  return (
    <div className="recap-studio-grid scene-console">
      <Panel title="STORY & OVERLAY OUTPUT" className="mode-panel">
        {Object.keys(stories).map((item) => (
          <button
            className={`mode-button ${style === item ? "selected" : ""}`}
            key={item}
            onClick={() => setStyle(item)}
          >
            <BookOpen />
            {item}
          </button>
        ))}
        <div className="score-mini">
          <b>MCI 2 — 0 LIV</b>
          <small>FULL TIME · 90:00</small>
          <span>62% possession · 10 shots · 8 on target</span>
        </div>
      </Panel>
      <Panel title="STORY PREVIEW · GENERATED FROM MATCH EVIDENCE" className="story-preview">
        <p className="eyebrow">PITCHPULSE · FULL-TIME STORY · {style.toUpperCase()}</p>
        <h2>{story.headline}</h2>
        <p className="body-copy">{story.body}</p>
        <div className="story-sections">
          <span>01 · MATCH OVERVIEW</span>
          <span>02 · DEFINING MOMENTS</span>
          <span>03 · TACTICAL EXPLANATION</span>
          <span>04 · PERSONALISED TAKEAWAY</span>
        </div>
        <div className="button-row">
          <button onClick={copyRecap}>COPY RECAP</button>
          <button onClick={() => download("pitchpulse-recap.json", buildRecapJson())}>
            <Download /> COPY JSON
          </button>
          <button onClick={() => download("pitchpulse-recap-package.json", buildRecapJson())}>
            <Download /> DOWNLOAD PACKAGE
          </button>
        </div>
      </Panel>
      <Panel title="KEY MOMENTS" className="studio-moments">
        {events
          .filter((e) => e.type === "Goal" || e.type === "Tackle" || e.type === "Shot")
          .map((event) => (
            <div className="timeline-row" key={event.id}>
              <b>{event.minute}&apos;</b>
              <span className="dot lime-bg" />
              <div>
                <strong>
                  {event.type} · {event.player}
                </strong>
                <small>{event.detail}</small>
              </div>
            </div>
          ))}
      </Panel>
      <Panel title="TACTICAL BREAKDOWN" className="studio-tactics">
        <MiniPitch heat />
        <p className="body-copy">High press forced errors in the final third.</p>
      </Panel>
      <Panel title="PLAYER IMPACT" className="studio-player">
        <div className="big-number lime">9.2</div>
        <b>ERLING HAALAND</b>
        <small>2 GOALS · 4 SHOTS · 87% PASS ACCURACY</small>
      </Panel>
      <Panel title="PERSONALISED TAKEAWAY">
        <p className="body-copy">
          City&apos;s pressing and quick transitions were the difference today.
        </p>
      </Panel>
    </div>
  );
}
