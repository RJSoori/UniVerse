import { describe, expect, it } from "vitest";
import type { TodoItem } from "../api/todosApi";
import { sortTodos } from "./todoSorting";

const todo = (id: string, priority: TodoItem["priority"], dueDate = ""): TodoItem => ({
  id,
  title: id,
  description: "",
  dueDate,
  dueTime: "",
  reservedMinutes: "",
  priority,
  completed: false,
  reminderEnabled: true,
});

describe("sortTodos", () => {
  it("orders high, medium, and low priorities, then due dates", () => {
    const result = sortTodos([
      todo("low-late", "low", "2026-08-21"),
      todo("medium-late", "medium", "2026-08-23"),
      todo("high-late", "high", "2026-08-23"),
      todo("high-soon", "high", "2026-08-21"),
      todo("medium-soon", "medium", "2026-08-21"),
    ]);

    expect(result.map((item) => item.id)).toEqual([
      "high-soon",
      "high-late",
      "medium-soon",
      "medium-late",
      "low-late",
    ]);
  });

  it("places undated tasks after dated tasks within the same priority", () => {
    const result = sortTodos([
      todo("undated", "high"),
      todo("dated", "high", "2026-08-21"),
    ]);

    expect(result.map((item) => item.id)).toEqual(["dated", "undated"]);
  });
});