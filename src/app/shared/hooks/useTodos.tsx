import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchTodos, saveTodos, createTodo, updateTodo, deleteTodo, type TodoItem } from "../api/todosApi";

/**
 * Custom hook for managing todos with backend synchronization.
 * Automatically syncs with the database when todos change.
 */
function useTodosImpl() {
  const { user } = useAuth();
  const [todos, setTodosState] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from backend on mount or when user changes
  // Load the saved todo list when the user changes.
  useEffect(() => {
    const loadTodos = async () => {
      if (!user?.id) {
        setTodosState([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchTodos(user.id);
        setTodosState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load todos");
        setTodosState([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [user?.id]);

  // Sync todos to backend
  // Save the full todo list to the backend.
  const setTodos = useCallback(
    async (newTodos: TodoItem[] | ((prev: TodoItem[]) => TodoItem[])) => {
      if (!user?.id) return;

      const todosToSave = typeof newTodos === "function" ? newTodos(todos) : newTodos;
      setTodosState(todosToSave);

      try {
        setError(null);
        const savedTodos = await saveTodos(user.id, todosToSave);
        setTodosState(savedTodos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save todos");
        // Revert on error
        await refetch();
      }
    },
    [user?.id, todos]
  );

  /**
   * Creates a new todo item and saves it to the database.
   * Returns the created todo with the server-assigned ID.
   */
  const addTodo = useCallback(
    async (newTodo: Omit<TodoItem, "id" | "completed">) => {
      if (!user?.id) {
        setError("You must be signed in to create todos.");
        return null;
      }

      try {
        setError(null);
        const created = await createTodo(user.id, { ...newTodo, completed: false });
        setTodosState(prev => [created, ...prev]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create todo");
        return null;
      }
    },
    [user?.id]
  );

  // Toggle a single todo completion status.
  const toggleCompletion = useCallback(
    async (id: string) => {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updated = { ...todo, completed: !todo.completed };
      setTodosState(todos.map(t => t.id === id ? updated : t));

      try {
        setError(null);
        // Send the full merged todo, not just the changed field — the update payload defaults
        // every omitted field (priority, description, reminderEnabled, ...), so a partial
        // object here would silently reset those fields back to defaults on the server.
        await updateTodo(id, updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
        await refetch();
      }
    },
    [todos]
  );

  // Delete a single todo.
  const removeTodo = useCallback(
    async (id: string) => {
      setTodosState(todos.filter(t => t.id !== id));

      try {
        setError(null);
        await deleteTodo(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete todo");
        await refetch();
      }
    },
    [todos]
  );

  // Toggle reminder for a single todo.
  const toggleReminder = useCallback(
    async (id: string) => {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updated = { ...todo, reminderEnabled: !todo.reminderEnabled };
      setTodosState(todos.map(t => t.id === id ? updated : t));

      try {
        setError(null);
        // Same reasoning as toggleCompletion above: send the full object so unrelated fields
        // (completed, priority, description, ...) don't get reset to their defaults.
        await updateTodo(id, updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
        await refetch();
      }
    },
    [todos]
  );

  // Refetch todos from backend
  // Reload todos from the backend after an error or refresh.
  const refetch = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos(user.id);
      setTodosState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload todos");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { todos, setTodos, addTodo, toggleCompletion, removeTodo, toggleReminder, loading, error, refetch };
}

type TodosApi = ReturnType<typeof useTodosImpl>;

const TodosContext = createContext<TodosApi | null>(null);

/**
 * Provider that holds a single shared instance of the todos hook.
 *
 * Wrap any subtree that contains multiple todo-aware components (e.g. the
 * authenticated app layout). Without this, every component that calls
 * `useTodos()` would get its own independent `useState`, so a mutation in
 * one component (like ticking a todo done in the To-Do List widget) would
 * not be visible to siblings (like the Productivity Gap card).
 */
export function TodosProvider({ children }: { children: ReactNode }) {
  const value = useTodosImpl();
  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

export function useTodos(): TodosApi {
  const ctx = useContext(TodosContext);
  if (!ctx) {
    throw new Error("useTodos must be used within a <TodosProvider>");
  }
  return ctx;
}
