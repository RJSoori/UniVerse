import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  type ScheduleEventDto,
} from "../api/scheduleApi";

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  startTime: string;
  endTime: string;
  description: string;
  type: "class" | "study" | "meeting" | "other";
};

// Hook to manage schedule events for the authenticated user.
export function useSchedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchScheduleEvents(user.id.toString());
        // The API returns DTOs, so map them into the UI's simplified event shape.
        const mapped = data.map((d) => ({
          id: String(d.id),
          title: d.title,
          date: d.date,
          startTime: d.startTime || "",
          endTime: d.endTime || "",
          description: d.description || "",
          type: "other" as const,
        }));
        setEvents(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load schedule");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const createEvent = useCallback(
    async (payload: Omit<ScheduleEvent, "id">) => {
      if (!user?.id) {
        console.warn('[useSchedule] createEvent: no user.id available');
        return null;
      }
      console.log(`[useSchedule] createEvent: user.id=${user.id}`, payload);
      // Insert optimistically so the calendar responds immediately, then reconcile with the server ID.
      const optimisticId = Date.now().toString();
      const optimistic = { id: optimisticId, ...payload };
      setEvents((e) => [...e, optimistic]);

      try {
        setError(null);
        const saved: ScheduleEventDto = await createScheduleEvent(user.id.toString(), {
          title: payload.title,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          description: payload.description,
        });
        console.log(`[useSchedule] createEvent: saved event with id=${saved.id}`);
        setEvents((prev) => prev.map((ev) => (ev.id === optimisticId ? { ...payload, id: String(saved.id) } : ev)));
        return String(saved.id);
      } catch (err) {
        console.error('[useSchedule] createEvent failed:', err);
        setError(err instanceof Error ? err.message : "Failed to create event");
        // revert optimistic
        setEvents((e) => e.filter((ev) => ev.id !== optimisticId));
        return null;
      }
    },
    [user?.id]
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<ScheduleEvent>) => {
      if (!user?.id) return null;
      // Update optimistically so drag/edit flows feel instant.
      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)));
      try {
        setError(null);
        const saved = await updateScheduleEvent(user.id.toString(), id, updates as any);
        return String(saved.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update event");
        // reload on error
        try {
          const data = await fetchScheduleEvents(user.id.toString());
          setEvents(data.map((d) => ({ id: String(d.id), title: d.title, date: d.date, startTime: d.startTime || "", endTime: d.endTime || "", description: d.description || "", type: "other" as const })));
        } catch {
          // ignore
        }
        return null;
      }
    },
    [user?.id]
  );

  const removeEvent = useCallback(
    async (id: string) => {
      if (!user?.id) return false;
      const prev = events;
      // Remove optimistically and restore the previous list if the API call fails.
      setEvents((e) => e.filter((ev) => ev.id !== id));
      try {
        setError(null);
        await deleteScheduleEvent(user.id.toString(), id);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete event");
        setEvents(prev);
        return false;
      }
    },
    [user?.id, events]
  );

  return { events, loading, error, createEvent, updateEvent, removeEvent };
}
