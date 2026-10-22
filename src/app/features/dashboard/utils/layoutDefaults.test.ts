import { describe, expect, it } from "vitest";
import {
  buildDefaultLayout,
  buildDefaultLayouts,
  appendWidgetToLayouts,
  removeWidgetFromLayouts,
  GRID_COLS,
} from "./layoutDefaults";
import { DEFAULT_VISIBLE_WIDGET_IDS, WIDGETS } from "../widgetRegistry";

describe("buildDefaultLayout", () => {
  it("places every widget exactly once, each within grid bounds", () => {
    const layout = buildDefaultLayout(DEFAULT_VISIBLE_WIDGET_IDS, GRID_COLS.lg);

    expect(layout.map((item) => item.i).sort()).toEqual(
      [...DEFAULT_VISIBLE_WIDGET_IDS].sort(),
    );
    for (const item of layout) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x + item.w).toBeLessThanOrEqual(GRID_COLS.lg);
      expect(item.w).toBeGreaterThan(0);
      expect(item.h).toBeGreaterThan(0);
    }
  });

  it("wraps to a new row once a row would overflow the column count", () => {
    const layout = buildDefaultLayout(
      ["sleep-suggestion", "productivity-gap", "stat-tasks"],
      12,
    );
    // sleep-suggestion (w6) + productivity-gap (w6) exactly fill 12 cols on row 0
    expect(layout[0]).toMatchObject({ i: "sleep-suggestion", x: 0, y: 0 });
    expect(layout[1]).toMatchObject({ i: "productivity-gap", x: 6, y: 0 });
    // stat-tasks (w3) can't fit in the same row (0 remaining cols) -> wraps
    expect(layout[2]).toMatchObject({ i: "stat-tasks", x: 0 });
    expect(layout[2].y).toBeGreaterThan(0);
  });

  it("clamps widget width/minW to the available column count (single-column breakpoint)", () => {
    const layout = buildDefaultLayout(DEFAULT_VISIBLE_WIDGET_IDS, 1);
    for (const item of layout) {
      expect(item.w).toBe(1);
      expect(item.minW).toBeLessThanOrEqual(1);
      expect(item.x).toBe(0);
    }
    // every widget stacks on its own row
    const ys = layout.map((item) => item.y);
    expect(new Set(ys).size).toBe(layout.length);
  });

  it("skips unknown widget ids instead of throwing", () => {
    const layout = buildDefaultLayout(["not-a-real-widget"], 12);
    expect(layout).toEqual([]);
  });
});

describe("buildDefaultLayouts", () => {
  it("builds a layout for both the lg and sm breakpoints", () => {
    const layouts = buildDefaultLayouts(DEFAULT_VISIBLE_WIDGET_IDS);
    expect(Object.keys(layouts).sort()).toEqual(["lg", "sm"]);
    expect(layouts.lg).toHaveLength(WIDGETS.length);
    expect(layouts.sm).toHaveLength(WIDGETS.length);
  });
});

describe("appendWidgetToLayouts", () => {
  it("adds the widget below existing content on every breakpoint", () => {
    const base = buildDefaultLayouts(["stat-tasks"]);
    const next = appendWidgetToLayouts(base, "stat-events");

    for (const breakpoint of Object.keys(GRID_COLS)) {
      const items = next[breakpoint];
      expect(items.map((i) => i.i)).toContain("stat-events");
      const added = items.find((i) => i.i === "stat-events")!;
      const original = base[breakpoint][0];
      expect(added.y).toBeGreaterThanOrEqual(original.y + original.h);
      expect(added.x).toBe(0);
    }
    // original entries are untouched
    expect(next.lg[0]).toEqual(base.lg[0]);
  });

  it("is a no-op for an unknown widget id", () => {
    const base = buildDefaultLayouts(["stat-tasks"]);
    const next = appendWidgetToLayouts(base, "does-not-exist");
    expect(next).toEqual(base);
  });
});

describe("removeWidgetFromLayouts", () => {
  it("removes the widget from every breakpoint and leaves others intact", () => {
    const base = buildDefaultLayouts(["stat-tasks", "stat-events", "stat-habits"]);
    const next = removeWidgetFromLayouts(base, "stat-events");

    for (const breakpoint of Object.keys(GRID_COLS)) {
      const ids = next[breakpoint].map((i) => i.i);
      expect(ids).not.toContain("stat-events");
      expect(ids).toContain("stat-tasks");
      expect(ids).toContain("stat-habits");
    }
  });
});
