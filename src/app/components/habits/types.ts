export interface PersonalHabit {
  id: string;
  name: string;
  completedDates: string[]; // Format: YYYY-MM-DD
  color: string;
  iconId?: string;
  description?: string;
  category?: "build" | "break";
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
}

export interface GroupHabitProgress {
  groupId: string;
  completedDates: string[]; // Format: YYYY-MM-DD
  memberProgress?: Record<string, string[]>;
}
