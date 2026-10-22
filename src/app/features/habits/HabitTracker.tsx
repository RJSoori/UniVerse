import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { AlertTriangle, Lightbulb, Plus, Target } from "lucide-react";
import { GroupHabits } from "./GroupHabits";
import { PersonalHabits } from "./PersonalHabits";
import { HabitFocusArea, PersonalHabit } from "./types";
import { calculateStreak } from "./utils";
import { usePersonalHabits } from "../../shared/hooks/usePersonalHabits";
import { useAuth } from "../../auth/AuthContext";
import { useSchedule } from "../../shared/hooks/useSchedule";

type HabitSuggestion = {
  title: string;
  description: string;
  habit: Omit<PersonalHabit, "id">;
};

type SuggestedCategory = "build" | "break";

type HabitTemplate = {
  name: string;
  description: string;
  iconId: string;
};

const SUGGESTION_TEMPLATES: Record<HabitFocusArea, Record<SuggestedCategory, HabitTemplate>> = {
  education: {
    build: {
      name: "10-minute review",
      description: "A short review habit to reinforce your study routine.",
      iconId: "book-open",
    },
    break: {
      name: "Study shutdown",
      description: "A closing routine that helps you step away from study mode.",
      iconId: "moon",
    },
  },
  health: {
    build: {
      name: "Hydration check-in",
      description: "A simple health habit to keep your routine steady.",
      iconId: "droplets",
    },
    break: {
      name: "Wind-down reset",
      description: "A recovery habit that helps you step out of the day cleanly.",
      iconId: "moon-star",
    },
  },
  fitness: {
    build: {
      name: "5-minute stretch",
      description: "A short movement habit to keep momentum without overdoing it.",
      iconId: "dumbbell",
    },
    break: {
      name: "Rest day check-in",
      description: "A recovery habit that protects your energy between workouts.",
      iconId: "bed",
    },
  },
  career: {
    build: {
      name: "Application check-in",
      description: "A small career habit that keeps opportunities moving.",
      iconId: "briefcase",
    },
    break: {
      name: "Work shutdown",
      description: "A boundary habit that helps you stop work cleanly.",
      iconId: "power",
    },
  },
  finance: {
    build: {
      name: "Expense check-in",
      description: "A simple finance habit to keep spending visible.",
      iconId: "wallet",
    },
    break: {
      name: "Pause before spend",
      description: "A reset habit that helps you slow down before purchases.",
      iconId: "hourglass",
    },
  },
  wellbeing: {
    build: {
      name: "Breathing check-in",
      description: "A small wellbeing habit that keeps the day grounded.",
      iconId: "brain",
    },
    break: {
      name: "Offline wind-down",
      description: "A recovery habit that helps you detach from the day.",
      iconId: "sparkles",
    },
  },
  social: {
    build: {
      name: "Message a friend",
      description: "A social habit that keeps your connections active.",
      iconId: "messages-square",
    },
    break: {
      name: "Social reset",
      description: "A quiet habit that gives you space between social bursts.",
      iconId: "shield-off",
    },
  },
};

const ONBOARDING_BUILD_HABIT: HabitTemplate = {
  name: "Daily Study Review",
  description: "A first-month habit that helps every student stay consistent.",
  iconId: "book-open",
};

const ACCOUNT_AGE_THRESHOLD_DAYS = 30;

function getTemplate(focusArea: HabitFocusArea, category: SuggestedCategory): HabitTemplate {
  return SUGGESTION_TEMPLATES[focusArea][category];
}

function createSuggestion(
  referenceHabit: PersonalHabit,
  category: SuggestedCategory,
  title: string,
  description: string,
  color: string
): HabitSuggestion {
  const focusArea = referenceHabit.focusArea ?? "wellbeing";
  const template = getTemplate(focusArea, category);

  return {
    title,
    description,
    habit: {
      name: template.name,
      completedDates: [],
      color,
      description: template.description,
      iconId: template.iconId,
      category,
      focusArea,
    },
  };
}

function createTemplateSuggestion(
  focusArea: HabitFocusArea,
  category: SuggestedCategory,
  title: string,
  description: string,
  color: string
): HabitSuggestion {
  const template = getTemplate(focusArea, category);

  return {
    title,
    description,
    habit: {
      name: template.name,
      completedDates: [],
      color,
      description: template.description,
      iconId: template.iconId,
      category,
      focusArea,
    },
  };
}

function getDaysSinceLastTrack(completedDates: string[]) {
  // Used to identify habits that have gone stale and may need a lighter restart suggestion.
  if (completedDates.length === 0) return Number.POSITIVE_INFINITY;

  const sortedDates = [...completedDates].sort();
  const lastTracked = new Date(sortedDates[sortedDates.length - 1]);

  if (Number.isNaN(lastTracked.getTime())) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastTracked.setHours(0, 0, 0, 0);

  return (today.getTime() - lastTracked.getTime()) / (1000 * 60 * 60 * 24);
}

function getAccountAgeDays(createdAt?: string | null) {
  // The first-month onboarding rule is based on the user's account creation date.
  if (!createdAt) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  created.setHours(0, 0, 0, 0);

  return (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
}

function isStudyLoadEntry(title: string, description?: string) {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return /class|lecture|study|study session|revision|revision session|exam|assignment|homework|quiz|lab|tutorial|project/.test(text);
}

function parseMinutes(time?: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function getStudyLoadScore(events: { title: string; description?: string; startTime?: string; endTime?: string }[]) {
  // Only events that look like academic work count toward the overload signal.
  return events.reduce((score, event) => {
    if (!isStudyLoadEntry(event.title, event.description)) return score;

    const startMinutes = parseMinutes(event.startTime);
    const endMinutes = parseMinutes(event.endTime);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return score + 1;
    }

    const durationHours = Math.max((endMinutes - startMinutes) / 60, 0.5);
    return score + durationHours;
  }, 0);
}

function buildOnboardingSuggestion(colors: string[]): HabitSuggestion {
  // New students always get the same starter build habit so the system can learn from real behavior later.
  return {
    title: ONBOARDING_BUILD_HABIT.name,
    description: "Start with one simple build habit so the system can learn your routine.",
    habit: {
      name: ONBOARDING_BUILD_HABIT.name,
      completedDates: [],
      color: colors[0],
      description: ONBOARDING_BUILD_HABIT.description,
      iconId: ONBOARDING_BUILD_HABIT.iconId,
      category: "build",
      focusArea: "education",
    },
  };
}

function buildOverloadBreakSuggestion(colors: string[], focusArea: HabitFocusArea = "education"): HabitSuggestion {
  // Break habits are only suggested when the schedule actually looks overloaded.
  return createTemplateSuggestion(
    focusArea,
    "break",
    "Protect your study load",
    "Your schedule looks busy. A break habit can help prevent burnout when study sessions stack up.",
    colors[1 % colors.length]
  );
}

function buildHabitSuggestion(
  habits: PersonalHabit[],
  colors: string[],
  accountAgeDays: number | null,
  studyLoadScore: number
): HabitSuggestion | null {
  // Stage 1: onboarding for the first month, Stage 2: break suggestion from heavy study load,
  // Stage 3: behavior-based recommendation from existing habit history.
  const onboardingMode = (accountAgeDays !== null && accountAgeDays < ACCOUNT_AGE_THRESHOLD_DAYS) || (accountAgeDays === null && habits.length <= 1);
  if (onboardingMode) {
    return buildOnboardingSuggestion(colors);
  }

  if (habits.length === 0) return null;

  if (studyLoadScore >= 8) {
    return buildOverloadBreakSuggestion(colors, "education");
  }

  const habitSignals = habits.map((habit) => ({
    habit,
    streak: calculateStreak(habit.completedDates),
    daysSinceLastTrack: getDaysSinceLastTrack(habit.completedDates),
  }));

  const activeSignals = habitSignals.filter((signal) => signal.habit.completedDates.length > 0);
  if (activeSignals.length === 0) return null;

  const strongestHabit = [...activeSignals].sort(
    (left, right) =>
      right.streak - left.streak ||
      left.daysSinceLastTrack - right.daysSinceLastTrack ||
      right.habit.completedDates.length - left.habit.completedDates.length
  )[0];

  const strugglingHabit = [...activeSignals].sort(
    (left, right) =>
      right.daysSinceLastTrack - left.daysSinceLastTrack ||
      left.streak - right.streak ||
      left.habit.completedDates.length - right.habit.completedDates.length
  )[0];

  const buildCount = habits.filter((habit) => habit.category === "build").length;
  const breakCount = habits.filter((habit) => habit.category === "break").length;
  const color = colors[habits.length % colors.length];

  const chooseComplementaryCategory = (habit: PersonalHabit): SuggestedCategory =>
    habit.category === "break" ? "build" : "break";

  // Strong streaks get a balancing suggestion so the routine stays mixed.
  if (strongestHabit.streak >= 4) {
    const category = chooseComplementaryCategory(strongestHabit.habit);
    return createSuggestion(
      strongestHabit.habit,
      category,
      `Balance ${strongestHabit.habit.name}`,
      `You have a strong streak with ${strongestHabit.habit.name}. Add a complementary habit so the routine stays balanced.`,
      color
    );
  }

  // Weak or abandoned habits get a restart suggestion, but the replacement still stays complementary.
  if (strugglingHabit.streak <= 2 && strugglingHabit.daysSinceLastTrack >= 3 && strugglingHabit.habit.completedDates.length >= 2) {
    const category = chooseComplementaryCategory(strugglingHabit.habit);
    return createSuggestion(
      strugglingHabit.habit,
      category,
      `Support ${strugglingHabit.habit.name}`,
      `This habit has cooled off. A complementary habit can help the routine stick without repeating the same pattern.`,
      color
    );
  }

  // Fallback: use the first tracked habit to generate a concrete template name from its focus area.
  const referenceHabit = habits[0];
  const category = chooseComplementaryCategory(referenceHabit);
  const template = getTemplate(referenceHabit.focusArea ?? "wellbeing", category);

  return createSuggestion(
    referenceHabit,
    category,
    template.name,
    referenceHabit.completedDates.length > 0
      ? `You already started tracking ${referenceHabit.name}. The system is suggesting ${template.name} as a complementary habit rather than repeating the same one.`
      : `You added ${referenceHabit.name}, so the system is suggesting ${template.name} to help build a fuller routine.`,
    color
  );
}

export function HabitTracker() {
  const { user } = useAuth();
  const { events } = useSchedule();
  const { habits, addHabit: addHabitHook } = usePersonalHabits();
  const [addedSuggestion, setAddedSuggestion] = useState(false);
  const suggestionTimerRef = useRef<number | null>(null);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const accountAgeDays = useMemo(
    // Use `createdAt` when available; fall back to `firstSeenAt` set by the client
    // if the backend does not return `createdAt`. This supports the onboarding
    // suggestion (first-month) even for older accounts that lack createdAt fields.
    () => getAccountAgeDays(user?.createdAt ?? user?.firstSeenAt),
    [user?.createdAt, user?.firstSeenAt]
  );
  const studyLoadScore = useMemo(() => getStudyLoadScore(events), [events]);
  const suggestedHabit = useMemo(
    () => buildHabitSuggestion(habits, colors, accountAgeDays, studyLoadScore),
    [accountAgeDays, colors, habits, studyLoadScore]
  );
  const visibleSuggestion = useMemo(() => {
    if (!suggestedHabit) return null;
    const suggestedName = (suggestedHabit.habit.name ?? "").trim().toLowerCase();
    const exists = habits.some((h) => (h.name ?? "").trim().toLowerCase() === suggestedName);
    return !exists ? suggestedHabit : null;
  }, [suggestedHabit, habits]);

  const addSuggestedHabit = async () => {
    if (!visibleSuggestion) return;

    await addHabitHook(visibleSuggestion.habit);
    setAddedSuggestion(true);
    if (suggestionTimerRef.current) {
      window.clearTimeout(suggestionTimerRef.current);
    }
    suggestionTimerRef.current = window.setTimeout(() => {
      setAddedSuggestion(false);
      suggestionTimerRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (suggestionTimerRef.current) {
        window.clearTimeout(suggestionTimerRef.current);
      }
    };
  }, []);
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

    const isStruggling = daysSinceLastTrack >= 3 && maxStreak <= 3 && habit.completedDates.length >= 2;

    return {
      daysSinceLastTrack: Math.floor(daysSinceLastTrack),
      isStruggling,
    };
  };

  const strugglingBreakHabit = habits.find((h) => analyzeBreakHabitProgress(h)?.isStruggling);

  return (
    <div className="app-page">
      <div className="space-y-1">
        <h2 className="app-page-title">Habit Tracker</h2>
        <p className="app-page-subtitle">Build consistency in your daily routine</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleSuggestion && (
          <Card className={`border-primary/20 transition-colors ${
            addedSuggestion ? "bg-green-100 border-green-300" : "bg-primary/5"
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-sm font-semibold ${
                addedSuggestion ? "text-green-700" : "text-primary"
              }`}>
                <Lightbulb className="h-4 w-4" />
                {addedSuggestion ? "Habit Added!" : "Lifestyle Insight: Suggested Habit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{visibleSuggestion.title}</p>
                <p className="text-xs text-muted-foreground">{visibleSuggestion.description}</p>
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


