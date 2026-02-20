import { useState } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";

import Landing  from "./components/student-registration/Landing";
import { SignUpChoice } from "./components/student-registration/SignUpChoice";
import SignIn from "./components/student-registration/SignIn";
import StudentChoice from "./components/student-registration/StudentChoice";
import StudentRegistration from "./components/student-registration/StudentRegistration";
import { JobRegistration } from "./components/JobRegistration";

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
    Wallet,
    TrendingUp,
    Briefcase,
    ShoppingBag,
    Calculator,
    Timer,
    Menu,
    X,
    GraduationCap,
    UserPlus,
} from "lucide-react";

export default function App() {
    const [activeSection, setActiveSection] = useState("landing");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "todo", name: "Todo List", icon: CheckSquare },
        { id: "schedule", name: "Schedule", icon: Calendar },
        { id: "money", name: "Money Manager", icon: Wallet },
        { id: "habits", name: "Habits", icon: TrendingUp },
        { id: "jobs", name: "Job Hub", icon: Briefcase },
        { id: "marketplace", name: "Marketplace", icon: ShoppingBag },
        { id: "gpa", name: "GPA Calculator", icon: Calculator },
        { id: "timer", name: "Focus Timer", icon: Timer },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "landing":
                return <Landing onNavigate={setActiveSection} />;
            case "signup":
                return <SignUpChoice onNavigate={setActiveSection} />;
            case "signin":
                return <SignIn onNavigate={setActiveSection} />;
            case "student-choice":
                return <StudentChoice onNavigate={setActiveSection} />;
            case "student-register":
                return <StudentRegistration onNavigate={setActiveSection} />;
            case "post-jobs":
                return <JobRegistration />;
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
                return <Landing onNavigate={setActiveSection} />;
        }
    };

    const isEntryFlow =
        activeSection === "landing" ||
        activeSection === "signup" ||
        activeSection === "signin" ||
        activeSection === "student-register" ||
        activeSection === "student-choice" ||
        activeSection === "post-jobs";

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {isEntryFlow ? (
                <main className="flex-1 min-w-0">
                    {activeSection === "post-jobs" && (
                        <div className="p-6 pb-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setActiveSection("signup")}
                            >
                                ← Back to Selection
                            </Button>
                        </div>
                    )}
                    {renderContent()}
                </main>
            ) : (
                <>
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
                                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                            <GraduationCap className="size-6 text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold tracking-tight">UniVerse</h1>
                                            <p className="text-xs text-muted-foreground hidden sm:block font-medium">
                                                Undergraduate Life Management System
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                            UoM Undergraduate
                                        </p>
                                        <p className="text-[10px] text-muted-foreground italic">Sprint Phase 2026</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveSection("landing")}
                                    >
                                        Log Out
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="container mx-auto px-4 py-6">
                        <div className="flex gap-6">
                            <aside
                                className={cn(
                                    "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background pt-24 transition-transform lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:translate-x-0",
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
                                                className={cn(
                                                    "w-full justify-start gap-3",
                                                    isActive ? "bg-secondary font-semibold" : ""
                                                )}
                                                onClick={() => {
                                                    setActiveSection(item.id);
                                                    setSidebarOpen(false);
                                                }}
                                            >
                                                <Icon
                                                    className={cn(
                                                        "size-5",
                                                        isActive ? "text-primary" : "text-muted-foreground"
                                                    )}
                                                />
                                                {item.name}
                                            </Button>
                                        );
                                    })}
                                    <div className="pt-4 mt-4 border-t">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-muted-foreground"
                                            onClick={() => setActiveSection("post-jobs")}
                                        >
                                            <UserPlus className="size-5" />
                                            Recruiter Portal
                                        </Button>
                                    </div>
                                </nav>
                            </aside>

                            {sidebarOpen && (
                                <div
                                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                                    onClick={() => setSidebarOpen(false)}
                                />
                            )}

                            <main className="flex-1 min-w-0">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {renderContent()}
                                </div>
                            </main>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}