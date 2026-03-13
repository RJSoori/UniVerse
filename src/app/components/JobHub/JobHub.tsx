import { useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Badge } from "../ui/badge.tsx";
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
  Filter
} from "lucide-react";

interface JobHubProps {
  onNavigate?: (section: string) => void;
}

export function JobHub({ onNavigate }: JobHubProps) {
  // Shared storage key with Recruiter Portal
  const [jobs] = useUniStorage<any[]>("university-jobs", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "full-time" | "part-time">("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Toggle between List View and Detailed View
  if (selectedJob) {
    return <JobDetails job={selectedJob} onBack={() => setSelectedJob(null)} />;
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job.title + " " + (job.company || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.employmentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-700">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Job Hub</h2>
            <p className="text-muted-foreground text-sm font-medium">Verified opportunities from the UniVerse network.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
                variant="outline"
                onClick={() => onNavigate?.("skills-manager")}
                className="border-primary/20 hover:bg-primary/5 font-bold"
            >
              <Wand2 className="mr-2 h-4 w-4 text-primary" /> Add Skills
            </Button>
            <Button onClick={() => onNavigate?.("jobposter-register")} className="shadow-lg shadow-primary/20 font-bold">
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
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}