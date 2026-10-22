import type { TodoItem } from "../api/todosApi";

const priorityRank: Record<TodoItem["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortTodos(todos: TodoItem[]): TodoItem[] {
  return todos
    .map((todo, index) => ({ todo, index }))
    .sort((a, b) => {
      const priorityDifference = priorityRank[a.todo.priority] - priorityRank[b.todo.priority];
      if (priorityDifference !== 0) return priorityDifference;

      if (!a.todo.dueDate && !b.todo.dueDate) return a.index - b.index;
      if (!a.todo.dueDate) return 1;
      if (!b.todo.dueDate) return -1;

      const dueDateDifference = a.todo.dueDate.localeCompare(b.todo.dueDate);
      return dueDateDifference !== 0 ? dueDateDifference : a.index - b.index;
    })
    .map(({ todo }) => todo);
}