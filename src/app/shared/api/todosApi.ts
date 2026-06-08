import { apiFetch, parseApiError } from "./client";

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  reservedMinutes: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  reminderEnabled: boolean;
}

/**
 * Gets all todos for a student from the database.
 */
export async function fetchTodos(studentId: number): Promise<TodoItem[]> {
  const response = await apiFetch(`/api/todos/student/${studentId}`);

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to fetch todos: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? convertFromDatabase(data) : [];
}

/**
 * Saves all todos for a student to the database.
 * Replaces all existing todos with the new list.
 */
export async function saveTodos(studentId: number, todos: TodoItem[]): Promise<TodoItem[]> {
  const dbTodos = convertToDatabase(todos);
  
  const response = await apiFetch(`/api/todos/student/${studentId}/bulk`, {
    method: "PUT",
    body: JSON.stringify(dbTodos),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to save todos: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? convertFromDatabase(data) : [];
}

/**
 * Creates a new todo item in the database.
 */
export async function createTodo(studentId: number, todo: Omit<TodoItem, "id">): Promise<TodoItem> {
  const dbTodo = convertToDatabase([{ ...todo, id: "" }])[0];
  dbTodo.studentId = studentId;

  const response = await apiFetch(`/api/todos`, {
    method: "POST",
    body: JSON.stringify(dbTodo),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to create todo: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabase([data])[0];
}

/**
 * Updates an existing todo item in the database.
 */
export async function updateTodo(todoId: string, updates: Partial<TodoItem>): Promise<TodoItem> {
  const dbUpdates = convertToDatabase([updates as TodoItem])[0];

  const response = await apiFetch(`/api/todos/${todoId}`, {
    method: "PUT",
    body: JSON.stringify(dbUpdates),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to update todo: ${error}`);
  }

  const data = await response.json();
  return convertFromDatabase([data])[0];
}

/**
 * Deletes a single todo item.
 */
export async function deleteTodo(todoId: string): Promise<void> {
  const response = await apiFetch(`/api/todos/${todoId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(`Failed to delete todo: ${error}`);
  }
}

/**
 * Converts frontend TodoItem format to database format.
 */
function convertToDatabase(todos: Partial<TodoItem>[]): Record<string, any>[] {
  return todos.map((todo) => ({
    ...(todo.id && { id: todo.id }),
    title: todo.title || "",
    description: todo.description || "",
    dueDate: todo.dueDate || null,
    dueTime: todo.dueTime || null,
    durationMinutes: todo.reservedMinutes || null,
    priority: todo.priority || "medium",
    completed: todo.completed ?? false,
    reminderEnabled: todo.reminderEnabled ?? true,
  }));
}

/**
 * Converts database format to frontend TodoItem format.
 */
function convertFromDatabase(dbTodos: any[]): TodoItem[] {
  return dbTodos.map((todo) => ({
    id: todo.id?.toString() || "",
    title: todo.title || "",
    description: todo.description || "",
    dueDate: todo.dueDate || "",
    dueTime: todo.dueTime || "",
    reservedMinutes: todo.durationMinutes?.toString() || "",
    priority: (todo.priority as "low" | "medium" | "high") || "medium",
    completed: todo.completed ?? false,
    reminderEnabled: todo.reminderEnabled ?? true,
  }));
}
