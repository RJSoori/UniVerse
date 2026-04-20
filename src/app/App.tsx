import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";

import Landing from "./components/student-registration/Landing";
import SignUpChoice from "./components/student-registration/SignUpChoice";
import SignIn from "./components/student-registration/SignIn";
import StudentAuthChoice from "./components/student-registration/StudentAuthChoice";
import StudentRegistration from "./components/student-registration/StudentRegistration";
import ForgotPassword from "./components/student-registration/ForgotPassword";
import ResetPassword from "./components/student-registration/ResetPassword";
import { JobRegistration } from "./components/JobHub/JobRegistration";
import SellerRegister from "./components/marketplace/SellerRegister.tsx";
import SellerDashboard from "./components/marketplace/SellerDashboard.tsx";
import { WidgetDashboard } from "./components/Settings/WidgetDashboard.tsx";
import { SkillsManager } from "./components/JobHub/SkillsManager";
import { TodoList } from "./components/TodoList";
import { Scheduler } from "./components/Scheduler";
import { MoneyManager } from "./components/MoneyManager";
import { HabitTracker } from "./components/HabitTracker";
import { JobHub } from "./components/JobHub/JobHub";
import { Marketplace } from "./components/Marketplace";
import { GpaCalculator as GPACalculator } from "./components/gpa-calculator/GpaCalculator";
import { FocusTimer } from "./components/FocusTimer/FocusTimer.tsx";
import SettingsPage from "./components/Settings/SettingsPage";
import { AdminPortal } from "./components/Admin/AdminPortal";
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
  UserRoundCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function App() {
  const [activeSection, setActiveSection] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [logoHovering, setLogoHovering] = useState(false);
  const [featureHovering, setFeatureHovering] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
  }, []);

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
      case "student-auth-choice":
        return <StudentAuthChoice onNavigate={setActiveSection} />;
      case "forgot-password":
        return <ForgotPassword onNavigate={setActiveSection} />;
      case "reset-password":
        return <ResetPassword onNavigate={setActiveSection} />;
      case "student-register":
        return <StudentRegistration onNavigate={setActiveSection} />;
      case "jobposter-register":
        return <JobRegistration onNavigate={setActiveSection} />;
      case "seller-register":
        return <SellerRegister onNavigate={setActiveSection} />;
      case "seller-dashboard":
        return <SellerDashboard onNavigate={setActiveSection} />;
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
        return <JobHub onNavigate={setActiveSection} />;
      case "marketplace":
        return <Marketplace onNavigate={setActiveSection} />;
      case "gpa":
        return <GPACalculator />;
      case "timer":
        return <FocusTimer />;
      case "settings":
        return <SettingsPage onNavigate={setActiveSection} />;
      case "skills-manager":
        return <SkillsManager onBack={() => setActiveSection("jobs")} />;
      case "admin-portal":
        return <AdminPortal />;
      default:
        return <Landing onNavigate={setActiveSection} />;
    }
  };

  // ✅ Fixed Logic: isEntryFlow now correctly excludes sidebar for admin-portal
  const isEntryFlow =
      activeSection === "landing" ||
      activeSection === "signup" ||
      activeSection === "signin" ||
      activeSection === "student-auth-choice" ||
      activeSection === "student-register" ||
      activeSection === "forgot-password" ||
      activeSection === "reset-password" ||
      activeSection === "seller-register" ||
      activeSection === "seller-dashboard" ||
      activeSection === "jobposter-register" ||
      activeSection === "admin-portal";

  return (
      <div
          className={cn(
              "min-h-screen overflow-x-hidden",
              isEntryFlow
                  ? "bg-background"
                  : "bg-[radial-gradient(circle_at_15%_5%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.08),transparent_35%)] bg-background",
          )}
      >
        {isEntryFlow ? (
            <main key={activeSection} className="flex-1 min-w-0">{renderContent()}</main>
        ) : (
            <>
              <Button
                  variant="outline"
                  size="icon"
                  className="fixed left-4 top-4 z-50 border-border/70 bg-background/95 shadow-md backdrop-blur-sm lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>

              <div className="container mx-auto max-w-[1600px] px-4 py-6">
                <div className="flex gap-6">
                  <aside
                      className={cn(
                          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border/70 bg-gradient-to-b from-background via-background to-muted/25 shadow-xl shadow-black/5 transition-[width,transform] duration-300",
                          sidebarOpen ? "translate-x-0" : "-translate-x-full",
                          "lg:translate-x-0",
                          desktopSidebarCollapsed ? "lg:w-20" : "lg:w-72",
                      )}
                  >
                    <div className="border-b border-border/70 bg-background/85 p-4 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                              type="button"
                              className="size-10 bg-primary rounded-lg flex items-center justify-center shadow-sm transition-all hover:brightness-110"
                              onClick={() => setDesktopSidebarCollapsed((prev) => !prev)}
                              onMouseEnter={() => setLogoHovering(true)}
                              onMouseLeave={() => setLogoHovering(false)}
                              aria-label={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                              title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                          >
                            {logoHovering || (!desktopSidebarCollapsed && featureHovering) ? (
                                desktopSidebarCollapsed ? (
                                    <ChevronRight className="size-6 text-primary-foreground" />
                                ) : (
                                    <ChevronLeft className="size-6 text-primary-foreground" />
                                )
                            ) : (
                                <GraduationCap className="size-6 text-primary-foreground" />
                            )}
                          </button>
                          <div className={cn(desktopSidebarCollapsed && "lg:hidden")}>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                              UniVerse
                            </h1>
                            <p className="text-xs text-muted-foreground font-medium">
                              Undergraduate Life Management System
                            </p>
                          </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                          <X className="size-5" />
                        </Button>
                      </div>
                    </div>

                    <nav
                        className="flex-1 space-y-1 overflow-y-auto p-4"
                        onMouseEnter={() => setFeatureHovering(true)}
                        onMouseLeave={() => setFeatureHovering(false)}
                    >
                      <p
                          className={cn(
                              "mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80",
                              desktopSidebarCollapsed && "lg:hidden",
                          )}
                      >
                        Navigation
                      </p>
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? "secondary" : "ghost"}
                                title={item.name}
                                className={cn(
                                    "w-full rounded-xl transition-all duration-200",
                                    desktopSidebarCollapsed
                                        ? "justify-center px-0"
                                        : "justify-start gap-3",
                                    isActive
                                        ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/20 shadow-sm"
                                        : "hover:bg-muted/80 hover:translate-x-0.5",
                                )}
                                onClick={() => {
                                  setActiveSection(item.id);
                                  setSidebarOpen(false);
                                }}
                            >
                              <Icon
                                  className={cn(
                                      "size-5",
                                      isActive ? "text-primary" : "text-muted-foreground",
                                  )}
                              />
                              <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>{item.name}</span>
                            </Button>
                        );
                      })}

                      <div className="my-4 border-t border-border" />

                      <p
                          className={cn(
                              "mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80",
                              desktopSidebarCollapsed && "lg:hidden",
                          )}
                      >
                        Quick Access
                      </p>

                      <Button
                          variant={
                            activeSection === "jobposter-register"
                                ? "secondary"
                                : "ghost"
                          }
                          title="Recruiter Portal"
                          className={cn(
                              "w-full rounded-xl transition-all duration-200",
                              desktopSidebarCollapsed
                                  ? "justify-center px-0"
                                  : "justify-start gap-3",
                              activeSection === "jobposter-register"
                                  ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/20 shadow-sm"
                                  : "hover:bg-muted/80 hover:translate-x-0.5",
                          )}
                          onClick={() => {
                            setActiveSection("jobposter-register");
                            setSidebarOpen(false);
                          }}
                      >
                        <UserRoundCheck
                            className={cn(
                                "size-5",
                                activeSection === "jobposter-register"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                            )}
                        />
                        <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>Recruiter Portal</span>
                      </Button>

                      {/* ✅ Seller Portal */}
                      <Button
                          variant={
                            activeSection === "seller-register" || activeSection === "seller-dashboard"
                                ? "secondary"
                                : "ghost"
                          }
                          title="Seller Portal"
                          className={cn(
                              "w-full rounded-xl transition-all duration-200",
                              desktopSidebarCollapsed
                                  ? "justify-center px-0"
                                  : "justify-start gap-3",
                              activeSection === "seller-register" || activeSection === "seller-dashboard"
                                  ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/20 shadow-sm"
                                  : "hover:bg-muted/80 hover:translate-x-0.5",
                          )}
                          onClick={() => {
                            setActiveSection("seller-register");
                            setSidebarOpen(false);
                          }}
                      >
                        <ShoppingBag
                            className={cn(
                                "size-5",
                                activeSection === "seller-register" || activeSection === "seller-dashboard"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                            )}
                        />
                        <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>Seller Portal</span>
                      </Button>

                    </nav>

                    <div className="border-t border-border/70 bg-background/80 p-4">
                      <Button
                          variant={activeSection === "settings" ? "secondary" : "ghost"}
                          title="Settings"
                          className={cn(
                              "w-full rounded-xl transition-all duration-200",
                              desktopSidebarCollapsed
                                  ? "justify-center px-0"
                                  : "justify-start gap-3",
                              activeSection === "settings"
                                  ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/20 shadow-sm"
                                  : "hover:bg-muted/80 hover:translate-x-0.5",
                          )}
                          onClick={() => {
                            setActiveSection("settings");
                            setSidebarOpen(false);
                          }}
                      >
                        <Settings
                            className={cn(
                                "size-5",
                                activeSection === "settings"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                            )}
                        />
                        <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>Settings</span>
                      </Button>
                    </div>
                  </aside>

                  {sidebarOpen && (
                      <div
                          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                          onClick={() => setSidebarOpen(false)}
                      />
                  )}

                  <main
                      className={cn(
                          "flex-1 min-w-0 transition-[margin] duration-300",
                          desktopSidebarCollapsed ? "lg:ml-20" : "lg:ml-72",
                      )}
                  >
                    <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border/70 bg-background/80 p-3 backdrop-blur-[1px] duration-500 md:p-4">
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