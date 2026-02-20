import { useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, Trophy, Calendar } from "lucide-react";
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
    };

    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setNewHabitDescription("");
    setNewHabitIcon("activity");
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
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{calculateStreak(habit.completedDates)} day streak</span>
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
