import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TodoList } from "./TodoList";
import { FocusTimer } from "./FocusTimer";
import { Button } from "./ui/button";
import { 
  CheckSquare, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users,
  Briefcase,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function WidgetDashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    todosActive: 0,
    balance: 0,
    upcomingEvents: 0,
    habitsActive: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]");
      const transactions = JSON.parse(localStorage.getItem("money-transactions") || "[]");
      const events = JSON.parse(localStorage.getItem("schedule-events") || "[]");
      const habits = JSON.parse(localStorage.getItem("habits") || "[]");

      const totalIncome = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingEvents = events.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= nextWeek;
      }).length;

      setStats({
        todosActive: todos.filter((t: any) => !t.completed).length,
        balance: totalIncome - totalExpense,
        upcomingEvents,
        habitsActive: habits.length,
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Your productivity overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("todo")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Tasks</CardDescription>
            <CheckSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.todosActive}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending todos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("money")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Balance</CardDescription>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${stats.balance.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current balance</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("schedule")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>This Week</CardDescription>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming events</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("habits")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Habits</CardDescription>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.habitsActive}</div>
            <p className="text-xs text-muted-foreground mt-1">Being tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodoList compact maxItems={5} />
            <FocusTimer compact />
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate("jobs")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="size-5" />
                  Job Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Find internships and job opportunities
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Browse Jobs
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate("marketplace")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingBag className="size-5" />
                  Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Buy, sell, or rent campus items
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Listings
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate("gpa")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-5" />
                  GPA Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Calculate your semester GPA
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Calculate GPA
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Habit Friends
              </CardTitle>
              <CardDescription>Connect and stay motivated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sarah Chen</span>
                  <span className="text-xs text-muted-foreground">15 day streak</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mike Johnson</span>
                  <span className="text-xs text-muted-foreground">23 day streak</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emily Davis</span>
                  <span className="text-xs text-muted-foreground">8 day streak</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onNavigate("habits")}
              >
                View All Friends
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-3">
                  <p className="text-sm font-medium">Software Intern</p>
                  <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
                </div>
                <div className="border-l-2 border-green-500 pl-3">
                  <p className="text-sm font-medium">Marketing Intern</p>
                  <p className="text-xs text-muted-foreground">Brand Solutions</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-3">
                  <p className="text-sm font-medium">Data Science Intern</p>
                  <p className="text-xs text-muted-foreground">AI Research Labs</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onNavigate("jobs")}
              >
                Browse All Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
