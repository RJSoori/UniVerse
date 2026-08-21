import { useGpaCalculator } from "../gpa-calculator/hooks/useGpaCalculator";
import { GraduationCap } from "lucide-react";
import { DashboardGrid } from "./DashboardGrid";

export function WidgetDashboard() {
  const { getCgpa } = useGpaCalculator();
  const currentGPA = getCgpa().toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground text-sm">
            Welcome back to your UniVerse dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <GraduationCap className="size-4 text-primary" />
          <span className="text-sm font-bold text-primary">
            GPA: {currentGPA}
          </span>
        </div>
      </div>

      <DashboardGrid />
    </div>
  );
}
