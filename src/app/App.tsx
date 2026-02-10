import { useState } from "react";
import { Button } from "./components/ui/button";
import { WidgetDashboard } from "./components/WidgetDashboard";
import { TodoList } from "./components/TodoList";
import { Scheduler } from "./components/Scheduler";
import { MoneyManager } from "./components/MoneyManager";
import { HabitTracker } from "./components/HabitTracker";
import { JobHub } from "./components/JobHub";
import { Marketplace } from "./components/Marketplace";
import { GPACalculator } from "./components/GPACalculator";
import { FocusTimer } from "./components/FocusTimer";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  ShoppingBag,
  Calculator,
  Timer,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "./components/ui/utils";

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "todo", name: "Todo List", icon: CheckSquare },
    { id: "schedule", name: "Schedule", icon: Calendar },
    { id: "money", name: "Money Manager", icon: DollarSign },
    { id: "habits", name: "Habits", icon: TrendingUp },
    { id: "jobs", name: "Job Hub", icon: Briefcase },
    { id: "marketplace", name: "Marketplace", icon: ShoppingBag },
    { id: "gpa", name: "GPA Calculator", icon: Calculator },
    { id: "timer", name: "Focus Timer", icon: Timer },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <WidgetDashboard onNavigate={setActiveSection} />;
      case "todo":
        return <TodoList />;
      case "schedule":
        return <Scheduler />;
      case "money":
        return <MoneyManager />;
      case "habits":
        return <HabitTracker />;
      case "jobs":
        return <JobHub />;
      case "marketplace":
        return <Marketplace />;
      case "gpa":
        return <GPACalculator />;
      case "timer":
        return <FocusTimer />;
      default:
        return <WidgetDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="size-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">UniVerse</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    University Student Platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background pt-20 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="space-y-1 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 size-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}