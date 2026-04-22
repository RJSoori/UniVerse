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

export function buildInviteEmail(link: string, code: string, groupName: string, habitName: string) {
  const subject = `Join my habit group: ${groupName}`;
  const body = `You are invited to join the group \"${groupName}\" for the habit \"${habitName}\".\n\nInvite link: ${link}\nInvite code: ${code}\n\nOpen UniVerse and enter the code to join.`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
