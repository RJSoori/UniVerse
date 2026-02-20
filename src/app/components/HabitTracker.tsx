import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CheckCircle2, Circle, Plus, Trash2, Trophy, BrainCircuit, AlertTriangle, ArrowRight } from "lucide-react";

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

  // Mock Insights for Lifestyle Analysis
  const aiRecommendations = [
    {
      id: "rec1",
      type: "positive",
      title: "Early Morning Focus",
      reason: "Based on your 8:00 AM lectures on Monday/Tuesday.",
      habit: "Review Notes at 7 AM"
    },
    {
      id: "rec2",
      type: "negative",
      title: "Late Night Screen Time",
      reason: "Detected high activity after 12:00 AM which impacts recovery.",
      habit: "No Screens After 11 PM"
    }
  ];

  const addHabit = (name?: string) => {
    const habitName = name || newHabitName;
    if (!habitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitName,
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

        {/* --- AI LIFESTYLE ANALYSIS SECTION (NEW) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Lifestyle Insight: Suggested Habits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.filter(r => r.type === "positive").map(rec => (
                  <div key={rec.id} className="text-xs bg-background p-3 rounded-lg border flex flex-col gap-1">
                    <div className="flex justify-between items-center font-bold">
                      <span>{rec.title}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => addHabit(rec.habit)}>Add <ArrowRight className="ml-1 h-2 w-2"/></Button>
                    </div>
                    <p className="text-muted-foreground italic">{rec.reason}</p>
                  </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 shadow-sm">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm font-semibold text-orange-900">Pattern Alert: Habits to Break</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.filter(r => r.type === "negative").map(rec => (
                  <div key={rec.id} className="text-xs bg-background p-3 rounded-lg border flex flex-col gap-1">
                    <div className="flex justify-between items-center font-bold">
                      <span>{rec.title}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-orange-600 hover:text-orange-700" onClick={() => addHabit(rec.habit)}>Track Break <ArrowRight className="ml-1 h-2 w-2"/></Button>
                    </div>
                    <p className="text-muted-foreground italic">{rec.reason}</p>
                  </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
            <Card className="border-primary/20 shadow-md">
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
                  <Button onClick={() => addHabit()} className="flex-1">Start Tracking</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {habits.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">No habits yet. Start one to build your streak!</CardContent></Card>
          ) : (
              habits.map((habit) => (
                  <Card key={habit.id} className="hover:shadow-sm transition-shadow">
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
                                  } ${isToday ? "ring-2 ring-primary/20" : ""}`}
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