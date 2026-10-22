export function getRecentDays() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Furthest number of days in the past a habit day may still be marked. */
export const MAX_EDITABLE_PAST_DAYS = 7;

/**
 * Students can only mark today or a day within the past week (up to
 * MAX_EDITABLE_PAST_DAYS days ago) — no future dates, and nothing older.
 */
export function isDateEditable(date: Date, referenceDate: Date = new Date()): boolean {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target > today) return false;

  const earliestEditableDate = new Date(today);
  earliestEditableDate.setDate(today.getDate() - MAX_EDITABLE_PAST_DAYS);

  return target >= earliestEditableDate;
}
export function calculateStreak(completedDates: string[]) {
  if (!completedDates || completedDates.length === 0) return 0;

  const normalizeDateKey = (value: string): string | null => {
    if (!value) return null;

    // Current format used by app storage.
    const plainDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (plainDatePattern.test(value)) return value;

    // Legacy/ISO values: convert to local-day key to avoid timezone shifts.
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return toDateKey(parsed);
  };

  const normalizedDates = new Set<string>();
  for (const raw of completedDates) {
    const normalized = normalizeDateKey(raw);
    if (normalized) normalizedDates.add(normalized);
  }

  if (normalizedDates.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const hasToday = normalizedDates.has(toDateKey(today));
  const hasYesterday = normalizedDates.has(toDateKey(yesterday));

  // If neither today nor yesterday is completed, streak is broken.
  if (!hasToday && !hasYesterday) return 0;

  const startDate = hasToday ? today : yesterday;
  let streak = 0;

  for (let i = 0; i < 365; i += 1) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() - i);
    const key = toDateKey(checkDate);

    if (normalizedDates.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}
export function generateInviteCode() {
  const raw = Math.random().toString(36).slice(2, 8);
  return raw.toUpperCase();
}
export function buildInviteLink(groupId: string, code: string) {
  const origin = typeof window === "undefined" ? "https://universe.app" : window.location.origin;
  return `${origin}/habits/join?group=${encodeURIComponent(groupId)}&code=${encodeURIComponent(code)}`;
}

/**
 * Detects pattern anomalies in habit completion and returns an alert message.
 * Checks for: recently created habits, broken streaks, and long gaps in completions.
 * @param completedDates Array of completion dates in YYYY-MM-DD format
 * @param createdAt ISO 8601 timestamp when habit was created
 * @returns Alert message string, or null if no pattern detected
 */
export function detectPatternAlert(completedDates: string[], createdAt?: string): string | null {
  // --- STAGE 1: Recently Created Habit ---
  // Show encouraging message for habits created in the last 7 days
  // Purpose: New habits need motivation to stick during the critical first week
  if (createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    // Convert milliseconds to days: 1000ms * 60s * 60m * 24h
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 7) {
      return "🌱 Keep building this habit! Every completion counts.";
    }
  }

  // Exit early if no completions recorded yet
  if (!completedDates || completedDates.length === 0) return null;

  // --- Date Normalization ---
  // Converts various date formats (ISO strings, timestamps) to consistent YYYY-MM-DD format
  // Prevents timezone-related bugs where the same day could be interpreted differently
  const normalizeDateKey = (value: string): string | null => {
    const plainDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (plainDatePattern.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return toDateKey(parsed);
  };

  // Build a Set of normalized dates for O(1) lookup during streak detection
  const normalizedDates = new Set<string>();
  for (const raw of completedDates) {
    const normalized = normalizeDateKey(raw);
    if (normalized) normalizedDates.add(normalized);
  }

  if (normalizedDates.size === 0) return null;

  // Normalize "today" to midnight for consistent date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- STAGE 2: Long Gap Detection ---
  // Alert user if they haven't completed habit in 5+ days
  // Purpose: Catch momentum loss before streak completely resets
  const sortedDates = Array.from(normalizedDates).sort().reverse();
  const lastCompletion = sortedDates[0];
  const lastCompletionDate = new Date(lastCompletion);
  const daysSinceCompletion = (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24);

  // Alert for 5-30 day gaps (beyond 30 days, assume habit is abandoned)
  if (daysSinceCompletion >= 5 && daysSinceCompletion < 30) {
    const days = Math.floor(daysSinceCompletion);
    return `⚠️ No completions in ${days} days. Time to get back on track!`;
  }

  // --- STAGE 3: Broken Streak Detection ---
  // Check if current streak is broken (no completions in recent days)
  // Count backward from today up to 10 days to detect if habit was being done regularly
  let streakLength = 0;
  for (let i = 0; i < Math.min(10, completedDates.length); i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = toDateKey(checkDate);

    if (normalizedDates.has(key)) {
      streakLength++;
    } else if (i > 0) {
      // Stop counting when we hit the first gap (streak is broken)
      break;
    }
  }

  // If no recent streak but habit has 10+ historical completions, user had momentum that broke
  // Alert: "You had momentum! Let's rebuild your streak."
  // This is different from a gap alert - it specifically targets habits that were going well
  if (streakLength === 0 && normalizedDates.size >= 10) {
    return "📉 You had momentum! Let's rebuild your streak.";
  }

  // No pattern issues detected
  return null;
}


