import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUniStorage } from "../../shared/hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Badge } from "../../shared/ui/badge";
import { JobDetails } from "./JobDetails";
import {
  Briefcase,
  Plus,
  TrendingUp,
  Sparkles,
  Search,
  MapPin,
  Clock,
  Wand2,
  CalendarDays,
  Filter,
  Flag,
  X
} from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Inappropriate job description",
  "Spam or scam",
  "Misleading company info",
  "Duplicate posting",
  "Other",
];

export function JobHub() {
  const navigate = useNavigate();
  // Shared with Recruiter Portal — every student needs to see the same job
  // board regardless of which student (if any) is logged in.
  const [jobs] = useUniStorage<any[]>("university-jobs", [], undefined, { shared: true });
  // Reports are per-student history (the user's own report submissions).
  const [reports, setReports] = useUniStorage<any[]>("university-reports", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "full-time" | "part-time">("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedJobForReport, setSelectedJobForReport] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    if (!selectedJobForReport || !reportReason) return;
    setReports([
      ...reports,
      {
        jobId: selectedJobForReport.id,
        reason: reportReason,
        reportedAt: new Date().toISOString(),
      },
    ]);
    setShowReportModal(false);
    setSelectedJobForReport(null);
    setReportReason("");
    toast.success("Report submitted. Thank you for helping keep UniVerse safe!");
  };

  // Toggle between List View and Detailed View
  if (selectedJob) {
    return (
      <>
        <JobDetails
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onReport={(job) => {
            setSelectedJobForReport(job);
            setShowReportModal(true);
          }}
        />

        {showReportModal && selectedJobForReport && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <div
              className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Report Job Listing</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Why are you reporting "{selectedJobForReport.title}"?
                  </p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      reportReason === reason
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleReport}
                  disabled={!reportReason}
                >
                  Submit Report
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job.title + " " + (job.company || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.employmentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
      <div className="app-page pb-20">
        <div className="app-page-header">
          <div className="space-y-1">
            <h2 className="app-page-title">Job Hub</h2>
            <p className="app-page-subtitle">Verified opportunities from the UniVerse network.</p>
          </div>
          <div className="app-page-actions gap-3">
            <Button
                variant="outline"
                onClick={() => navigate("/jobs/skills")}
                className="border-primary/20 hover:bg-primary/5 font-bold"
            >
              <Wand2 className="mr-2 h-4 w-4 text-primary" /> Add Skills
            </Button>
            <Button onClick={() => navigate("/recruiter/register")} className="shadow-lg shadow-primary/20 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Recruiter Portal
            </Button>
          </div>
        </div>

        {/* --- Filter & Search Bar --- */}
        <div className="flex flex-col md:flex-row gap-3 bg-muted/30 p-3 rounded-2xl border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by role or company..."
                className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-background rounded-xl p-1 border shadow-sm">
            {(["all", "full-time", "part-time"] as const).map((type) => (
                <Button
                    key={type}
                    variant={filterType === type ? "default" : "ghost"}
                    size="sm"
                    className="capitalize px-4 h-8 text-[11px] font-black"
                    onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
            ))}
          </div>
        </div>

        {/* --- AI & Market Trend Insights --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-none border-dashed border-2">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <CardTitle className="text-sm font-black tracking-widest">UniVerse Skill Matcher</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] font-semibold text-muted-foreground">
              Based on your IT & Management profile, you have a 92% affinity for Cloud and Analyst roles.
              <span className="text-primary ml-1 cursor-pointer hover:underline">View suggested skills →</span>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/10 shadow-none">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-black tracking-widest">Market Trend</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] font-semibold text-muted-foreground">
              Software engineering roles in Colombo have increased by 18% this month.
            </CardContent>
          </Card>
        </div>

        {/* --- Jobs List --- */}
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed rounded-[3rem] flex flex-col items-center bg-muted/5">
                <Briefcase className="size-16 mb-4 opacity-10" />
                <p className="font-black text-xl uppercase tracking-tight">No opportunities found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
          ) : (
              filteredJobs.map((job) => (
                  <Card key={job.id} className="group hover:border-primary/40 transition-all border-border/60 overflow-hidden shadow-sm hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                          <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors relative">
                            <Briefcase className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                            {/* Match Score Badge */}
                            <div className="absolute -top-2 -right-2 bg-primary text-[9px] text-white px-2 py-0.5 rounded-full font-black shadow-lg">
                              85%
                            </div>
                          </div>
                          <div>
                            <h4 className="font-black text-xl tracking-tight uppercase">{job.title}</h4>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground font-medium">
                              <p className="text-sm font-bold text-foreground">{job.company || "Verified Recruiter"}</p>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <MapPin className="size-3.5 text-primary/60" /> {job.workType}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] capitalize">
                                <CalendarDays className="size-3.5 text-primary/60" /> {job.employmentType || "Full-time"}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <Clock className="size-3.5 text-primary/60" /> {job.postedAt}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Badge className="bg-green-500/10 text-green-600 border-none text-[10px] font-black px-3 py-1">
                                {job.salaryInfo}
                              </Badge>
                              {job.skills && (
                                  <Badge variant="secondary" className="text-[10px] font-bold px-3 py-1">
                                    {job.skills.split(',')[0]}
                                  </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                              onClick={() => setSelectedJob(job)}
                              className="h-12 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-black uppercase text-xs tracking-widest"
                          >
                            Apply Now
                          </Button>                          <Button
                              variant="ghost"
                              size="sm"
                              className="h-12 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedJobForReport(job);
                                setShowReportModal(true);
                              }}
                          >
                            <Flag className="mr-2 h-4 w-4" /> Report
                          </Button>                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}
