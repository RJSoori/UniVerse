import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateTodo } from "./todosApi";

/**
 * updateTodo sends genuinely partial updates (e.g. just { completed: true } from a checkbox
 * toggle). The database conversion must only include fields the caller actually supplied —
 * defaulting the rest would hand the backend blank/default values for untouched fields, which
 * it then saves over the real ones (see useTodos.ts's toggleCompletion/toggleReminder, which
 * were hit by exactly this before being fixed to send the full merged object).
 */
describe("updateTodo", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, title: "Existing", priority: "high", completed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends only the fields actually provided, not defaults for the rest", async () => {
    await updateTodo("1", { completed: true });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(init!.body as string);

    expect(body).toEqual({ completed: true });
    expect(body).not.toHaveProperty("priority");
    expect(body).not.toHaveProperty("description");
    expect(body).not.toHaveProperty("reminderEnabled");
  });

  it("still sends every field when the caller supplies a full object", async () => {
    await updateTodo("1", {
      title: "Full update",
      description: "desc",
      dueDate: "2026-08-25",
      dueTime: "09:00",
      reservedMinutes: "30",
      priority: "high",
      completed: false,
      reminderEnabled: false,
    });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(init!.body as string);

    expect(body).toEqual({
      title: "Full update",
      description: "desc",
      dueDate: "2026-08-25",
      dueTime: "09:00",
      durationMinutes: "30",
      priority: "high",
      completed: false,
      reminderEnabled: false,
    });
  });
});
