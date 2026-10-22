export type HabitFocusArea =
  | "education"
  | "health"
  | "fitness"
  | "career"
  | "finance"
  | "wellbeing"
  | "social";

export interface PersonalHabit {
  id: string;
  name: string;
  completedDates: string[]; // Format: YYYY-MM-DD
  color: string;
  createdAt?: string; // ISO 8601 timestamp
  iconId?: string;
  description?: string;
  category?: "build" | "break";
  focusArea?: HabitFocusArea;
}

export interface HabitGroupMember {
  id: string;
  name: string;
  role: "owner" | "member";
  joinedAt: string; // ISO string
}

export interface HabitGroup {
  id: string;
  name: string;
  habitName: string;
  description: string;
  code: string;
  inviteLink: string;
  ownerId: string;
  createdAt: string; // ISO string
  members: HabitGroupMember[];
  iconId?: string;
  completedDates?: string[];
  memberProgress?: Record<string, string[]>;
}

export interface GroupHabitProgress {
  groupId: string;
  completedDates: string[]; // Format: YYYY-MM-DD
  memberProgress?: Record<string, string[]>;
}
