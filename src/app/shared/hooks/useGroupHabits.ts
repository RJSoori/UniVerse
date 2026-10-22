import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchGroupHabits,
  createGroupHabit,
  updateGroupHabit,
  deleteGroupHabit,
  joinGroupHabit,
  sendGroupHabitInvite,
} from "../api/habitsApi";
import type { HabitGroup } from "../../features/habits/types";

/**
 * Custom hook for managing group habits with backend synchronization.
 * Automatically syncs with the database when group habits change.
 */
export function useGroupHabits() {
  const { user } = useAuth();
  const [groups, setGroupsState] = useState<HabitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load group habits from backend on mount or when user changes
  // Load saved group habits when the user changes.
  useEffect(() => {
    const loadGroupHabits = async () => {
      if (!user?.id) {
        setGroupsState([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchGroupHabits(user.id);
        setGroupsState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load group habits");
        setGroupsState([]);
      } finally {
        setLoading(false);
      }
    };

    loadGroupHabits();
  }, [user?.id]);

  // Update a group habit in both state and database
  // Update one group habit in memory and in the backend.
  const updateGroup = useCallback(
    async (group: HabitGroup) => {
      if (!user?.id) return;

      const updatedGroups = groups.map((g) => (g.id === group.id ? group : g));
      setGroupsState(updatedGroups);

      try {
        setError(null);
        await updateGroupHabit(user.id, group);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update group habit");
        // Revert on error
        await refetch();
      }
    },
    [user?.id, groups]
  );

  // Create a new group habit
  // Create a new group habit and store it on the server.
  const addGroup = useCallback(
    async (newGroup: Omit<HabitGroup, "id">) => {
      if (!user?.id) return;

      try {
        setError(null);
        const created = await createGroupHabit(user.id, newGroup);
        setGroupsState((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create group habit");
        throw err;
      }
    },
    [user?.id]
  );

  // Delete a group habit
  // Delete one group habit and refresh the local list.
  const removeGroup = useCallback(
    async (groupId: string) => {
      if (!user?.id) return;

      const originalGroups = groups;
      setGroupsState((prev) => prev.filter((g) => g.id !== groupId));

      try {
        setError(null);
        await deleteGroupHabit(user.id, groupId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete group habit");
        // Revert on error
        setGroupsState(originalGroups);
      }
    },
    [user?.id, groups]
  );

  // Join a group habit using invite code
  // Join a group habit using the invite code.
  const joinGroup = useCallback(
    async (code: string) => {
      if (!user?.id) return;

      try {
        setError(null);
        const joined = await joinGroupHabit(user.id, code);
        setGroupsState((prev) => [joined, ...prev]);
        return joined;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join group habit");
        throw err;
      }
    },
    [user?.id]
  );

  // Email a group invite to someone by address
  // Asks the backend to generate and send the invite email; the caller supplies only the recipient.
  const sendInvite = useCallback(
    async (groupId: string, email: string) => {
      if (!user?.id) return;

      setError(null);
      await sendGroupHabitInvite(user.id, groupId, email);
    },
    [user?.id]
  );

  // Refetch group habits from backend
  // Reload group habits from the backend.
  const refetch = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchGroupHabits(user.id);
      setGroupsState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload group habits");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { groups, updateGroup, addGroup, removeGroup, joinGroup, sendInvite, loading, error, refetch };
}
