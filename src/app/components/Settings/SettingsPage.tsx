import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Lock, X } from "lucide-react";

interface SettingsPageProps {
  onNavigate?: (id: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(storedUser.name || "");
  const [username, setUsername] = useState(storedUser.username || "");
  const [email, setEmail] = useState(storedUser.email || "");
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  
  // New States for Password Verification
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleSaveAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if sensitive fields (Name or Username) changed
    const hasSensitiveChanges = name !== storedUser.name || username !== storedUser.username;

    if (hasSensitiveChanges) {
      setIsVerifying(true);
    } else {
      performSave();
    }
  };

  const verifyAndSave = () => {
    // Check against the password stored in local storage
    if (passwordInput === storedUser.password) {
      performSave();
      setIsVerifying(false);
      setPasswordInput("");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const performSave = () => {
    const updatedUser = { ...storedUser, name, username, email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setMessage("Changes saved!");
    setTimeout(() => setMessage(""), 3000);
  };

  const changeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-4 relative">
      
      {/* Password Verification Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Lock className="size-4 text-blue-600" />
                <h3 className="font-bold text-sm">Verify Identity</h3>
              </div>
              <button onClick={() => setIsVerifying(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Please enter your password to confirm changes to your Name or Username.
            </p>

            <div className="space-y-2">
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && verifyAndSave()}
              />
              {error && <p className="text-[10px] font-bold text-destructive">{error}</p>}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsVerifying(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={verifyAndSave}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 px-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Settings</h1>
          {onNavigate && (
            <button 
              onClick={() => onNavigate("dashboard")}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Dashboard
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <form onSubmit={handleSaveAttempt}>
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Profile Section */}
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  Profile Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Theme Preference Section */}
              <section className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  Preferences
                </h2>
                <div className="flex items-center justify-between bg-muted p-3 rounded-xl">
                  <span className="text-sm font-semibold text-foreground">Appearance</span>
                  <div className="flex bg-card border border-border p-1 rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={() => changeTheme("light")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                        theme === "light" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => changeTheme("dark")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                        theme === "dark" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </section>

              {/* Action Area */}
              <div className="pt-2 flex items-center gap-4">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-blue-700 text-primary-foreground px-6 py-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </Button>
                {message && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                    ✓ {message}
                  </span>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;