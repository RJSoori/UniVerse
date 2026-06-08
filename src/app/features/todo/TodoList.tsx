import { useState } from "react";
import { useTodos } from "../../shared/hooks/useTodos";
import { type TodoItem } from "../../shared/api/todosApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Checkbox } from "../../shared/ui/checkbox";
import { Badge } from "../../shared/ui/badge";
import { Bell, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
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

interface TodoListProps {
  compact?: boolean;
  maxItems?: number;
}

/** 
 * A component to manage and display a list of tasks.
 * Supports adding, deleting, and tracking task completion.
 */
export function TodoList({ compact = false, maxItems }: TodoListProps) {
  // Syncs the task list with backend database.
  const { todos, addTodo, toggleCompletion, removeTodo, toggleReminder, loading, error } = useTodos();

  const [newTodo, setNewTodo] = useState<Omit<TodoItem, "id" | "completed">>({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    reservedMinutes: "",
    priority: "medium",
    reminderEnabled: true,
  });
  const [dueDateInput, setDueDateInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  /**
   * Converts dd/mm/yyyy into yyyy-mm-dd for backend.
    * Keeps the manual date field compatible with the API's ISO date format.
   */
  const parseDmyToIsoDate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const day = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const year = Number.parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const testDate = new Date(year, month - 1, day);
    const validDate =
      testDate.getFullYear() === year &&
      testDate.getMonth() === month - 1 &&
      testDate.getDate() === day;

    if (!validDate) return null;

    return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  /** 
   * Adds a new task to the list.
   * Also requests browser notification permissions.
   */
  const addTodoItem = async () => {
    const title = newTodo.title.trim();
    if (!title) return;

    const parsedDueDate = parseDmyToIsoDate(dueDateInput);
    if (dueDateInput.trim() && !parsedDueDate) {
      return;
    }

    // Call the hook's addTodo to create in database
    const created = await addTodo({
      title,
      description: newTodo.description,
      dueDate: parsedDueDate ?? "",
      dueTime: newTodo.dueTime,
      reservedMinutes: newTodo.reservedMinutes,
      priority: newTodo.priority,
      reminderEnabled: newTodo.reminderEnabled,
    });

    if (!created) {
      return;
    }

    // Clear form
    setShowAddForm(false);
    setNewTodo({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      reservedMinutes: "",
      priority: "medium",
      reminderEnabled: true,
    });
    setDueDateInput("");

    // Browser notifications 
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") console.log("Notifications enabled");
          })
          .catch((err) => console.error("Permission request failed", err));
    }
  };

  /** 
   * Switches between completed and pending.
   */
  const toggleTodo = async (id: string) => {
    await toggleCompletion(id);
  };

  
  const deleteTodo = async (id: string) => {
    await removeTodo(id);
  };

  /** 
   * Enables or disables alerts for a specific task.
   */
  
  const toggleReminderLocal = async (id: string) => {
    await toggleReminder(id);
  };

  const displayedTodos = maxItems ? todos.slice(0, maxItems) : todos;

  /** 
   * UI variant 
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  /** 
   * Formats date string 
   */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  if (compact) {
    if (loading) {
      return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground text-center py-4">Loading tasks...</p>
            </CardContent>
          </Card>
      );
    }

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
              {error && (
                  <div className="flex items-center gap-2 text-xs text-destructive mb-2">
                    <AlertCircle className="size-3" />
                    {error}
                  </div>
              )}
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
                <CardDescription className="app-page-subtitle">
                  {loading ? "Loading..." : `${todos.filter((t) => !t.completed).length} pending tasks`}
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddForm(true)} disabled={loading}>
                <Plus className="mr-2 size-4" /> Add Task
              </Button>
            </div>
          </CardHeader>
        </Card>

        {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              </CardContent>
            </Card>
        )}

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
                  onKeyDown={(e) => e.key === "Enter" && addTodoItem()}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={dueDateInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDueDateInput(value);
                      const parsed = parseDmyToIsoDate(value);
                      setNewTodo({ ...newTodo, dueDate: parsed ?? "" });
                    }}
                  />
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
                <Button onClick={addTodoItem} className="flex-1">Add Task</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-2">
          {loading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Loading tasks...</CardContent></Card>
          ) : todos.length === 0 ? (
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
                                    {formatDate(todo.dueDate)}
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
                        <Button variant="ghost" size="sm" onClick={() => toggleReminderLocal(todo.id)} className={todo.reminderEnabled ? "text-primary" : "text-muted-foreground"}>
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