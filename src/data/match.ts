export type Team = "MCI" | "LIV";
export type EventType = "Goal" | "Shot" | "Pass" | "Tackle" | "Recovery" | "Pressure" | "Corner";

export interface MatchEvent {
  id: string;
  minute: number;
  type: EventType;
  team: Team;
  player: string;
  detail: string;
  x: number;
  y: number;
}

export const match = {
  home: "Manchester City",
  away: "Liverpool",
  shortHome: "MCI",
  shortAway: "LIV",
  score: [2, 0] as const,
  clock: 67.7,
  status: "LIVE · SYNTHETIC DEMO",
};

export const events: MatchEvent[] = [
  {
    id: "EV-001",
    minute: 12,
    type: "Goal",
    team: "MCI",
    player: "Erling Haaland",
    detail: "Finish after a high recovery",
    x: 74,
    y: 39,
  },
  {
    id: "EV-014",
    minute: 29,
    type: "Corner",
    team: "MCI",
    player: "Kevin De Bruyne",
    detail: "Inswinging delivery",
    x: 88,
    y: 12,
  },
  {
    id: "EV-021",
    minute: 32,
    type: "Pressure",
    team: "MCI",
    player: "Phil Foden",
    detail: "Ball recovered in the final third",
    x: 70,
    y: 48,
  },
  {
    id: "EV-028",
    minute: 43,
    type: "Goal",
    team: "MCI",
    player: "Erling Haaland",
    detail: "Clinical strike from a fast transition",
    x: 79,
    y: 58,
  },
  {
    id: "EV-041",
    minute: 51,
    type: "Tackle",
    team: "LIV",
    player: "Virgil van Dijk",
    detail: "Stopped a central progression",
    x: 55,
    y: 47,
  },
  {
    id: "EV-052",
    minute: 58,
    type: "Recovery",
    team: "MCI",
    player: "Rodri",
    detail: "Second-ball recovery",
    x: 49,
    y: 55,
  },
  {
    id: "EV-067",
    minute: 67,
    type: "Shot",
    team: "MCI",
    player: "Julian Alvarez",
    detail: "Saved low at the near post",
    x: 76,
    y: 43,
  },
];

export const STORIES = {
  Fan: {
    English: "Haaland strikes again! City turn pressure into a two-goal lead.",
    Hindi: "हालैंड फिर चमके! सिटी ने दबाव को दो गोल की बढ़त में बदला।",
    Tamil: "ஹாலண்ட் மீண்டும் அசத்தினார்! சிட்டி அழுத்தத்தை இரண்டு கோல் முன்னிலையாக மாற்றியது.",
  },
  Analyst: {
    English: "High recoveries are creating short, high-value possessions in the final third.",
    Hindi: "हाई रिकवरी फाइनल थर्ड में छोटे, प्रभावी पजेशन बना रही हैं।",
    Tamil: "உயர் மீட்புகள் இறுதி மூன்றில் குறுகிய, மதிப்புள்ள உடைமைகளை உருவாக்குகின்றன.",
  },
  Broadcast: {
    English: "CITY DOUBLE THEIR ADVANTAGE — HAALAND WITH THE FINISH.",
    Hindi: "सिटी की बढ़त दोगुनी — हालैंड का शानदार फिनिश।",
    Tamil: "சிட்டியின் முன்னிலை இரட்டிப்பு — ஹாலண்டின் அசத்தல் முடிப்பு.",
  },
} as const;

export function eventsUpTo(clock: number) {
  return events.filter((event) => event.minute <= clock);
}
export function scoreAt(clock: number): [number, number] {
  return [
    events.filter((event) => event.team === "MCI" && event.type === "Goal" && event.minute <= clock)
      .length,
    0,
  ];
}
export function statsAt(clock: number) {
  const visible = eventsUpTo(clock);
  return {
    possession: Math.min(68, 54 + Math.floor(visible.length / 2)),
    shots: 9 + visible.filter((e) => e.type === "Shot").length,
    onTarget: 4,
    passAccuracy: 87,
    recoveries: visible.filter((e) => e.type === "Recovery" || e.type === "Pressure").length,
  };
}
export function buildOverlayJson(
  mode: keyof typeof STORIES = "Broadcast",
  language: keyof (typeof STORIES)["Fan"] = "English",
) {
  return JSON.stringify(
    {
      type: "PITCHPULSE_OVERLAY",
      synthetic: true,
      mode,
      language,
      match,
      headline: STORIES[mode][language],
      timestamp: "43:00",
    },
    null,
    2,
  );
}
export function buildRecapJson() {
  return JSON.stringify(
    { type: "PITCHPULSE_RECAP", synthetic: true, match, events, standout: "Erling Haaland" },
    null,
    2,
  );
}
