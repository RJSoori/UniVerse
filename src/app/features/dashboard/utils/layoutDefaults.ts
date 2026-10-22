import type { Layout } from "react-grid-layout";
import { WIDGETS, WIDGET_MAP, type WidgetDef } from "../widgetRegistry";

/**
 * Simple left-to-right shelf packing: widgets are placed in registry order,
 * wrapping to a new row whenever the current one would overflow `cols`.
 * react-grid-layout's vertical compaction then closes any remaining gaps.
 */
export function buildDefaultLayout(widgetIds: string[], cols: number): Layout[] {
  const byId = new Map(WIDGETS.map((w) => [w.id, w] as [string, WidgetDef]));
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  const layout: Layout[] = [];

  for (const id of widgetIds) {
    const widget = byId.get(id);
    if (!widget) continue;
    const w = Math.min(widget.size.w, cols);
    if (x + w > cols) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    layout.push({
      i: id,
      x,
      y,
      w,
      h: widget.size.h,
      minW: Math.min(widget.size.minW, cols),
      minH: widget.size.minH,
    });
    x += w;
    rowHeight = Math.max(rowHeight, widget.size.h);
  }

  return layout;
}

// Thresholds are checked against the grid's own rendered width (the content
// pane after the sidebar), not the window width — so these are deliberately
// lower than the app's viewport-based Tailwind breakpoints of the same name.
export const GRID_BREAKPOINTS = { lg: 640, sm: 0 } as const;
export const GRID_COLS = { lg: 12, sm: 1 } as const;

export function buildDefaultLayouts(widgetIds: string[]): Record<string, Layout[]> {
  return {
    lg: buildDefaultLayout(widgetIds, GRID_COLS.lg),
    sm: buildDefaultLayout(widgetIds, GRID_COLS.sm),
  };
}

/** Appends a newly-added widget to the bottom of every breakpoint's layout. */
export function appendWidgetToLayouts(
  layouts: Record<string, Layout[]>,
  id: string,
): Record<string, Layout[]> {
  const widget = WIDGET_MAP[id];
  if (!widget) return layouts;

  const next: Record<string, Layout[]> = { ...layouts };
  for (const [breakpoint, cols] of Object.entries(GRID_COLS)) {
    const existing = layouts[breakpoint] ?? [];
    const maxY = existing.reduce((m, item) => Math.max(m, item.y + item.h), 0);
    const w = Math.min(widget.size.w, cols);
    next[breakpoint] = [
      ...existing,
      {
        i: id,
        x: 0,
        y: maxY,
        w,
        h: widget.size.h,
        minW: Math.min(widget.size.minW, cols),
        minH: widget.size.minH,
      },
    ];
  }
  return next;
}

/** Removes a widget's entry from every breakpoint's layout. */
export function removeWidgetFromLayouts(
  layouts: Record<string, Layout[]>,
  id: string,
): Record<string, Layout[]> {
  const next: Record<string, Layout[]> = {};
  for (const [breakpoint, items] of Object.entries(layouts)) {
    next[breakpoint] = items.filter((item) => item.i !== id);
  }
  return next;
}
