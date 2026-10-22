import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchPersonalHabits,
  createPersonalHabit,
  updatePersonalHabit,
  deletePersonalHabit,
} from "../api/habitsApi";
import type { PersonalHabit } from "../../features/habits/types";

/**
 * Manages a student's personal habits.
 * Handles loading habits from the database and syncing changes.
 * Provides functions to create, update, and delete habits.
 */
export function usePersonalHabits() {
  const { user } = useAuth();
  const [habits, setHabitsState] = useState<PersonalHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load habits from backend on mount or when user changes
  useEffect(() => {
    const loadHabits = async () => {
      if (!user?.id) {
        setHabitsState([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchPersonalHabits(user.id);
        setHabitsState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load habits");
        setHabitsState([]);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user?.id]);

  // Update a habit in both state and database
  const updateHabit = useCallback(
    async (habit: PersonalHabit) => {
      if (!user?.id) return;

      const updatedHabits = habits.map((h) => (h.id === habit.id ? habit : h));
      setHabitsState(updatedHabits);

      try {
        setError(null);
        await updatePersonalHabit(user.id, habit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update habit");
        // Revert on error
        await refetch();
      }
    },
    [user?.id, habits]
  );

  // Create a new habit
  const addHabit = useCallback(
    async (newHabit: Omit<PersonalHabit, "id">) => {
      if (!user?.id) return;

      try {
        setError(null);
        const created = await createPersonalHabit(user.id, newHabit);
        setHabitsState((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create habit");
        throw err;
      }
    },
    [user?.id]
  );

  // Delete a habit
  const removeHabit = useCallback(
    async (habitId: string) => {
      if (!user?.id) return;

      const originalHabits = habits;
      setHabitsState((prev) => prev.filter((h) => h.id !== habitId));

      try {
        setError(null);
        await deletePersonalHabit(user.id, habitId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete habit");
        // Revert on error
        setHabitsState(originalHabits);
      }
    },
    [user?.id, habits]
  );

  // Refetch habits from backend
  const refetch = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPersonalHabits(user.id);
      setHabitsState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload habits");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { habits, updateHabit, addHabit, removeHabit, loading, error, refetch };
}
