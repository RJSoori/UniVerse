import { apiFetch, parseApiError } from "./client";
import type { PersonalHabit, HabitGroup } from "../../features/habits/types";

/**
 * Gets all personal habits for a student from the database.
 */
export async function fetchPersonalHabits(studentId: number): Promise<PersonalHabit[]> {
  const response = await apiFetch(`/api/students/${studentId}/habits`);

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to fetch personal habits: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? convertFromDatabaseHabit(data) : [];
}

/**
 * Creates a new personal habit and saves it to the database.
 */
export async function createPersonalHabit(
  studentId: number,
  habit: Omit<PersonalHabit, "id">
): Promise<PersonalHabit> {
  const dbHabit = convertToDatabaseHabit(habit);

  const response = await apiFetch(`/api/students/${studentId}/habits`, {
    method: "POST",
    body: JSON.stringify(dbHabit),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to create personal habit: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabaseHabit([data])[0];
}

/**
 * Updates an existing personal habit in the database.
 */
export async function updatePersonalHabit(
  studentId: number,
  habit: PersonalHabit
): Promise<PersonalHabit> {
  const dbHabit = convertToDatabaseHabit(habit);

  const response = await apiFetch(`/api/students/${studentId}/habits/${habit.id}`, {
    method: "PUT",
    body: JSON.stringify(dbHabit),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to update personal habit: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabaseHabit([data])[0];
}

/**
 * Deletes a personal habit from the database.
 */
export async function deletePersonalHabit(
  studentId: number,
  habitId: string
): Promise<void> {
  const response = await apiFetch(`/api/students/${studentId}/habits/${habitId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to delete personal habit: ${error}`);
  }
}

/**
 * Gets all group habits for a student from the database.
 */
export async function fetchGroupHabits(studentId: number): Promise<HabitGroup[]> {
  const response = await apiFetch(`/api/students/${studentId}/group-habits`);

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to fetch group habits: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? convertFromDatabaseGroup(data) : [];
}

/**
 * Creates a new group habit and saves it to the database.
 */
export async function createGroupHabit(
  studentId: number,
  group: Omit<HabitGroup, "id">
): Promise<HabitGroup> {
  const dbGroup = convertToDatabaseGroup(group);

  const response = await apiFetch(`/api/students/${studentId}/group-habits`, {
    method: "POST",
    body: JSON.stringify(dbGroup),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to create group habit: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabaseGroup([data])[0];
}

/**
 * Updates an existing group habit in the database.
 */
export async function updateGroupHabit(
  studentId: number,
  group: HabitGroup
): Promise<HabitGroup> {
  const dbGroup = convertToDatabaseGroup(group);

  const response = await apiFetch(`/api/students/${studentId}/group-habits/${group.id}`, {
    method: "PUT",
    body: JSON.stringify(dbGroup),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to update group habit: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabaseGroup([data])[0];
}

/**
 * Deletes a group habit from the database.
 */
export async function deleteGroupHabit(
  studentId: number,
  groupId: string
): Promise<void> {
  const response = await apiFetch(`/api/students/${studentId}/group-habits/${groupId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to delete group habit: ${error}`);
  }
}

/**
 * Joins a group using an invite code.
 * Adds the student to the group's member list.
 */
export async function joinGroupHabit(
  studentId: number,
  code: string
): Promise<HabitGroup> {
  const response = await apiFetch(`/api/students/${studentId}/group-habits/join?code=${code}`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to join group habit: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabaseGroup([data])[0];
}

/**
 * Converts frontend PersonalHabit to database format.
 */
function convertToDatabaseHabit(habit: Partial<PersonalHabit>): Record<string, any> {
  return {
    ...(habit.id && { id: habit.id }),
    name: habit.name || "",
    description: habit.description || "",
    color: habit.color || "#3b82f6",
    iconId: habit.iconId || "activity",
    category: habit.category || "build",
    focusArea: habit.focusArea || "wellbeing",
    completedDates: habit.completedDates || [],
  };
}

/**
 * Converts database habit format to frontend PersonalHabit.
 */
function convertFromDatabaseHabit(dbHabits: any[]): PersonalHabit[] {
  return dbHabits.map((habit) => ({
    id: habit.id?.toString() || "",
    name: habit.name || "",
    completedDates: habit.completedDates || [],
    color: habit.color || "#3b82f6",
    createdAt: habit.createdAt || undefined,
    iconId: habit.iconId || "activity",
    description: habit.description || "",
    category: (habit.category as "build" | "break") || "build",
    focusArea: habit.focusArea || "wellbeing",
  }));
}

/**
 * Emails a group-habit invite to the given address. The invite message (group name, habit
 * name, sender's name, invite link/code) is generated server-side — this only sends the
 * recipient's email address.
 */
export async function sendGroupHabitInvite(
  studentId: number,
  groupId: string,
  email: string
): Promise<void> {
  const response = await apiFetch(`/api/students/${studentId}/group-habits/${groupId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to send invite: ${error}`);
  }
}

/**
 * Converts frontend HabitGroup to database format.
 */
function convertToDatabaseGroup(group: Partial<HabitGroup>): Record<string, any> {
  return {
    ...(group.id && { id: group.id }),
    name: group.name || "",
    habitName: group.habitName || "",
    description: group.description || "",
    code: group.code || "",
    inviteLink: group.inviteLink || "",
    iconId: group.iconId || "activity",
    // Only meaningful when the owner is leaving and hands off to a remaining member — the
    // backend only honors this from the current owner, and only when they've removed
    // themselves from `members` below.
    ownerId: group.ownerId || "",
    members: group.members || [],
    completedDates: group.completedDates || [],
    memberProgress: group.memberProgress || {},
  };
}

/**
 * Converts database group format to frontend HabitGroup.
 */
function convertFromDatabaseGroup(dbGroups: any[]): HabitGroup[] {
  return dbGroups.map((group) => ({
    id: group.id?.toString() || "",
    name: group.name || "",
    habitName: group.habitName || "",
    description: group.description || "",
    code: group.code || "",
    inviteLink: group.inviteLink || "",
    // Normalize numeric owner/member IDs to strings to avoid strict-equality
    // mismatches in the UI (backend may send numbers or strings depending
    // on serialization). This prevents joined groups from disappearing.
    ownerId: group.ownerId != null ? String(group.ownerId) : "",
    createdAt: group.createdAt || new Date().toISOString(),
    members: (group.members || []).map((m: any) => ({
      id: m?.id != null ? String(m.id) : "",
      name: m?.name || "",
      role: (m.role as "owner" | "member") || "member",
      joinedAt: m.joinedAt || new Date().toISOString(),
    })),
    iconId: group.iconId || "activity",
    completedDates: group.completedDates || [],
    memberProgress: group.memberProgress || {},
  }));
}
