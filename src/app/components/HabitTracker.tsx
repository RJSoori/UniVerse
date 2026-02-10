import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { CheckCircle2, Circle, Plus, Trash2, Users, Trophy } from "lucide-react";
import { Progress } from "./ui/progress";

interface Habit {
  id: string;
  name: string;
  goal: number; // days per week
  completed: string[]; // dates completed
  color: string;
}

interface Friend {
  id: string;
  name: string;
  streak: number;
  habits: number;
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock friends data
  const [friends] = useState<Friend[]>([
    { id: "1", name: "Sarah Chen", streak: 15, habits: 4 },
    { id: "2", name: "Mike Johnson", streak: 23, habits: 3 },
    { id: "3", name: "Emily Davis", streak: 8, habits: 5 },
  ]);

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("habits");
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      goal: 5,
      completed: [],
      color: colors[habits.length % colors.length],
    };

    setHabits([...habits, habit]);
    setNewHabitName("");
    setShowAddForm(false);
  };

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const completed = habit.completed.includes(date)
            ? habit.completed.filter((d) => d !== date)
            : [...habit.completed, date];
          return { ...habit, completed };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (habit.completed.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const getWeekProgress = (habit: Habit) => {
    const last7Days = getLast7Days();
    const completedThisWeek = last7Days.filter((date) => {
      const dateStr = date.toISOString().split("T")[0];
      return habit.completed.includes(dateStr);
    }).length;
    return (completedThisWeek / habit.goal) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Habits</CardTitle>
                  <CardDescription>Track your daily habits</CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="mr-2 size-4" />
                  Add Habit
                </Button>
              </div>
            </CardHeader>

            {showAddForm && (
              <CardContent className="border-t pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Habit Name</Label>
                    <Input
                      placeholder="e.g., Morning Exercise"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addHabit} className="flex-1">
                      Add Habit
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {habits.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No habits yet. Start tracking your progress!
                </p>
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => {
              const last7Days = getLast7Days();
              const streak = getStreak(habit);
              const progress = getWeekProgress(habit);

              return (
                <Card key={habit.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                          <CardTitle className="text-lg">{habit.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Trophy className="size-4 text-orange-500" />
                            <span className="text-muted-foreground">
                              {streak} day{streak !== 1 ? "s" : ""} streak
                            </span>
                          </div>
                          <Badge variant="secondary">
                            Goal: {habit.goal} days/week
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2 mt-2" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {last7Days.map((date, index) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const isCompleted = habit.completed.includes(dateStr);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <button
                            key={index}
                            onClick={() => toggleHabit(habit.id, dateStr)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:scale-105 ${
                              isToday ? "border-primary" : ""
                            } ${isCompleted ? "bg-primary/10" : ""}`}
                          >
                            <span className="text-xs text-muted-foreground">
                              {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                            <span className="text-sm">{date.getDate()}</span>
                            {isCompleted ? (
                              <CheckCircle2
                                className="size-5"
                                style={{ color: habit.color }}
                              />
                            ) : (
                              <Circle className="size-5 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Friends
              </CardTitle>
              <CardDescription>See how your friends are doing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{friend.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{friend.streak} day streak</span>
                        <span>•</span>
                        <span>{friend.habits} habits</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Join habit groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Early Risers</h4>
                  <p className="text-xs text-muted-foreground">24 members</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Fitness Enthusiasts</h4>
                  <p className="text-xs text-muted-foreground">156 members</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Study Buddies</h4>
                  <p className="text-xs text-muted-foreground">89 members</p>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  <Plus className="mr-2 size-4" />
                  Join Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
