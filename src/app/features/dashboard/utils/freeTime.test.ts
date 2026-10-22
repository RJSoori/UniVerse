import { describe, expect, it } from "vitest";
import {
  findFreeGaps,
  formatDuration,
  minutesToClock,
  taskDurationMinutes,
  timeToMinutes,
} from "./freeTime";

describe("timeToMinutes", () => {
  it("parses HH:MM into minutes since midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("returns null for missing or malformed input", () => {
    expect(timeToMinutes(undefined)).toBeNull();
    expect(timeToMinutes("")).toBeNull();
    expect(timeToMinutes("not-a-time")).toBeNull();
  });
});

describe("minutesToClock", () => {
  it("formats minutes as a 12-hour clock string", () => {
    expect(minutesToClock(0)).toBe("12:00 AM");
    expect(minutesToClock(570)).toBe("9:30 AM");
    expect(minutesToClock(12 * 60)).toBe("12:00 PM");
    expect(minutesToClock(23 * 60 + 30)).toBe("11:30 PM");
  });
});

describe("formatDuration", () => {
  it("formats minutes into a human-friendly duration", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30m");
  });
});

describe("taskDurationMinutes", () => {
  it("uses the reserved duration when valid", () => {
    expect(taskDurationMinutes("60")).toBe(60);
  });

  it("falls back to a default for missing/invalid values", () => {
    expect(taskDurationMinutes(undefined)).toBe(30);
    expect(taskDurationMinutes("")).toBe(30);
    expect(taskDurationMinutes("not-a-number")).toBe(30);
    expect(taskDurationMinutes("-10")).toBe(30);
  });
});

describe("findFreeGaps", () => {
  it("finds a single gap that spans the whole window when nothing is busy", () => {
    const gaps = findFreeGaps([], 9 * 60, 17 * 60, 30);
    expect(gaps).toEqual([{ start: 9 * 60, end: 17 * 60, beforeTitle: null, afterTitle: null }]);
  });

  it("finds gaps before, between, and after busy blocks", () => {
    const busy = [
      { start: 10 * 60, end: 11 * 60, title: "Class" },
      { start: 13 * 60, end: 14 * 60, title: "Meeting" },
    ];
    const gaps = findFreeGaps(busy, 9 * 60, 17 * 60, 30);

    expect(gaps).toEqual([
      { start: 9 * 60, end: 10 * 60, beforeTitle: "Class", afterTitle: null },
      { start: 11 * 60, end: 13 * 60, beforeTitle: "Meeting", afterTitle: "Class" },
      { start: 14 * 60, end: 17 * 60, beforeTitle: null, afterTitle: "Meeting" },
    ]);
  });

  it("omits gaps shorter than the minimum", () => {
    const busy = [
      { start: 10 * 60, end: 11 * 60, title: "Class" },
      { start: 11 * 60 + 10, end: 12 * 60, title: "Meeting" }, // only a 10m gap after Class
    ];
    const gaps = findFreeGaps(busy, 10 * 60, 12 * 60, 30);
    expect(gaps).toEqual([]);
  });

  it("returns no gaps when busy blocks fully cover the window", () => {
    const busy = [{ start: 9 * 60, end: 17 * 60, title: "All day" }];
    const gaps = findFreeGaps(busy, 9 * 60, 17 * 60, 30);
    expect(gaps).toEqual([]);
  });

  it("handles overlapping busy blocks without producing a bogus gap", () => {
    const busy = [
      { start: 10 * 60, end: 12 * 60, title: "A" },
      { start: 11 * 60, end: 13 * 60, title: "B" },
    ];
    const gaps = findFreeGaps(busy, 9 * 60, 14 * 60, 30);
    expect(gaps).toEqual([
      { start: 9 * 60, end: 10 * 60, beforeTitle: "A", afterTitle: null },
      { start: 13 * 60, end: 14 * 60, beforeTitle: null, afterTitle: "B" },
    ]);
  });
});
