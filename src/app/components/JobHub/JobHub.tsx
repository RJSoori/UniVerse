import { useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Badge } from "../ui/badge.tsx";
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  MapPin,
  Clock,
  Wand2,
  CalendarDays
} from "lucide-react";

interface JobHubProps {
  onNavigate?: (section: string) => void;
}

export function JobHub({ onNavigate }: JobHubProps) {
  const [jobs] = useUniStorage<any[]>("university-jobs", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "full-time" | "part-time">("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job.title + " " + (job.company || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.employmentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
      <div className="space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Job Hub</h2>
            <p className="text-muted-foreground text-sm font-medium">Verified opportunities from the UniVerse network.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
                variant="outline"
                onClick={() => onNavigate?.("skills-manager")}
                className="border-primary/20 hover:bg-primary/5"
            >
              <Wand2 className="mr-2 h-4 w-4 text-primary" /> Add Skills
            </Button>
            <Button onClick={() => onNavigate?.("jobposter-register")} className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Post a Job
            </Button>
          </div>
        </div>

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
                    className="capitalize px-4 h-8 text-[11px] font-bold"
                    onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-none">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">UniVerse Skill Matcher</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] font-medium text-muted-foreground">
              Based on your IT & Management profile, you have a 92% affinity for Cloud and Analyst roles in your area.
            </CardContent>
          </Card>
          <Card className="border-border bg-muted/10 shadow-none">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Skill Market Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] font-medium text-muted-foreground"><p>
              React-----  +14% <br />
              Docker----   +8%
            </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground border-2 border-dashed rounded-[2rem] flex flex-col items-center">
                <Briefcase className="size-12 mb-4 opacity-10" />
                <p className="font-bold">No {filterType !== 'all' ? filterType : ''} roles found.</p>
                <p className="text-xs">Adjust your search or check back later.</p>
              </div>
          ) : (
              filteredJobs.map((job) => (
                  <Card key={job.id} className="group hover:border-primary/40 transition-all border-border/60 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                          <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors relative">
                            <Briefcase className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="absolute -top-2 -right-2 bg-primary text-[9px] text-white px-2 py-0.5 rounded-full font-black">
                              85%
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-xl tracking-tight">{job.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
                              <p className="text-sm font-bold text-foreground">{job.company || "Verified Partner"}</p>
                              <div className="flex items-center gap-1 text-[11px]">
                                <MapPin className="size-3" /> {job.workType}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] capitalize">
                                <CalendarDays className="size-3" /> {job.employmentType || "Full-time"}
                              </div>
                              <div className="flex items-center gap-1 text-[11px]">
                                <Clock className="size-3" /> {job.postedAt}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Badge className="bg-green-500/10 text-green-600 border-none text-[10px] font-bold">
                                {job.salaryInfo}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] font-medium">
                                {job.skills ? job.skills.split(',')[0] : "General"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl">
                            <ExternalLink className="mr-2 h-4 w-4" /> Requirements
                          </Button>
                          <Button className="h-10 px-6 rounded-xl bg-primary shadow-lg shadow-primary/20">
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