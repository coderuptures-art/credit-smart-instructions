import { describe, expect, it } from "vitest";
import { buildOverlayJson, buildRecapJson, eventsUpTo, scoreAt, statsAt } from "@/data/match";

describe("PITCHPULSE synthetic match data", () => {
  it("derives an empty opening state", () => {
    expect(eventsUpTo(0)).toHaveLength(0);
    expect(scoreAt(0)).toEqual([0, 0]);
  });

  it("keeps goals and stats synchronized at the live clock", () => {
    expect(scoreAt(43)).toEqual([2, 0]);
    expect(eventsUpTo(43)).toHaveLength(4);
    expect(statsAt(67.7)).toMatchObject({ possession: 57, shots: 10, passAccuracy: 87 });
  });

  it("produces valid non-empty overlay and recap exports", () => {
    const overlay = JSON.parse(buildOverlayJson());
    const recap = JSON.parse(buildRecapJson());
    expect(overlay.synthetic).toBe(true);
    expect(overlay.type).toBe("PITCHPULSE_OVERLAY");
    expect(recap.type).toBe("PITCHPULSE_RECAP");
    expect(recap.events.length).toBeGreaterThan(0);
  });
});
