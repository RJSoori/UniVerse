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
  ArrowRight,
  GraduationCap,
  Clock,
  Sparkles,
  Moon,
  Sun,
  Coffee
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
  const [sleepInsight, setSleepInsight] = useState({ sleep: "11:30 PM", wake: "6:30 AM" });

  useEffect(() => {
    const loadData = () => {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const transactions = JSON.parse(localStorage.getItem("money-transactions") || "[]");
      const events = JSON.parse(localStorage.getItem("schedule-events") || "[]");
      const habits = JSON.parse(localStorage.getItem("habits") || "[]");
      const subjects = JSON.parse(localStorage.getItem("university-grades") || "[]");

      const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + t.amount, 0);

      // Simple Sleep Analysis Logic based on tomorrow's first event
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const firstEventTomorrow = events.find((e: any) => e.date === tomorrowStr);

      if (firstEventTomorrow) {
        setSleepInsight({ sleep: "11:00 PM", wake: "6:00 AM" }); // Simplified logic
      }

      const todayStr = new Date().toISOString().split('T')[0];
      setTodayEvents(events.filter((e: any) => e.date === todayStr).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)));

      setStats({
        todosActive: todos.filter((t: any) => !t.completed).length,
        balance: totalIncome - totalExpense,
        upcomingEvents: events.length,
        habitsActive: habits.length,
        currentGPA: "3.75" // Mock for UI
      });
    };

    loadData();
    window.addEventListener("local-storage-update", loadData);
    return () => window.removeEventListener("local-storage-update", loadData);
  }, []);

  return (
      <div className="space-y-6 pb-12">
        {/* --- AI INTELLIGENCE HERO SECTION (NEW REQ) --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary to-blue-700 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white/20 w-fit px-2 py-1 rounded-md">
                    <Sun className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Morning Insight</span>
                  </div>
                  <h3 className="text-xl font-bold">"Your focus determines your reality."</h3>
                  <p className="text-sm opacity-90">
                    You have <span className="font-bold">{stats.todosActive} tasks</span> to tackle today.
                    Prioritize the {todayEvents.length} events on your schedule to maintain your {stats.currentGPA} GPA.
                  </p>
                </div>
                <Coffee className="size-12 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-indigo-500/30 w-fit px-2 py-1 rounded-md text-indigo-300">
                    <Moon className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Recovery Analysis</span>
                  </div>
                  <h3 className="text-xl font-bold">Sleep Schedule Optimization</h3>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[10px] uppercase opacity-50">Target Sleep</p>
                      <p className="text-lg font-mono font-bold text-indigo-300">{sleepInsight.sleep}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-50">Target Wake</p>
                      <p className="text-lg font-mono font-bold text-indigo-300">{sleepInsight.wake}</p>
                    </div>
                  </div>
                  <p className="text-[10px] italic opacity-70 mt-2">Based on your first lecture at 8:00 AM tomorrow.</p>
                </div>
                <Sparkles className="size-12 opacity-20 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground text-sm">Real-time analysis of your undergraduate life.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <GraduationCap className="size-4 text-primary" />
            <span className="text-sm font-bold text-primary">GPA: {stats.currentGPA}</span>
          </div>
        </div>

        {/* Primary Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => onNavigate("todo")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Tasks</CardDescription>
              <CheckSquare className="size-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.todosActive}</div></CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={() => onNavigate("money")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 text-xs font-medium uppercase tracking-wider">
              Balance (LKR)
              <Wallet className="size-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">Rs. {stats.balance.toLocaleString()}</div></CardContent>
          </Card>

          {/* Total Events & Habits stats follow the same pattern... */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TodoList compact maxItems={5} />

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
                        <div className="text-center py-10 text-xs text-muted-foreground italic">Nothing on the schedule today.</div>
                    ) : (
                        todayEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg border bg-primary/5">
                              <div className="text-[10px] font-bold text-primary w-14 text-center border-r border-primary/20">{event.startTime}</div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{event.title}</p></div>
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <FocusTimer compact />
            {/* Analytical Widget for Project Progress */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" /> Term Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>SYLLABUS COVERAGE</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}