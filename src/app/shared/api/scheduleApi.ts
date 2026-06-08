import { apiFetch, parseApiError } from "./client";

export interface ScheduleEventDto {
  id: number;
  studentId: number;
  title: string;
  date: string; // yyyy-mm-dd
  startTime?: string;
  endTime?: string;
  description?: string;
}

/**
 * Gets all events for a student from the database.
 * Returns a list of events sorted by date.
 */
export async function fetchScheduleEvents(studentId: string): Promise<ScheduleEventDto[]> {
  console.log(`[scheduleApi] fetchScheduleEvents for studentId=${studentId}`);
  const response = await apiFetch(`/api/students/${studentId}/schedule`);
  console.log(`[scheduleApi] fetchScheduleEvents response status: ${response.status}`);
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  console.log(`[scheduleApi] fetchScheduleEvents returned ${data.length} events`);
  return data;
}

/**
 * Creates a new event for a student.
 * Returns the event with its assigned ID from the database.
 */
export async function createScheduleEvent(studentId: string, event: Partial<ScheduleEventDto>) {
  console.log(`[scheduleApi] createScheduleEvent for studentId=${studentId}`, event);
  const response = await apiFetch(`/api/students/${studentId}/schedule`, {
    method: "POST",
    body: JSON.stringify(event),
  });
  console.log(`[scheduleApi] createScheduleEvent response status: ${response.status}`);
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  console.log(`[scheduleApi] createScheduleEvent returned event with id=${data.id}`);
  return data;
}

/**
 * Updates an existing event for a student.
 * Only updates fields that are provided in the event parameter.
 */
export async function updateScheduleEvent(studentId: string, id: string, event: Partial<ScheduleEventDto>) {
  const response = await apiFetch(`/api/students/${studentId}/schedule/${id}`, {
    method: "PUT",
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

/**
 * Deletes an event from a student's calendar.
 * The event is removed from the database.
 */
export async function deleteScheduleEvent(studentId: string, id: string) {
  console.log(`[scheduleApi] deleteScheduleEvent studentId=${studentId}, id=${id}`);
  const response = await apiFetch(`/api/students/${studentId}/schedule/${id}`, {
    method: "DELETE",
  });
  console.log(`[scheduleApi] deleteScheduleEvent response status: ${response.status}`);
  if (!response.ok) throw new Error(await parseApiError(response));
}
