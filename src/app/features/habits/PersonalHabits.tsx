import { useEffect, useRef, useState } from "react";
import { usePersonalHabits } from "../../shared/hooks/usePersonalHabits";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Badge } from "../../shared/ui/badge";
import {
  Plus,
  Trash2,
  Trophy,
  Calendar,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Heart,
  Dumbbell,
  Briefcase,
  Wallet,
  Sparkles,
  Users,
} from "lucide-react";
import { HabitFocusArea, PersonalHabit } from "./types";
import { calculateStreak, getRecentDays, toDateKey, detectPatternAlert } from "./utils";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { CalendarModal } from "./CalendarModal";
import { IconPicker, IconBadge } from "./IconPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import type { LucideIcon } from "lucide-react";

const FOCUS_AREAS: Array<{
  value: HabitFocusArea;
  label: string;
  subtitle: string;
  hint: string;
  icon: LucideIcon;
  chipClass: string;
  headerClass: string;
}> = [
  {
    value: "education",
    label: "Education",
    subtitle: "Study and learning",
    hint: "Study, revision, lectures",
    icon: BookOpen,
    chipClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
    headerClass: "border-indigo-200 bg-indigo-50",
  },
  {
    value: "health",
    label: "Health",
    subtitle: "Body care and recovery",
    hint: "Sleep, water, meals",
    icon: Heart,
    chipClass: "border-rose-200 bg-rose-50 text-rose-700",
    headerClass: "border-rose-200 bg-rose-50",
  },
  {
    value: "fitness",
    label: "Fitness",
    subtitle: "Physical training",
    hint: "Gym, running, workouts",
    icon: Dumbbell,
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    headerClass: "border-emerald-200 bg-emerald-50",
  },
  {
    value: "career",
    label: "Career",
    subtitle: "Work and opportunities",
    hint: "Coding, resume, interviews",
    icon: Briefcase,
    chipClass: "border-amber-200 bg-amber-50 text-amber-700",
    headerClass: "border-amber-200 bg-amber-50",
  },
  {
    value: "finance",
    label: "Finance",
    subtitle: "Money habits",
    hint: "Budget, savings, expenses",
    icon: Wallet,
    chipClass: "border-cyan-200 bg-cyan-50 text-cyan-700",
    headerClass: "border-cyan-200 bg-cyan-50",
  },
  {
    value: "wellbeing",
    label: "Wellbeing",
    subtitle: "Mind and routine",
    hint: "Meditation, journaling, calm",
    icon: Sparkles,
    chipClass: "border-violet-200 bg-violet-50 text-violet-700",
    headerClass: "border-violet-200 bg-violet-50",
  },
  {
    value: "social",
    label: "Social",
    subtitle: "Relationships and community",
    hint: "Family calls, meetups, groups",
    icon: Users,
    chipClass: "border-sky-200 bg-sky-50 text-sky-700",
    headerClass: "border-sky-200 bg-sky-50",
  },
];

const FOCUS_AREA_LABELS: Record<HabitFocusArea, string> = {
  education: "Education",
  health: "Health",
  fitness: "Fitness",
  career: "Career",
  finance: "Finance",
  wellbeing: "Wellbeing",
  social: "Social",
};

const FOCUS_AREA_VALUES = FOCUS_AREAS.map((area) => area.value);
function isHabitFocusArea(value: string | undefined): value is HabitFocusArea {
  return !!value && FOCUS_AREA_VALUES.includes(value as HabitFocusArea);
}
function inferFocusArea(habit: Pick<PersonalHabit, "name" | "description">): HabitFocusArea {
  const text = `${habit.name} ${habit.description ?? ""}`.toLowerCase();

  const keywords: Record<HabitFocusArea, string[]> = {
    education: ["study", "exam", "class", "course", "lecture", "gpa", "revision", "assignment", "homework", "syllabus", "quiz", "notes", "chapter", "subject"],
    health: ["sleep", "water", "hydrate", "diet", "meal", "medicine", "health", "vitamin", "doctor", "walk", "stretch", "posture", "break", "hygiene"],
    fitness: ["gym", "workout", "run", "jog", "steps", "exercise", "yoga", "cardio", "strength", "pushup", "squat", "plank", "lift", "training"],
    career: ["interview", "portfolio", "project", "networking", "intern", "job", "resume", "linkedin", "skill", "coding", "leetcode", "cv", "apply", "application"],
    finance: ["budget", "save", "savings", "expense", "spend", "money", "finance", "invest", "wallet", "debt", "loan", "salary", "income", "cashflow"],
    wellbeing: ["meditation", "journal", "gratitude", "mindfulness", "calm", "relax", "therapy", "breathing", "reflect", "focus", "routine", "discipline", "digital detox"],
    social: ["friend", "family", "call", "meet", "community", "social", "hangout", "club", "mentor", "volunteer", "network", "event", "team", "group"],
  };

  let bestArea: HabitFocusArea = "wellbeing";
  let bestScore = 0;

  for (const area of FOCUS_AREA_VALUES) {
    const score = keywords[area].reduce((sum, word) => {
      const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "g");
      const matches = text.match(pattern);
      return sum + (matches?.length ?? 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestArea = area;
    }
  }

  return bestArea;
}
/**
 * Displays and manages personal habits for a single student.
 * Shows a calendar heatmap with completion streaks and allows tracking.
 */
export function PersonalHabits() {
  const { habits, addHabit: addHabitHook, updateHabit, removeHabit, loading, error } = usePersonalHabits();
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("activity");
  const [newHabitCategory, setNewHabitCategory] = useState<"build" | "break">("build");
  const [newHabitFocusArea, setNewHabitFocusArea] = useState<HabitFocusArea | "">("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const [openHabitId, setOpenHabitId] = useState<string | null>(null);
  const [highlightedHabitId, setHighlightedHabitId] = useState<string | null>(null);
  const habitCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];





  useEffect(() => {
    if (!highlightedHabitId) {
      return;
    }

    const element = habitCardRefs.current[highlightedHabitId];
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    const timeout = window.setTimeout(() => {
      setHighlightedHabitId(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [highlightedHabitId, habits]);

  /**
   * Creates a new habit and saves it to the database.
   * Resets the form after successfully creating.
   */
  const addHabit = async () => {
    if (!newHabitName.trim() || !newHabitFocusArea) return;

    const newHabit: PersonalHabit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completedDates: [],
      color: colors[habits.length % colors.length],
      createdAt: new Date().toISOString(),
      description: newHabitDescription.trim(),
      iconId: newHabitIcon,
      category: newHabitCategory,
      focusArea: newHabitFocusArea,
    };

    try {
      const created = await addHabitHook(newHabit);
      if (created) {
        setHighlightedHabitId(created.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save habit";
      console.error(message);
      return;
    }

    setNewHabitName("");
    setNewHabitDescription("");
    setNewHabitIcon("activity");
    setNewHabitCategory("build");
    setNewHabitFocusArea("");
    setShowAddForm(false);
  };

  /**
   * Marks a habit as completed or not completed for a specific date.
   * Updates the database when the change is made.
   */
  const toggleHabitDate = async (habitId: string, dateStr: string) => {
    const target = habits.find((habit) => habit.id === habitId);
    if (!target) return;

    const isDone = target.completedDates.includes(dateStr);
    const updated: PersonalHabit = {
      ...target,
      completedDates: isDone
        ? target.completedDates.filter((d) => d !== dateStr)
        : [...target.completedDates, dateStr],
    };

    try {
      await updateHabit(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update habit";
      console.error(message);
    }
  };

  /**
   * Deletes a habit from the database.
   * The habit is removed from the list after deletion.
   */
  const deleteHabit = async (id: string) => {
    try {
      await removeHabit(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete habit";
      console.error(message);
    }
  };

  const openHabit = habits.find((habit) => habit.id === openHabitId) ?? null;

  const groupedHabits = habits.reduce<Record<HabitFocusArea, PersonalHabit[]>>(
    (acc, habit) => {
      const area = isHabitFocusArea(habit.focusArea) ? habit.focusArea : inferFocusArea(habit);
      acc[area].push(habit);
      return acc;
    },
    {
      education: [],
      health: [],
      fitness: [],
      career: [],
      finance: [],
      wellbeing: [],
      social: [],
    },
  );

  const recentDays = getRecentDays();

  // Analyze break habit progress with intelligent logic
  // Check break habits and mark students who may need support.
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
    const isStruggling = maxStreak <= 3 && trackedIn7Days <= 3 && habit.completedDates.length >= 2;
    
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

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

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
            <div className="space-y-2">
              <Label>Focus Area</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {FOCUS_AREAS.map((area) => {
                  const Icon = area.icon;
                  const selected = newHabitFocusArea === area.value;

                  return (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => setNewHabitFocusArea(area.value)}
                      className={`text-left rounded-lg border p-3 transition-all ${
                        selected
                          ? `${area.chipClass} ring-2 ring-primary/30`
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-semibold">{area.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{area.subtitle}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{area.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addHabit} className="flex-1" disabled={!newHabitName.trim() || !newHabitFocusArea}>
                Start Tracking
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No habits yet. Start one to build your streak!
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-semibold">Category Board</h4>
              <p className="text-xs text-muted-foreground">
                Tube-style lanes so students can quickly find habits by topic.
              </p>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {FOCUS_AREAS.map((area) => {
                  const areaHabits = groupedHabits[area.value];
                  const Icon = area.icon;

                  return (
                    <div key={`lane-${area.value}`} className="relative w-[260px] pt-6">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                        <Badge className={`${area.chipClass} rounded-full px-3 py-1 border`}>
                          <span className="inline-flex items-center gap-1.5 text-[11px]">
                            <Icon className="h-3.5 w-3.5" />
                            {area.label}
                          </span>
                        </Badge>
                      </div>
                      <div className={`rounded-t-2xl rounded-b-[36px] border-2 min-h-[320px] p-3 pt-7 space-y-2 ${area.headerClass}`}>
                        <p className="text-[11px] text-muted-foreground">{area.subtitle}</p>
                        <div className="space-y-2">
                          {areaHabits.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 bg-background/70 px-3 py-5 text-center text-xs text-muted-foreground">
                              No habits yet
                            </div>
                          ) : (
                            areaHabits.map((habit) => {
                              return (
                              <button
                                key={`lane-item-${habit.id}`}
                                type="button"
                                ref={(element) => {
                                  habitCardRefs.current[habit.id] = element;
                                }}
                                onClick={() => setOpenHabitId(habit.id)}
                                className="w-full text-left rounded-xl border bg-background/90 p-2.5 shadow-sm transition hover:shadow-md"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex items-start gap-2">
                                    <IconBadge iconId={habit.iconId} size="sm" color={habit.color} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold truncate">{habit.name}</p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {calculateStreak(habit.completedDates)} day {habit.category === "break" ? "free" : "streak"}
                                      </p>
                                    </div>
                                  </div>
                                  {habit.category && (
                                    <Badge
                                      className={`text-[10px] h-5 ${
                                        habit.category === "build"
                                          ? "bg-green-500 hover:bg-green-600 text-white"
                                          : "bg-red-500 hover:bg-red-600 text-white"
                                      }`}
                                    >
                                      {habit.category === "build" ? "Build" : "Break"}
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 flex-1 text-[11px]"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenCalendarId(habit.id);
                                    }}
                                  >
                                    <Calendar className="h-3.5 w-3.5 mr-1" /> Mark
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0 p-0 text-destructive hover:text-destructive"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      deleteHabit(habit.id);
                                    }}
                                    aria-label={`Delete ${habit.name}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <CalendarModal
                                  open={openCalendarId === habit.id}
                                  onOpenChange={(open) => setOpenCalendarId(open ? habit.id : null)}
                                  completedDates={habit.completedDates}
                                  onDateClick={(dateStr) => toggleHabitDate(habit.id, dateStr)}
                                  habitName={habit.name}
                                  color={habit.color}
                                  patternAlertText={detectPatternAlert(habit.completedDates, habit.createdAt) || undefined}
                                />
                              </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!openHabit} onOpenChange={(open) => setOpenHabitId(open ? openHabitId : null)}>
        {openHabit && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconBadge iconId={openHabit.iconId} size="md" color={openHabit.color} />
                <span className="truncate">{openHabit.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] h-5">
                  {FOCUS_AREA_LABELS[isHabitFocusArea(openHabit.focusArea) ? openHabit.focusArea : inferFocusArea(openHabit)]}
                </Badge>
                {openHabit.category && (
                  <Badge
                    className={`text-[10px] h-5 ${
                      openHabit.category === "build"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {openHabit.category === "build" ? (
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
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>
                    {calculateStreak(openHabit.completedDates)} day {openHabit.category === "break" ? "free" : "streak"}
                  </span>
                </div>
              </div>

              {openHabit.description && (
                <p className="text-sm text-muted-foreground">{openHabit.description}</p>
              )}

              <HeatmapCalendar completedDates={openHabit.completedDates} color={openHabit.color} />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => setOpenCalendarId(openHabit.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" /> Mark Progress
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    deleteHabit(openHabit.id);
                    setOpenHabitId(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>

              <CalendarModal
                open={openCalendarId === openHabit.id}
                onOpenChange={(open) => setOpenCalendarId(open ? openHabit.id : null)}
                completedDates={openHabit.completedDates}
                onDateClick={(dateStr) => toggleHabitDate(openHabit.id, dateStr)}
                habitName={openHabit.name}
                color={openHabit.color}
                patternAlertText={detectPatternAlert(openHabit.completedDates, openHabit.createdAt) || undefined}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

