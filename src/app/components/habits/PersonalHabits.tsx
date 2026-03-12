import { useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Trash2, Trophy, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { PersonalHabit } from "./types";
import { calculateStreak, getRecentDays, toDateKey } from "./utils";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { CalendarModal } from "./CalendarModal";
import { IconPicker, IconBadge } from "./IconPicker";

export function PersonalHabits() {
  const [habits, setHabits] = useUniStorage<PersonalHabit[]>("habits", []);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("activity");
  const [newHabitCategory, setNewHabitCategory] = useState<"build" | "break">("build");
  const [showAddForm, setShowAddForm] = useState(false);
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: PersonalHabit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completedDates: [],
      color: colors[habits.length % colors.length],
      description: newHabitDescription.trim(),
      iconId: newHabitIcon,
      category: newHabitCategory,
    };

    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setNewHabitDescription("");
    setNewHabitIcon("activity");
    setNewHabitCategory("build");
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
      }),
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const recentDays = getRecentDays();

  // Analyze break habit progress with intelligent logic
  const analyzeBreakHabitProgress = (habit: PersonalHabit) => {
    if (habit.category !== "break") return null;
    
    const streak = calculateStreak(habit.completedDates);
    const last7Days = recentDays.slice(-7).map(d => toDateKey(d));
    const trackedIn7Days = last7Days.filter(d => habit.completedDates.includes(d)).length;
    
    // Calculate maximum streak ever achieved
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...habit.completedDates].sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const currDate = new Date(sortedDates[i]);
      const nextDate = i + 1 < sortedDates.length ? new Date(sortedDates[i + 1]) : null;
      const dayDiff = nextDate ? (nextDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24) : 1;
      
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
      
      if (dayDiff > 1) currentStreak = 0;
    }
    
    // Logical assessment:
    // - If student has achieved 3+ days before, they've proven capability (don't flag for one slip)
    // - If they haven't reached 3 days AND less than 3 days tracked in last 7, flag as struggling
    // - If habit just created (< 2 tracked), don't flag yet
    const isStruggling = maxStreak < 3 && trackedIn7Days < 3 && habit.completedDates.length >= 2;
    
    return {
      streak,
      maxStreak,
      trackedIn7Days,
      isStruggling
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Personal Habits</h3>
          <p className="text-muted-foreground text-sm">Track goals that are only visible to you</p>
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
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Add context or notes about this habit"
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
                className="min-h-16"
              />
            </div>
            <div className="space-y-2">
              <Label>Choose Icon</Label>
              <IconPicker selectedIconId={newHabitIcon} onSelect={setNewHabitIcon} />
            </div>
            <div className="space-y-2">
              <Label>Habit Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={newHabitCategory === "build" ? "default" : "outline"}
                  className="flex items-center gap-1.5"
                  onClick={() => setNewHabitCategory("build")}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Build</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={newHabitCategory === "break" ? "default" : "outline"}
                  className="flex items-center gap-1.5"
                  onClick={() => setNewHabitCategory("break")}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Break</span>
                </Button>
              </div>
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
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No habits yet. Start one to build your streak!
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconBadge iconId={habit.iconId} size="md" color={habit.color} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                        {habit.category && (
                          <Badge
                            className={`text-[10px] h-5 ${
                              habit.category === "build"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                          >
                            {habit.category === "build" ? (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Build
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Break
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>
                          {calculateStreak(habit.completedDates)} day{" "}
                          {habit.category === "break" ? "free" : "streak"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHabit(habit.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <HeatmapCalendar
                  completedDates={habit.completedDates}
                  color={habit.color}
                />
                <Button
                  onClick={() => setOpenCalendarId(habit.id)}
                  className="w-full"
                  variant="secondary"
                >
                  <Calendar className="h-4 w-4 mr-2" /> Mark Progress
                </Button>
                <CalendarModal
                  open={openCalendarId === habit.id}
                  onOpenChange={(open) => setOpenCalendarId(open ? habit.id : null)}
                  completedDates={habit.completedDates}
                  onDateClick={(dateStr) => toggleHabitDate(habit.id, dateStr)}
                  habitName={habit.name}
                  color={habit.color}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
