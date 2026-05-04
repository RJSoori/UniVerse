import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Button } from "./shared/ui/button";
import { cn } from "./shared/ui/utils";

import RequireAuth from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";
import { ThemeToggle } from "./shared/components/ThemeToggle";
import { GpaCalculatorProvider } from "./features/gpa-calculator/hooks/useGpaCalculator";
import { MoneyManagerProvider } from "./features/money-manager/hooks/useMoneyManager";
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
  LogOut,
} from "lucide-react";

const Landing = lazy(() => import("./features/entry/Landing"));
const SignUpChoice = lazy(() => import("./features/entry/SignUpChoice"));
const SignIn = lazy(() => import("./features/entry/SignIn"));
const StudentAuthChoice = lazy(
  () => import("./features/entry/StudentAuthChoice"),
);
const StudentRegistration = lazy(
  () => import("./features/entry/StudentRegistration"),
);
const PasswordResetUnavailable = lazy(
  () => import("./features/entry/PasswordResetUnavailable"),
);
const JobRegistration = lazy(() =>
  import("./features/job-hub/JobRegistration").then((module) => ({
    default: module.JobRegistration,
  })),
);
const SellerRegister = lazy(
  () => import("./features/marketplace/SellerRegister"),
);
const SellerDashboard = lazy(
  () => import("./features/marketplace/SellerDashboard"),
);
const WidgetDashboard = lazy(() =>
  import("./features/dashboard/WidgetDashboard").then((module) => ({
    default: module.WidgetDashboard,
  })),
);
const SkillsManager = lazy(() =>
  import("./features/job-hub/SkillsManager").then((module) => ({
    default: module.SkillsManager,
  })),
);
const TodoList = lazy(() =>
  import("./features/todo/TodoList").then((module) => ({
    default: module.TodoList,
  })),
);
const Scheduler = lazy(() =>
  import("./features/schedule/Scheduler").then((module) => ({
    default: module.Scheduler,
  })),
);
const MoneyManager = lazy(() =>
  import("./features/money-manager").then((module) => ({
    default: module.MoneyManager,
  })),
);
const HabitTracker = lazy(() =>
  import("./features/habits/HabitTracker").then((module) => ({
    default: module.HabitTracker,
  })),
);
const JobHub = lazy(() =>
  import("./features/job-hub/JobHub").then((module) => ({
    default: module.JobHub,
  })),
);
const Marketplace = lazy(() =>
  import("./features/marketplace/Marketplace").then((module) => ({
    default: module.Marketplace,
  })),
);
const GPACalculator = lazy(() =>
  import("./features/gpa-calculator/GpaCalculator").then((module) => ({
    default: module.GpaCalculator,
  })),
);
const FocusTimer = lazy(() =>
  import("./features/focus-timer/FocusTimer").then((module) => ({
    default: module.FocusTimer,
  })),
);
const SettingsPage = lazy(() => import("./features/settings/SettingsPage"));

const navigation = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/todo", name: "Todo List", icon: CheckSquare },
  { path: "/schedule", name: "Schedule", icon: Calendar },
  { path: "/money", name: "Money Manager", icon: Wallet },
  { path: "/habits", name: "Habits", icon: TrendingUp },
  { path: "/jobs", name: "Job Hub", icon: Briefcase },
  { path: "/marketplace", name: "Marketplace", icon: ShoppingBag },
  { path: "/gpa", name: "GPA Calculator", icon: Calculator },
  { path: "/timer", name: "Focus Timer", icon: Timer },
];

function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ThemeToggle variant="floating" className="fixed right-6 top-6 z-50" />
      {children}
    </main>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [logoHovering, setLogoHovering] = useState(false);
  const [featureHovering, setFeatureHovering] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navClass = (isActive: boolean) =>
    cn(
      "inline-flex h-9 w-full items-center rounded-xl text-sm font-medium transition-all duration-200",
      desktopSidebarCollapsed
        ? "justify-center px-0"
        : "justify-start gap-3 px-3",
      isActive
        ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/20 shadow-sm"
        : "text-foreground hover:bg-muted/80 hover:translate-x-0.5",
    );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_5%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.08),transparent_35%)] bg-background">
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
                    aria-label={
                      desktopSidebarCollapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                    }
                    title={
                      desktopSidebarCollapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                    }
                  >
                    {logoHovering ||
                    (!desktopSidebarCollapsed && featureHovering) ? (
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
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.name}
                    end={item.path === "/jobs"}
                    className={({ isActive }) => navClass(isActive)}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            "size-5",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(desktopSidebarCollapsed && "lg:hidden")}
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
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

              <NavLink
                to="/recruiter/register"
                title="Recruiter Portal"
                className={() =>
                  navClass(location.pathname === "/recruiter/register")
                }
                onClick={() => setSidebarOpen(false)}
              >
                <UserRoundCheck
                  className={cn(
                    "size-5",
                    location.pathname === "/recruiter/register"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>
                  Recruiter Portal
                </span>
              </NavLink>

              <NavLink
                to="/seller/register"
                title="Seller Portal"
                className={() =>
                  navClass(location.pathname.startsWith("/seller"))
                }
                onClick={() => setSidebarOpen(false)}
              >
                <ShoppingBag
                  className={cn(
                    "size-5",
                    location.pathname.startsWith("/seller")
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>
                  Seller Portal
                </span>
              </NavLink>
            </nav>

            <div className="space-y-1 border-t border-border/70 bg-background/80 p-4">
              <NavLink
                to="/settings"
                title="Settings"
                className={({ isActive }) => navClass(isActive)}
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <Settings
                      className={cn(
                        "size-5",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(desktopSidebarCollapsed && "lg:hidden")}
                    >
                      Settings
                    </span>
                  </>
                )}
              </NavLink>
              <button
                type="button"
                title="Logout"
                className={navClass(false)}
                onClick={() => {
                  setSidebarOpen(false);
                  void logout();
                }}
              >
                <LogOut className="size-5 text-muted-foreground" />
                <span className={cn(desktopSidebarCollapsed && "lg:hidden")}>
                  Logout
                </span>
              </button>
              <div
                className={cn(
                  "flex items-center pt-1",
                  desktopSidebarCollapsed
                    ? "justify-center"
                    : "justify-between px-3",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-medium text-muted-foreground",
                    desktopSidebarCollapsed && "lg:hidden",
                  )}
                >
                  Theme
                </span>
                <ThemeToggle />
              </div>
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
              <GpaCalculatorProvider>
                <Outlet />
              </GpaCalculatorProvider>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function RootFallback() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

function RouteFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
      Loading...
    </div>
  );
}

function WithMoneyManagerProvider({ children }: { children: ReactNode }) {
  return <MoneyManagerProvider>{children}</MoneyManagerProvider>;
}

export default function App() {
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(savedTheme);
    };

    applyTheme();
    window.addEventListener("theme-update", applyTheme);
    window.addEventListener("storage", applyTheme);
    return () => {
      window.removeEventListener("theme-update", applyTheme);
      window.removeEventListener("storage", applyTheme);
    };
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <EntryLayout>
              <Landing />
            </EntryLayout>
          }
        />
        <Route
          path="/signin"
          element={
            <EntryLayout>
              <SignIn />
            </EntryLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <EntryLayout>
              <SignUpChoice />
            </EntryLayout>
          }
        />
        <Route
          path="/signup/student"
          element={
            <EntryLayout>
              <StudentAuthChoice />
            </EntryLayout>
          }
        />
        <Route
          path="/signup/student/register"
          element={
            <EntryLayout>
              <StudentRegistration />
            </EntryLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <EntryLayout>
              <PasswordResetUnavailable />
            </EntryLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <EntryLayout>
              <PasswordResetUnavailable />
            </EntryLayout>
          }
        />
        <Route
          path="/recruiter/register"
          element={
            <EntryLayout>
              <JobRegistration />
            </EntryLayout>
          }
        />
        <Route
          path="/seller/register"
          element={
            <EntryLayout>
              <SellerRegister />
            </EntryLayout>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <RequireAuth>
              <EntryLayout>
                <SellerDashboard />
              </EntryLayout>
            </RequireAuth>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            path="/dashboard"
            element={
              <WithMoneyManagerProvider>
                <WidgetDashboard />
              </WithMoneyManagerProvider>
            }
          />
          <Route path="/todo" element={<TodoList />} />
          <Route path="/schedule" element={<Scheduler />} />
          <Route
            path="/money"
            element={
              <WithMoneyManagerProvider>
                <MoneyManager />
              </WithMoneyManagerProvider>
            }
          />
          <Route path="/habits" element={<HabitTracker />} />
          <Route path="/jobs" element={<JobHub />} />
          <Route path="/jobs/skills" element={<SkillsManager />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/gpa" element={<GPACalculator />} />
          <Route path="/timer" element={<FocusTimer />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<RootFallback />} />
      </Routes>
    </Suspense>
  );
}
