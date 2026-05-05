import SleepSuggestionCard from "./SleepSuggestionCard";
import ProductivityGapCard from "./ProductivityGapCard";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import { TodoList } from "../todo/TodoList";
import { FocusTimer } from "../focus-timer/FocusTimer";
import { MoneyWidget } from "./MoneyWidget";
import { GpaWidget } from "./GpaWidget";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { useUniStorage } from "../../shared/hooks/useUniStorage";
import { useGpaCalculator } from "../gpa-calculator/hooks/useGpaCalculator";
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  GraduationCap,
  Clock,
} from "lucide-react";

const sectionToPath: Record<string, string> = {
  todo: "/todo",
  schedule: "/schedule",
  money: "/money",
  habits: "/habits",
  jobs: "/jobs",
  marketplace: "/marketplace",
  gpa: "/gpa",
  timer: "/timer",
};

interface TodoItem {
  id?: string;
  completed?: boolean;
}

interface ScheduleEvent {
  id?: string;
  date?: string;
  startTime?: string;
  title?: string;
  type?: string;
}

interface HabitItem {
  id?: string;
}

export function WidgetDashboard() {
  const navigate = useNavigate();
  const goSection = (section: string) =>
    navigate(sectionToPath[section] ?? "/dashboard");
  const { getCgpa, semesters: gpaSemesters } = useGpaCalculator();

  const [todos] = useUniStorage<TodoItem[]>("todos", []);
  const [events] = useUniStorage<ScheduleEvent[]>("schedule-events", []);
  const [habits] = useUniStorage<HabitItem[]>("habits", []);
  const currentGPA = getCgpa().toFixed(2);

  const stats = useMemo(() => {
    return {
      todosActive: todos.filter((t) => !t.completed).length,
      upcomingEvents: events.length,
      habitsActive: habits.length,
    };
  }, [todos, events, habits]);

  const todayEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.date === todayStr)
      .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }, [events]);

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

      {/* SUGGESTION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SleepSuggestionCard />
        <ProductivityGapCard />
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/todo")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Active Tasks
            </CardDescription>
            <CheckSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todosActive}</div>
            {stats.todosActive === 0 && (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-[10px] h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/todo");
                }}
              >
                Add your first todo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/schedule")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Total Events
            </CardDescription>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            {stats.upcomingEvents === 0 && (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-[10px] h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/schedule");
                }}
              >
                Plan your week
              </Button>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/habits")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Active Habits
            </CardDescription>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.habitsActive}</div>
            {stats.habitsActive === 0 && (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-[10px] h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/habits");
                }}
              >
                Track a new habit
              </Button>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/gpa")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Current GPA
            </CardDescription>
            <GraduationCap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGPA}</div>
            {gpaSemesters.length === 0 && (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-[10px] h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/gpa");
                }}
              >
                Add your first semester
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodoList compact maxItems={5} />

            {/* Today's Agenda Widget */}
            <Card>
              <CardHeader className="pb-3 border-b mb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="size-4 text-primary" /> Today's Agenda
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {todayEvents.length} Events
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayEvents.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-muted-foreground italic">
                        Nothing on the schedule today.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate("/schedule")}
                        className="text-[10px]"
                      >
                        Add a lecture?
                      </Button>
                    </div>
                  ) : (
                    todayEvents.map((event) => (
                      <div
                        key={
                          event.id ??
                          `${event.date}-${event.startTime}-${event.title}`
                        }
                        className="flex items-center gap-3 p-2 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <div className="text-[10px] font-bold text-primary w-14 text-center border-r border-primary/20">
                          {event.startTime}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">
                            {event.title}
                          </p>
                          <p className="text-[9px] text-muted-foreground uppercase">
                            {event.type}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {todayEvents.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[10px] h-8 mt-2"
                      onClick={() => navigate("/schedule")}
                    >
                      View Full Timetable <ArrowRight className="ml-2 size-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate("/jobs")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Job Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Track career growth
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Open Hub
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate("/marketplace")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Community Trading
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate("/gpa")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">GPA Calc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Grade tracking
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Check Grades
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Project Team Card - demo content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-primary" /> Project Team
                <Badge variant="outline" className="text-[9px] ml-2">
                  Demo
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px]">
                Collaborative tracking (sample data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                      SC
                    </div>
                    <span className="text-xs font-medium">Sarah</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    12d streak
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                      MJ
                    </div>
                    <span className="text-xs font-medium">Mike</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    5d streak
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets (Right) */}
        <div className="space-y-6">
          <MoneyWidget onNavigate={goSection} compact />
          <GpaWidget onNavigate={goSection} compact />
          <FocusTimer compact />
        </div>
      </div>
    </div>
  );
}
