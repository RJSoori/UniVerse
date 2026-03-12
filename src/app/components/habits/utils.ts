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
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i += 1) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = toDateKey(checkDate);

    if (completedDates.includes(dateKey)) {
      streak += 1;
    } else if (i !== 0) {
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
