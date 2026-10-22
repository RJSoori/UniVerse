import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../shared/ui/card";
import { Briefcase, ShoppingBag, Timer, ArrowRight } from "lucide-react";
import { useGpaCalculator } from "../../gpa-calculator/hooks/useGpaCalculator";
import { focusApi } from "../../focus-timer/focusApi";
import { getSuggestedStudyMinutes, formatStudyMinutes } from "../../focus-timer/studyGoal";

export function QuickAccessRow() {
  const navigate = useNavigate();
  const { getCgpa } = useGpaCalculator();
  const [todayMinutes, setTodayMinutes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    focusApi.getAnalytics().then((data: { date: string; minutes: number }[]) => {
      if (cancelled) return;
      const todayStr = new Date().toISOString().split("T")[0];
      const record = data.find((d) => d.date === todayStr);
      setTodayMinutes(record ? record.minutes : 0);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestedMinutes = Math.round(getSuggestedStudyMinutes(getCgpa()));
  const minutesLeft = todayMinutes === null ? null : Math.max(0, suggestedMinutes - todayMinutes);
  const studyGoalDescription =
    minutesLeft === null
      ? "Loading..."
      : minutesLeft === 0
        ? "Today's goal reached!"
        : `${formatStudyMinutes(minutesLeft)} left today`;

  const links = [
    { title: "Job Hub", description: "Track career growth", path: "/jobs", icon: Briefcase },
    { title: "Marketplace", description: "Community trading", path: "/marketplace", icon: ShoppingBag },
    { title: "Study Goal", description: studyGoalDescription, path: "/timer", icon: Timer },
  ];

  return (
    <Card className="h-full">
      <CardContent className="h-full p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {links.map(({ title, description, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center justify-between gap-2 p-3 rounded-lg border text-left hover:bg-accent/60 hover:shadow-sm transition-all group"
          >
            <span className="flex items-center gap-2 min-w-0">
              <Icon className="size-4 text-primary shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-bold truncate">{title}</span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  {description}
                </span>
              </span>
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
