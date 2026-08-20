import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { Switch } from "../../shared/ui/switch";
import {
  Plus,
  Briefcase,
  Clock,
  Eye,
  EyeOff,
  Pencil,
  LogOut,
  RefreshCw,
  Settings,
  UserRoundCheck,
} from "lucide-react";

interface RecruiterDashboardProps {
  type: "company" | "individual" | null;
  status?: string;
  accessKey: string;
  jobs: any[];
  onPostNew: () => void;
  onEditJob: (job: any) => void;
  onSignOut: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onOpenSettings: () => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  VERIFIED: { label: "Verified", className: "bg-primary/5" },
  RE_VERIFICATION: { label: "Re-verification Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  PENDING: { label: "Pending Verification", className: "bg-amber-100 text-amber-700 border-amber-200" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
};

export function RecruiterDashboard({
  type,
  status,
  accessKey,
  jobs,
  onPostNew,
  onEditJob,
  onSignOut,
  onToggleActive,
  onOpenSettings,
}: RecruiterDashboardProps) {
  // Jobs are already loaded for the current recruiter, so render them directly.
  const myJobs = jobs;
  const activeCount = myJobs.filter((j) => j.active ?? true).length;
  const inactiveCount = myJobs.length - activeCount;
  const badgeInfo = STATUS_BADGE[status ?? ""] ?? { label: status ?? "Unknown", className: "bg-muted" };
  const postingBlocked = status === "RE_VERIFICATION";

  return (
    <div className="min-h-screen bg-background p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <UserRoundCheck className="text-primary size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                Recruiter Hub
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-widest ${badgeInfo.className}`}
                >
                  {badgeInfo.label} · {type}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium italic">
                  {accessKey}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              className="flex-1 md:flex-none shadow-lg shadow-primary/20"
              onClick={onPostNew}
              disabled={postingBlocked}
              title={postingBlocked ? "Blocked until an admin re-verifies your account" : undefined}
            >
              <Plus className="mr-2 size-4" /> Create Posting
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="flex-1 md:flex-none"
            >
              <Settings className="mr-2 size-4" /> Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-destructive hover:bg-destructive/5"
            >
              <LogOut className="mr-2 size-4" /> Sign Out
            </Button>
          </div>
        </header>

        {postingBlocked && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-3 rounded-xl">
            <RefreshCw className="size-4 shrink-0" />
            Your account needs re-verification - new job postings are paused until an admin reviews your recent changes.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none bg-primary/5 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <Briefcase className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Posts
                </p>
                <p className="text-2xl font-bold">{myJobs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-green-50/50 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <Eye className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Active
                </p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-muted/40 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <EyeOff className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Inactive
                </p>
                <p className="text-2xl font-bold">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="size-5 text-primary" /> Recent Listings
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* ✅ Logic now checks the filtered list length */}
            {myJobs.length === 0 ? (
              <div className="py-24 bg-muted/20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground text-center px-4">
                <Briefcase className="size-16 mb-4 opacity-10" />
                <p className="font-semibold text-lg">Your dashboard is empty</p>
                <p className="text-sm max-w-xs">
                  Click "Create Posting" to attract university talent from
                  across the ecosystem.
                </p>
              </div>
            ) : (
              myJobs.map((job) => {
                const isActive = job.active ?? true;
                return (
                <Card
                  key={job.id}
                  className={`group hover:border-primary/40 transition-all border-border/60 shadow-sm bg-card/50 backdrop-blur-sm ${isActive ? "" : "opacity-60"}`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                      <div className="flex items-start gap-5">
                        <div className="size-14 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <Briefcase className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold tracking-tight">
                            {job.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-bold"
                            >
                              {job.workType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-primary/20"
                            >
                              {job.salaryInfo}
                            </Badge>
                            {!isActive && (
                              <Badge className="text-[10px] font-bold bg-muted text-muted-foreground border-none">
                                Hidden from students
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-2">
                              <Clock className="size-3" /> Posted {job.postedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-xl"
                          onClick={() => onEditJob(job)}
                        >
                          <Pencil className="mr-2 size-4" /> Edit Job
                        </Button>
                        <div className="flex items-center gap-2 pl-4 border-l border-border/60">
                          <span
                            className={`text-xs font-bold ${isActive ? "text-green-600" : "text-muted-foreground"}`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              onToggleActive(job.id, checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
