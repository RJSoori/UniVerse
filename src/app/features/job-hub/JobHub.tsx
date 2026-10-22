import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, parseApiError } from "../../shared/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { JobDetails } from "./JobDetails";
import { SkillMatcherDialog } from "./SkillMatcherDialog";
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
  X,
} from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Inappropriate job description",
  "Spam or scam",
  "Misleading company info",
  "Duplicate posting",
  "Other",
];

/** A job counts as a "match" for the Skill Matcher summary/dialog at this score or above -
 * kept in sync with SkillMatchService.SUITABLE_THRESHOLD on the backend. */
const MATCH_THRESHOLD = 80;

export function JobHub() {
  //Hooks (fetch data from APIs, navigate between pages)

  const navigate = useNavigate();

  // ===== SHARED JOB BOARD STATE =====
  // Job listings are shared across all students - everyone sees the same opportunities
  // This ensures consistency and prevents fragmentation of the job market
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ===== UNIVERSE SKILL MATCHER =====
  // Real per-job match percentages (keyed by job id) plus the student's own skill count,
  // fetched separately from the job list so match badges progressively enhance rather than
  // block the page. mySkillsCount stays null until loaded, to distinguish "still loading"
  // from "loaded and the student genuinely has 0 skills."
  const [matchScores, setMatchScores] = useState<Record<number, number>>({});
  const [mySkillsCount, setMySkillsCount] = useState<number | null>(null);
  const [skillMatcherOpen, setSkillMatcherOpen] = useState(false);

  // ===== MARKET TREND =====
  // Real top-3 highest-demand job titles (by posting volume) over the trailing 3 months -
  // null while loading, [] once loaded with nothing to show yet.
  const [marketTrend, setMarketTrend] = useState<
    { title: string; postingCount: number }[] | null
  >(null);

  // ===== SEARCH & FILTER CONTROLS =====
  // Real-time filtering and search functionality for job discovery
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "full-time" | "part-time"
  >("all");
  // Work-type filter (On Site / Remote / Hybrid)
  const [workFilter, setWorkFilter] = useState<
    "all" | "On Site" | "Remote" | "Hybrid"
  >("all");

  // ===== NAVIGATION STATE =====
  // Controls which job is currently being viewed in detail
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // ===== REPORTING MODAL STATE =====
  // Handles the job reporting workflow for inappropriate content
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedJobForReport, setSelectedJobForReport] = useState<any | null>(
    null,
  );
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReport = async () => {
    if (!selectedJobForReport || !reportReason || isSubmittingReport) return;
    setIsSubmittingReport(true);
    try {
      const response = await apiFetch(
        `/api/jobs/${selectedJobForReport.id}/report`,
        {
          method: "POST",
          body: JSON.stringify({ reason: reportReason }),
        },
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      // The posting is now under investigation and hidden from browsing - drop it from the
      // visible list, and if we were reading its details, return to the list view.
      setJobs((prev) => prev.filter((job) => job.id !== selectedJobForReport.id));
      if (selectedJob?.id === selectedJobForReport.id) {
        setSelectedJob(null);
      }
      setShowReportModal(false);
      setSelectedJobForReport(null);
      setReportReason("");
      toast.success(
        data?.message ||
          "Report submitted. Thank you for helping keep UniVerse safe!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit report. Please try again.",
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ===== INITIAL DATA LOADING =====
  // Fetch all available job postings when component mounts
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch("/api/jobs/all");
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }
        const data = await response.json();
        // Normalize job data with fallback company names for display
        setJobs(
          data.map((job: any) => ({
            ...job,
            company:
              job.company ||
              job.recruiter?.companyName ||
              job.recruiter?.contactPerson ||
              "Verified Recruiter",
          })),
        );
      } catch (error) {
        console.error("Job list fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();

    const handleJobDeleted = (event: Event) => {
      const jobId = (event as CustomEvent).detail?.jobId;
      if (!jobId) return;
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    };

    window.addEventListener("universe-job-deleted", handleJobDeleted);
    return () => {
      window.removeEventListener("universe-job-deleted", handleJobDeleted);
    };
  }, []);

  // ===== SKILL MATCHER DATA =====
  // Decoupled from the job list load above - this is a progressive enhancement (match
  // badges/top card), not something the page should block on or fail loudly over.
  useEffect(() => {
    const loadSkillMatchData = async () => {
      try {
        const [scoresResponse, skillsResponse] = await Promise.all([
          apiFetch("/api/skills/match-scores"),
          apiFetch("/api/skills"),
        ]);

        if (scoresResponse.ok) {
          const scores: { jobId: number; matchPercentage: number }[] =
            await scoresResponse.json();
          setMatchScores(
            Object.fromEntries(scores.map((s) => [s.jobId, s.matchPercentage])),
          );
        }

        if (skillsResponse.ok) {
          const data = await skillsResponse.json();
          setMySkillsCount((data.skills ?? []).length);
        }
      } catch (error) {
        console.error("Skill matcher data fetch failed:", error);
      }
    };

    loadSkillMatchData();
  }, []);

  // ===== MARKET TREND DATA =====
  // Decoupled from the job list load too - a progressive enhancement, not something the page
  // should block on or fail loudly over.
  useEffect(() => {
    const loadMarketTrend = async () => {
      try {
        const response = await apiFetch("/api/jobs/market-trend");
        if (!response.ok) {
          throw new Error(`Failed to fetch market trend: ${response.status}`);
        }
        const data = await response.json();
        setMarketTrend(data);
      } catch (error) {
        console.error("Market trend fetch failed:", error);
        setMarketTrend([]);
      }
    };

    loadMarketTrend();
  }, []);

  // ===== REPORT MODAL =====
  // Shared between the list view and the detail view - the Report button exists in both,
  // so the modal needs to render regardless of which one is currently showing.
  const reportModal = showReportModal && selectedJobForReport && (
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
            disabled={!reportReason || isSubmittingReport}
          >
            {isSubmittingReport ? "Submitting..." : "Submit Report"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowReportModal(false)}
            disabled={isSubmittingReport}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  // ===== VIEW ROUTING =====
  // Switch between job list view and detailed job view
  if (selectedJob) {
    return (
      <>
        <JobDetails
          job={selectedJob}
          matchPercentage={matchScores[selectedJob.id]}
          onBack={() => setSelectedJob(null)}
          onReport={(job) => {
            setSelectedJobForReport(job);
            setShowReportModal(true);
          }}
        />
        {reportModal}
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="app-page pb-20">
        <div className="py-24 text-center text-muted-foreground">
          Loading job opportunities...
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job.title + " " + (job.company || ""))
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const normalize = (s?: string) =>
      (s || "").toLowerCase().replace(/[-\s]/g, "");
    const matchesEmployment =
      filterType === "all" ||
      normalize(job.employmentType) === normalize(filterType);
    const matchesWork =
      workFilter === "all" || normalize(job.workType) === normalize(workFilter);
    return matchesSearch && matchesEmployment && matchesWork;
  });

  // Best-matching role for the top "UniVerse Skill Matcher" card: the first job (in list
  // order) hitting the highest known score - deterministic, no need to break ties explicitly.
  let bestMatch: { job: any; percentage: number } | null = null;
  for (const job of jobs) {
    const percentage = matchScores[job.id];
    if (percentage === undefined) continue;
    if (!bestMatch || percentage > bestMatch.percentage) {
      bestMatch = { job, percentage };
    }
  }

  // How many currently-visible postings the student could actually apply to right now (>= 80%
  // match) - the full, clickable list lives in SkillMatcherDialog; this just drives the summary.
  const matchingJobsCount = jobs.filter(
    (job) => (matchScores[job.id] ?? 0) >= MATCH_THRESHOLD,
  ).length;

  return (
    <div className="app-page pb-20">
      <div className="app-page-header">
        <div className="space-y-1">
          <h2 className="app-page-title">Job Hub</h2>
          <p className="app-page-subtitle">
            Verified opportunities from the UniVerse network.
          </p>
        </div>
        <div className="app-page-actions gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/jobs/skills")}
            className="border-primary/20 hover:bg-primary/5 font-bold"
          >
            <Wand2 className="mr-2 h-4 w-4 text-primary" /> Add Skills
          </Button>
          <Button
            onClick={() => navigate("/recruiter/register")}
            className="shadow-lg shadow-primary/20 font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> Recruiter Portal
          </Button>
        </div>
      </div>

      {/* --- Search bar --- */}
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

        {/* --- Filters --- */}
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
        <div className="flex bg-background rounded-xl p-1 border shadow-sm">
          {(["all", "On Site", "Remote", "Hybrid"] as const).map((type) => (
            <Button
              key={type}
              variant={workFilter === type ? "default" : "ghost"}
              size="sm"
              className="capitalize px-4 h-8 text-[11px] font-black"
              onClick={() => setWorkFilter(type)}
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
              <CardTitle className="text-lg font-black tracking-widest">
                UniVerse Skill Matcher
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-muted-foreground">
            {mySkillsCount === null ? (
              "Crunching your skill match..."
            ) : mySkillsCount === 0 ? (
              <>
                Add your skills to see how well you match open roles.{" "}
                <button
                  type="button"
                  onClick={() => navigate("/jobs/skills")}
                  className="text-primary cursor-pointer hover:underline font-semibold"
                >
                  Add skills →
                </button>
              </>
            ) : matchingJobsCount > 0 ? (
              <div className="space-y-2.5">
                <p>
                  You're an{" "}
                  <span className="text-primary font-black">80%+</span>{" "}
                  match for{" "}
                  <strong className="text-foreground">
                    {matchingJobsCount} open role{matchingJobsCount === 1 ? "" : "s"}
                  </strong>
                  {bestMatch && (
                    <>
                      {" "}
                      - best fit:{" "}
                      <strong className="text-foreground">{bestMatch.job.title}</strong> (
                      {bestMatch.percentage}%)
                    </>
                  )}
                  .
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSkillMatcherOpen(true)}
                  className="border-primary/30 text-primary hover:bg-primary/10 font-bold"
                >
                  View matches & suggested skills →
                </Button>
              </div>
            ) : (
              <>
                No roles match your skills at 80%+ yet.
                <button
                  type="button"
                  onClick={() => setSkillMatcherOpen(true)}
                  className="text-primary ml-1 cursor-pointer hover:underline font-semibold"
                >
                  See what skills could help →
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/10 shadow-none">
          <CardHeader className="py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-black tracking-widest">
                Market Trend
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-[11px] font-semibold text-muted-foreground">
            {marketTrend === null ? (
              "Analyzing recent postings..."
            ) : marketTrend.length === 0 ? (
              "Not enough posting activity yet to spot a trend."
            ) : (
              <div className="space-y-2">
                <p className="font-medium normal-case text-muted-foreground/80">
                  Most in-demand roles, past 3 months:
                </p>
                <ol className="space-y-1.5">
                  {marketTrend.map((entry, index) => (
                    <li
                      key={entry.title}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="flex items-center justify-center size-4 rounded-full bg-primary/10 text-primary text-[9px] font-black shrink-0">
                          {index + 1}
                        </span>
                        {entry.title}
                      </span>
                      <span className="text-primary font-black whitespace-nowrap">
                        {entry.postingCount} posting{entry.postingCount === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Jobs List --- */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed rounded-[3rem] flex flex-col items-center bg-muted/5">
            <Briefcase className="size-16 mb-4 opacity-10" />
            <p className="font-black text-xl uppercase tracking-tight">
              No opportunities found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="group hover:border-primary/40 transition-all border-border/60 overflow-hidden shadow-sm hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors relative">
                      <Briefcase className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      {/* Match Score Badge - only shown once a real score is known */}
                      {matchScores[job.id] !== undefined && (
                        <div className="absolute -top-2 -right-2 bg-primary text-[9px] text-white px-2 py-0.5 rounded-full font-black shadow-lg">
                          {matchScores[job.id]}%
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-xl tracking-tight uppercase">
                        {job.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground font-medium">
                        <p className="text-sm font-bold text-foreground">
                          {job.company || "Verified Recruiter"}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="size-3.5 text-primary/60" />{" "}
                          {job.workType}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] capitalize">
                          <CalendarDays className="size-3.5 text-primary/60" />{" "}
                          {job.employmentType || "Full-time"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="size-3.5 text-primary/60" />{" "}
                          {job.postedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setSelectedJob(job)}
                      className="h-12 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-black uppercase text-xs tracking-widest"
                    >
                      Apply Now
                    </Button>{" "}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelectedJobForReport(job);
                        setShowReportModal(true);
                      }}
                    >
                      <Flag className="mr-2 h-4 w-4" /> Report
                    </Button>{" "}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SkillMatcherDialog
        open={skillMatcherOpen}
        onOpenChange={setSkillMatcherOpen}
        jobs={jobs}
        matchScores={matchScores}
        onSelectJob={setSelectedJob}
      />
      {reportModal}
    </div>
  );
}
