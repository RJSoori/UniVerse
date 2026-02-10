import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TodoList } from "./TodoList";
import { FocusTimer } from "./FocusTimer";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  CheckSquare,
  Wallet,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  GraduationCap,
  Clock
} from "lucide-react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function WidgetDashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    todosActive: 0,
    balance: 0,
    upcomingEvents: 0,
    habitsActive: 0,
    currentGPA: "0.00"
  });

  const [todayEvents, setTodayEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      // Data Retrieval from Local Storage
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const transactions = JSON.parse(localStorage.getItem("money-transactions") || "[]");
      const events = JSON.parse(localStorage.getItem("schedule-events") || "[]");
      const habits = JSON.parse(localStorage.getItem("habits") || "[]");
      const subjects = JSON.parse(localStorage.getItem("university-grades") || "[]");

      // Financial Calculation
      const totalIncome = transactions
          .filter((t: any) => t.type === "income")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpense = transactions
          .filter((t: any) => t.type === "expense")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

      // GPA Calculation (UoM Scaling)
      const useExtraWeight = JSON.parse(localStorage.getItem("gpa-use-extra-weight") || "true");
      let totalPoints = 0;
      let totalCredits = 0;
      const gradePoints: Record<string, number> = {
        "A+": useExtraWeight ? 4.2 : 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3,
        "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.5, "D": 1.0, "F": 0.0,
      };

      subjects.forEach((s: any) => {
        totalPoints += (gradePoints[s.grade] || 0) * s.credits;
        totalCredits += s.credits;
      });

      // Today's Agenda Logic
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysAgenda = events
          .filter((e: any) => e.date === todayStr)
          .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

      setTodayEvents(todaysAgenda);

      setStats({
        todosActive: todos.filter((t: any) => !t.completed).length,
        balance: totalIncome - totalExpense,
        upcomingEvents: events.length,
        habitsActive: habits.length,
        currentGPA: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
      });
    };

    loadData();
    // Listening for custom event to ensure real-time dashboard updates
    window.addEventListener("local-storage-update", loadData);
    return () => window.removeEventListener("local-storage-update", loadData);
  }, []);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground text-sm">Welcome back to your UniVerse dashboard.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <GraduationCap className="size-4 text-primary" />
            <span className="text-sm font-bold text-primary">GPA: {stats.currentGPA}</span>
          </div>
        </div>

        {/* Primary Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate("todo")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Tasks</CardDescription>
              <CheckSquare className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todosActive}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate("money")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Balance (LKR)</CardDescription>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {stats.balance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate("schedule")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Events</CardDescription>
              <Calendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate("habits")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Habits</CardDescription>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.habitsActive}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <Badge variant="outline" className="text-[10px]">{todayEvents.length} Events</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayEvents.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-xs text-muted-foreground italic">Nothing on the schedule today.</p>
                          <Button variant="link" size="sm" onClick={() => onNavigate("schedule")} className="text-[10px]">Add a lecture?</Button>
                        </div>
                    ) : (
                        todayEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors">
                              <div className="text-[10px] font-bold text-primary w-14 text-center border-r border-primary/20">
                                {event.startTime}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{event.title}</p>
                                <p className="text-[9px] text-muted-foreground uppercase">{event.type}</p>
                              </div>
                            </div>
                        ))
                    )}
                    {todayEvents.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-[10px] h-8 mt-2"
                            onClick={() => onNavigate("schedule")}
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
              <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => onNavigate("jobs")}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Job Hub</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground mb-3">Track career growth</p>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground">Open Hub</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => onNavigate("marketplace")}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Marketplace</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground mb-3">UoM Community Trading</p>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground">View All</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => onNavigate("gpa")}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">GPA Calc</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground mb-3">Grade tracking</p>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground">Check Grades</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <FocusTimer compact />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-primary" /> Project Team
                </CardTitle>
                <CardDescription className="text-[10px]">Collaborative tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">SC</div>
                      <span className="text-xs font-medium">Sarah</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">12d streak</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">MJ</div>
                      <span className="text-xs font-medium">Mike</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">5d streak</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}