import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { useUniStorage } from "../../../shared/hooks/useUniStorage";
import { useSchedule } from "../../../shared/hooks/useSchedule";
import { useTodos } from "../../../shared/hooks/useTodos";
import { useGpaCalculator } from "../../gpa-calculator/hooks/useGpaCalculator";
import { CheckSquare, Calendar, TrendingUp, GraduationCap } from "lucide-react";

interface HabitItem {
  id?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  path: string;
  emptyActionLabel?: string;
  isEmpty?: boolean;
}

function StatCard({ label, value, icon, path, emptyActionLabel, isEmpty }: StatCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
      onClick={() => navigate(path)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider">
          {label}
        </CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {isEmpty && emptyActionLabel && (
          <Button
            variant="link"
            size="sm"
            className="px-0 text-[10px] h-6"
            onClick={(e) => {
              e.stopPropagation();
              navigate(path);
            }}
          >
            {emptyActionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function StatTasksCard() {
  const { todos } = useTodos();
  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);
  return (
    <StatCard
      label="Active Tasks"
      value={activeCount}
      icon={<CheckSquare className="size-4 text-muted-foreground" />}
      path="/todo"
      isEmpty={activeCount === 0}
      emptyActionLabel="Add your first todo"
    />
  );
}

export function StatEventsCard() {
  const { events } = useSchedule();
  return (
    <StatCard
      label="Total Events"
      value={events.length}
      icon={<Calendar className="size-4 text-muted-foreground" />}
      path="/schedule"
      isEmpty={events.length === 0}
      emptyActionLabel="Plan your week"
    />
  );
}

export function StatHabitsCard() {
  const [habits] = useUniStorage<HabitItem[]>("habits", []);
  return (
    <StatCard
      label="Active Habits"
      value={habits.length}
      icon={<TrendingUp className="size-4 text-muted-foreground" />}
      path="/habits"
      isEmpty={habits.length === 0}
      emptyActionLabel="Track a new habit"
    />
  );
}

export function StatGpaCard() {
  const { getCgpa, semesters } = useGpaCalculator();
  const currentGPA = getCgpa().toFixed(2);
  return (
    <StatCard
      label="Current GPA"
      value={currentGPA}
      icon={<GraduationCap className="size-4 text-muted-foreground" />}
      path="/gpa"
      isEmpty={semesters.length === 0}
      emptyActionLabel="Add your first semester"
    />
  );
}
