import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../shared/ui/button";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user } = auth;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [degree, setDegree] = useState(user?.degree || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setDegree(user?.degree || "");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await auth.updateProfile({ name, email, degree });
      setMessage("Changes saved!");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-4 relative">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-end justify-between mb-4 px-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Settings</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Dashboard
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <form onSubmit={handleSave}>
            <div className="p-6 md:p-8 space-y-6">
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
                      className="w-full border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Username</label>
                    <input
                      type="text"
                      value={user?.username || ""}
                      readOnly
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-foreground ml-1">Degree</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full border border-input bg-input-background text-foreground dark:bg-input/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void auth.logout()}
                  className="px-6 py-5 rounded-xl font-bold text-sm"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
                {message && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                    {message}
                  </span>
                )}
                {error && <span className="text-xs font-bold text-destructive">{error}</span>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
