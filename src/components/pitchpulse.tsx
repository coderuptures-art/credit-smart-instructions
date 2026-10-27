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
        </Panel>
      </div>
    </div>
  );
}

function TacticalScene() {
  return (
    <div className="tactical-grid">
      <Panel title="HEATMAP · FIRST HALF" className="heat-panel">
        <MiniPitch heat />
        <div className="heat-legend">
          <span>LOW</span>
          <i />
          <i />
          <i />
          <i />
          <span>HIGH</span>
        </div>
      </Panel>
      <Panel title="PASS NETWORK" className="network-panel">
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
          #10 HAALAND <b>8.7</b>
          <br />
          #17 DE BRUYNE <b>8.4</b>
          <br />
          #16 RODRI <b>7.9</b>
        </div>
      </Panel>
      <Panel title="EXPERIMENTAL DEMO INDICATORS" className="metrics-panel">
        <Stat label="PRESSURE INDEX" value="72 / 100" accent />
        <Stat label="MOMENTUM" value="+3.2" accent />
        <Stat label="CONTROL VS CHAOS" value="68" />
        <Stat label="FINAL-THIRD ENTRIES" value="24" />
      </Panel>
      <Panel title="PATTERNS DETECTED" className="patterns-panel">
        <div className="pattern">
          <span>◎</span>
          <div>
            <b>High-press success</b>
            <small>3 recoveries in 90 seconds</small>
          </div>
        </div>
        <div className="pattern">
          <span>◌</span>
          <div>
            <b>Momentum shift</b>
            <small>City control after 43&apos;</small>
          </div>
        </div>
        <div className="pattern">
          <span>✳</span>
          <div>
            <b>Player impact</b>
            <small>Haaland 2 goals · 4 shots</small>
          </div>
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
  return (
    <div className="recap-grid">
      <Panel className="score-card">
        <p className="eyebrow">FULL TIME · 90:00</p>
        <h2>
          MANCHESTER CITY <b>2 — 0</b> LIVERPOOL
        </h2>
        <div className="recap-hero">
          <strong>
            FULL
            <br />
            TIME
          </strong>
          <span>
            MORE THAN A SCORE.
            <br />
            IT&apos;S THE WHOLE STORY.
          </span>
        </div>
      </Panel>
      <Panel title="KEY MOMENTS">
        <div className="timeline">
          {events
            .filter((e) => e.type === "Goal" || e.type === "Shot")
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
        </div>
      </Panel>
      <Panel title="STANDOUT PLAYER" className="standout">
        <div className="player-number">09</div>
        <div>
          <h2>ERLING HAALAND</h2>
          <p className="lime big-number">9.2</p>
          <small>MATCH RATING</small>
        </div>
      </Panel>
      <Panel title="FINAL THOUGHTS">
        <p className="body-copy">
          City&apos;s high press and quick transitions made the difference. Haaland&apos;s clinical
          finishing and De Bruyne&apos;s creativity proved decisive.
        </p>
      </Panel>
    </div>
  );
}
function StackScene() {
  const tech = [
    "GitHub",
    "GitHub Copilot",
    "Microsoft Foundry",
    "Azure AI Translator",
    "Azure SQL Database",
    "Azure Static Web Apps",
    "Microsoft Fabric",
    "Azure for Students",
  ];
  return (
    <div className="stack-grid">
      <Panel title="PLANNED DATA FLOW" className="pipeline">
        <div className="pipeline-line">
          {[
            "Synthetic Event Generator",
            "Event Processing",
            "Tactical Rules",
            "Grounded Narrative",
            "Overlay / Recap",
          ].map((step, i) => (
            <div key={step}>
              <span>0{i + 1}</span>
              <b>{step}</b>
              {i < 4 && <ChevronRight />}
            </div>
          ))}
        </div>
        <p className="system-note">FRONTEND DEMO · NO SERVICES CONNECTED</p>
      </Panel>
      <Panel title="TECHNOLOGY CARDS" className="tech-cards">
        {tech.map((item) => (
          <div className="tech-tile" key={item}>
            <span className="tech-icon">✦</span>
            <div>
              <b>{item}</b>
              <small>
                {item.includes("Azure") || item.includes("Fabric")
                  ? "PLANNED INTEGRATION"
                  : "FRONTEND DEMO"}
              </small>
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
  const filtered = events.filter((event) => filter === "All" || event.type === filter);
  return (
    <div className="explorer-grid">
      <Panel title="EVENT FILTERS" className="filter-panel">
        <select value={filter} onChange={(e) => setFilter(e.target.value as EventType | "All")}>
          <option>All</option>
          {["Goal", "Shot", "Pass", "Tackle", "Recovery", "Pressure", "Corner"].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <p className="pixel">{filtered.length} EVENTS INDEXED</p>
        <MiniPitch selected={selectedEvent.minute} />
      </Panel>
      <Panel title="EVENT LOG · SELECT ROW TO REPLAY" className="table-panel">
        <div className="event-table" role="region" aria-label="Synthetic event log" tabIndex={0}>
          <table>
            <caption className="sr-only">Synthetic match event log</caption>
            <thead>
              <tr>
                <th>TIME</th>
                <th>TYPE</th>
                <th>PLAYER</th>
                <th>DETAIL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  className={selectedEvent.id === event.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedEvent(event);
                    setClock(event.minute);
                  }}
                >
                  <td>{event.minute}&apos;</td>
                  <td>{event.type}</td>
                  <td>{event.player}</td>
                  <td>{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <pre className="json-view">{JSON.stringify(selectedEvent, null, 2)}</pre>
      </Panel>
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
  const [focus, setFocus] = useState("Match story");
  return (
    <div className="preferences-grid">
      <Panel title="YOUR SETTINGS" className="preference-panel">
        <label>
          LANGUAGE
          <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
            <option>English</option>
            <option>Hindi</option>
            <option>Tamil</option>
          </select>
        </label>
        <label>
          FAVOURITE CLUB
          <select value={club} onChange={(e) => setClub(e.target.value)}>
            <option>Manchester City</option>
            <option>Liverpool</option>
          </select>
        </label>
        <label>
          FOCUS MODE
          <select value={focus} onChange={(e) => setFocus(e.target.value)}>
            <option>Match story</option>
            <option>Favourite player</option>
            <option>Attacking play</option>
            <option>Tactical insights</option>
          </select>
        </label>
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
              JSON.stringify({ language, club, focus, mode }),
            )
          }
        >
          SAVE PREFERENCES
        </button>
      </Panel>
      <Panel title="YOUR EXPERIENCE" className="experience">
        <div className="experience-mark">{club === "Manchester City" ? "MCI" : "LIV"}</div>
        <p className="eyebrow">
          {language} · {mode.toUpperCase()} MODE
        </p>
        <h2>{club} through your lens.</h2>
        <p className="body-copy">
          Prioritising {focus.toLowerCase()} and the moments that matter most to you.
        </p>
        <span className="tag">#9 HAALAND · PRIORITY PLAYER</span>
      </Panel>
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
  return (
    <div className="recap-studio-grid">
      <Panel title="OUTPUT STYLE" className="mode-panel">
        {["Short fan recap", "Analyst brief", "Broadcast script"].map((item) => (
          <button
            className={`mode-button ${style === item ? "selected" : ""}`}
            key={item}
            onClick={() => setStyle(item)}
          >
            <BookOpen />
            {item}
          </button>
        ))}
      </Panel>
      <Panel title="STORY PREVIEW" className="story-preview">
        <p className="eyebrow">PITCHPULSE · FULL-TIME STORY</p>
        <h2>City&apos;s press writes the headline.</h2>
        <p className="body-copy">
          Manchester City secured a 2–0 victory over Liverpool in a dominant display. Two Haaland
          finishes, backed by high recoveries and quick transitions, defined the match.
        </p>
        <div className="story-sections">
          <span>01 · MATCH OVERVIEW</span>
          <span>02 · DEFINING MOMENTS</span>
          <span>03 · TACTICAL EXPLANATION</span>
          <span>04 · PERSONALISED TAKEAWAY</span>
        </div>
        <div className="button-row">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(buildRecapJson());
              notify("RECAP COPIED TO CLIPBOARD");
            }}
          >
            COPY RECAP
          </button>
          <button onClick={() => download("pitchpulse-recap.json", buildRecapJson())}>
            <Download /> EXPORT PACKAGE
          </button>
        </div>
      </Panel>
    </div>
  );
}
