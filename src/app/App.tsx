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
      case "student-register":
        return <StudentRegistration onNavigate={setActiveSection} />;
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

  // ✅ Entry forms should not show header/sidebar
  const isEntryFlow =
    activeSection === "landing" ||
    activeSection === "signup" ||
    activeSection === "signin" ||
    activeSection === "student-register";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {isEntryFlow ? (
        // Show only the form
        <main className="flex-1 min-w-0">{renderContent()}</main>
      ) : (
        // Show full layout with header + sidebar
        <>
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* header content here */}
          </header>

          <div className="container mx-auto px-4 py-6">
            <div className="flex gap-6">
              {/* Sidebar */}
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
                </nav>
              </aside>

              {/* Mobile Overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Main Content */}
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
