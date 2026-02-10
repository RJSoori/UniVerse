import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Bell, Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Label } from "./ui/label";

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  reminderEnabled: boolean;
}

interface TodoListProps {
  compact?: boolean;
  maxItems?: number;
}

export function TodoList({ compact = false, maxItems }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium" as const,
    reminderEnabled: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.title) return;

    const todo: TodoItem = {
      id: Date.now().toString(),
      ...newTodo,
      completed: false,
    };

    setTodos([todo, ...todos]);
    setNewTodo({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      priority: "medium",
      reminderEnabled: true,
    });
    setShowAddForm(false);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleReminder = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, reminderEnabled: !todo.reminderEnabled } : todo
      )
    );
  };

  const displayedTodos = maxItems ? todos.slice(0, maxItems) : todos;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Badge variant="secondary">{todos.filter((t) => !t.completed).length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayedTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
            ) : (
              displayedTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <span
                    className={`text-sm flex-1 ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  {todo.reminderEnabled && <Bell className="size-3 text-muted-foreground" />}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todo List</CardTitle>
              <CardDescription>{todos.filter((t) => !t.completed).length} pending tasks</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 size-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        {showAddForm && (
          <CardContent className="border-t pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  placeholder="Enter task..."
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Time</Label>
                  <Input
                    type="time"
                    value={newTodo.dueTime}
                    onChange={(e) => setNewTodo({ ...newTodo, dueTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addTodo} className="flex-1">
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No tasks yet</p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </h4>
                      <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                        {todo.priority}
                      </Badge>
                    </div>
                    {(todo.dueDate || todo.dueTime) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {todo.dueDate && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {todo.dueTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {todo.dueTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReminder(todo.id)}
                    className={todo.reminderEnabled ? "text-primary" : "text-muted-foreground"}
                  >
                    <Bell className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
