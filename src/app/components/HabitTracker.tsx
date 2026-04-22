import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Lightbulb, Plus, Target } from "lucide-react";
import { GroupHabits } from "./habits/GroupHabits";
import { PersonalHabits } from "./habits/PersonalHabits";
import { useUniStorage } from "../hooks/useUniStorage";
import { PersonalHabit } from "./habits/types";
import { calculateStreak } from "./habits/utils";

export function HabitTracker() {
  const [habits, setHabits] = useUniStorage<PersonalHabit[]>("habits", []);
  const [addedSuggestion, setAddedSuggestion] = useState(false);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const addSuggestedHabit = () => {
    const newHabit: PersonalHabit = {
      id: Date.now().toString(),
      name: "Early Morning Focus",
      completedDates: [],
      color: colors[habits.length % colors.length],
      description: "Wake up early to prepare for morning lectures",
      iconId: "clock",
      category: "build",
    };

    setHabits([...habits, newHabit]);
    setAddedSuggestion(true);
    setTimeout(() => setAddedSuggestion(false), 2000);
  };

  const analyzeBreakHabitProgress = (habit: PersonalHabit) => {
    if (habit.category !== "break") return null;

    const streak = calculateStreak(habit.completedDates);

    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...habit.completedDates].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      const currDate = new Date(sortedDates[i]);
      const nextDate = i + 1 < sortedDates.length ? new Date(sortedDates[i + 1]) : null;
      const dayDiff = nextDate ? (nextDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24) : 1;

      currentStreak += 1;
      maxStreak = Math.max(maxStreak, currentStreak);

      if (dayDiff > 1) currentStreak = 0;
    }

    let daysSinceLastTrack = Number.POSITIVE_INFINITY;
    if (sortedDates.length > 0) {
      const lastTracked = new Date(sortedDates[sortedDates.length - 1]);
      const today = new Date();
      daysSinceLastTrack = (today.getTime() - lastTracked.getTime()) / (1000 * 60 * 60 * 24);
    }

    const isStruggling = daysSinceLastTrack >= 3 && maxStreak < 3 && habit.completedDates.length >= 2;

    return {
      daysSinceLastTrack: Math.floor(daysSinceLastTrack),
      isStruggling,
    };
  };

  const strugglingBreakHabit = habits.find((h) => analyzeBreakHabitProgress(h)?.isStruggling);
  const suggestedHabitExists = habits.some((h) => h.name === "Early Morning Focus");

  return (
    <div className="app-page">
      <div className="space-y-1">
        <h2 className="app-page-title">Habit Tracker</h2>
        <p className="app-page-subtitle">Build consistency in your daily routine</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {!suggestedHabitExists && (
          <Card className={`border-primary/20 transition-colors ${
            addedSuggestion ? "bg-green-100 border-green-300" : "bg-primary/5"
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-sm font-semibold ${
                addedSuggestion ? "text-green-700" : "text-primary"
              }`}>
                <Lightbulb className="h-4 w-4" />
                {addedSuggestion ? "Habit Added!" : "Lifestyle Insight: Suggested Habits"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Early Morning Focus</p>
                <p className="text-xs text-muted-foreground">
                  Based on your 8:00 AM lectures on Monday/Tuesday
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={addSuggestedHabit} disabled={addedSuggestion}>
                <Plus className="h-4 w-4" /> {addedSuggestion ? "Added" : "Add"}
              </Button>
            </CardContent>
          </Card>
        )}

        {strugglingBreakHabit && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Pattern Alert: Habits to Break
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{strugglingBreakHabit.name}</p>
                <p className="text-xs text-muted-foreground">
                  Haven't continued for {analyzeBreakHabitProgress(strugglingBreakHabit)?.daysSinceLastTrack} days
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:text-amber-700">
                <Target className="h-4 w-4" /> Track Break
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="group">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PersonalHabits />
        </TabsContent>
        <TabsContent value="group">
          <GroupHabits />
        </TabsContent>
      </Tabs>
    </div>
  );
}