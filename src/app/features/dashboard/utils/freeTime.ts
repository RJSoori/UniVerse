export interface BusyBlock {
  start: number; // minutes since midnight
  end: number;
  title: string;
}

export interface FreeGap {
  start: number;
  end: number;
  beforeTitle: string | null;
  afterTitle: string | null;
}

const DEFAULT_TASK_DURATION_MINUTES = 30;

export function timeToMinutes(time?: string | null): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function minutesToClock(mins: number): string {
  let h = Math.floor(mins / 60) % 24;
  const m = ((mins % 60) + 60) % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m < 10 ? "0" + m : m} ${ampm}`;
}

export function formatDuration(mins: number): string {
  const whole = Math.max(0, Math.round(mins));
  const h = Math.floor(whole / 60);
  const m = whole % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "yyyy-mm-dd" for today (offsetDays=0) or a day offset from today, in local time. */
export function getDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA");
}

/** A todo's due time only reserves a slot if it has a usable duration attached. */
export function taskDurationMinutes(reservedMinutes?: string): number {
  const parsed = Number(reservedMinutes);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TASK_DURATION_MINUTES;
}

/**
 * Finds free windows of at least `minGapMinutes` within [windowStart, windowEnd),
 * given a set of busy blocks (which may be unsorted/overlapping).
 */
export function findFreeGaps(
  busyBlocks: BusyBlock[],
  windowStart: number,
  windowEnd: number,
  minGapMinutes: number,
): FreeGap[] {
  const sorted = [...busyBlocks]
    .filter((b) => b.end > windowStart && b.start < windowEnd)
    .sort((a, b) => a.start - b.start);

  const gaps: FreeGap[] = [];
  let cursor = windowStart;
  let afterTitle: string | null = null;

  for (const block of sorted) {
    const start = Math.max(block.start, windowStart);
    if (start - cursor >= minGapMinutes) {
      gaps.push({ start: cursor, end: start, afterTitle, beforeTitle: block.title });
    }
    cursor = Math.max(cursor, Math.min(block.end, windowEnd));
    afterTitle = block.title;
  }

  if (windowEnd - cursor >= minGapMinutes) {
    gaps.push({ start: cursor, end: windowEnd, afterTitle, beforeTitle: null });
  }

  return gaps;
}
