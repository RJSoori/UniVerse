import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CheckCircle2, Circle, Plus, Trash2, Trophy } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // Format: YYYY-MM-DD
  color: string;
}

export function HabitTracker() {
  const [habits, setHabits] = useUniStorage<Habit[]>("habits", []);
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      completedDates: [],
      color: colors[habits.length % colors.length],
    };

    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setShowAddForm(false);
  };

  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits(
        habits.map((habit) => {
          if (habit.id === habitId) {
            const isDone = habit.completedDates.includes(dateStr);
            return {
              ...habit,
              completedDates: isDone
                  ? habit.completedDates.filter((d) => d !== dateStr)
                  : [...habit.completedDates, dateStr],
            };
          }
          return habit;
        })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const getRecentDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i !== 0) {
        // If it's not today and the habit wasn't completed, the streak breaks.
        break;
      }
    }
    return streak;
  };

  const recentDays = getRecentDays();

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
            <p className="text-muted-foreground text-sm">Build consistency in your daily routine</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> New Habit
          </Button>
        </div>

        {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Habit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Habit Name</Label>
                  <Input
                      placeholder="e.g., Morning Gym, LeetCode, Drink Water"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addHabit} className="flex-1">Start Tracking</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {habits.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No habits yet. Start one to build your streak!</CardContent></Card>
          ) : (
              habits.map((habit) => (
                  <Card key={habit.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                            <CardTitle className="text-lg">{habit.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>{calculateStreak(habit)} day streak</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteHabit(habit.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {recentDays.map((date, idx) => {
                          const dateStr = date.toISOString().split("T")[0];
                          const isDone = habit.completedDates.includes(dateStr);
                          const isToday = idx === 6;

                          return (
                              <button
                                  key={idx}
                                  onClick={() => toggleHabitDate(habit.id, dateStr)}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
                                      isDone ? "bg-primary/5 border-primary" : "hover:bg-accent"
                                  } ${isToday ? "ring-1 ring-primary/30" : ""}`}
                              >
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                                <span className="text-sm font-medium">{date.getDate()}</span>
                                {isDone ? (
                                    <CheckCircle2 className="h-5 w-5" style={{ color: habit.color }} />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                              </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}