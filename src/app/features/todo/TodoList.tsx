import { useState } from "react";
import { useUniStorage } from "../../shared/hooks/useUniStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Checkbox } from "../../shared/ui/checkbox";
import { Badge } from "../../shared/ui/badge";
import { Bell, Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Label } from "../../shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";

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

interface TodoListProps {
  compact?: boolean;
  maxItems?: number;
}

export function TodoList({ compact = false, maxItems }: TodoListProps) {
  // Persistence hook for syncing with the Dashboard
  const [todos, setTodos] = useUniStorage<TodoItem[]>("todos", []);

  const [newTodo, setNewTodo] = useState<Omit<TodoItem, "id" | "completed">>({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    reservedMinutes: "",
    priority: "medium",
    reminderEnabled: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);

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
      reservedMinutes: "",
      priority: "medium",
      reminderEnabled: true,
    });
    setShowAddForm(false);

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") console.log("Notifications enabled");
          })
          .catch((err) => console.error("Permission request failed", err));
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
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  if (compact) {
    return (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Badge variant="secondary">{todos.filter((t) => !t.completed).length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayedTodos.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
              ) : (
                  displayedTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-2">
                        <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(todo.id)}
                        />
                        <span className={`text-xs flex-1 truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                    {todo.title}
                  </span>
                      </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <div className="app-page">
        <Card className="app-surface">
          <CardHeader>
            <div className="app-page-header">
              <div className="space-y-1">
                <h2 className="app-page-title">Todo List</h2>
                <CardDescription className="app-page-subtitle">{todos.filter((t) => !t.completed).length} pending tasks</CardDescription>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 size-4" /> Add Task
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  placeholder="Enter task..."
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={newTodo.dueDate} onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Due Time</Label>
                  <Input type="time" value={newTodo.dueTime} onChange={(e) => setNewTodo({ ...newTodo, dueTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="e.g. 30"
                    value={newTodo.reservedMinutes}
                    onChange={(e) => setNewTodo({ ...newTodo, reservedMinutes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value as "low" | "medium" | "high" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addTodo} className="flex-1">Add Task</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-2">
          {todos.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No tasks yet</CardContent></Card>
          ) : (
              todos.map((todo) => (
                  <Card key={todo.id} className="hover:bg-accent/5 transition-colors">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>{todo.title}</h4>
                          <Badge variant={getPriorityColor(todo.priority)} className="text-[10px] h-4 uppercase">{todo.priority}</Badge>
                        </div>
                        {(todo.dueDate || todo.dueTime || todo.reservedMinutes) && (
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                              {todo.reservedMinutes && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {todo.reservedMinutes} min reserved
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleReminder(todo.id)} className={todo.reminderEnabled ? "text-primary" : "text-muted-foreground"}>
                          <Bell className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)} className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}