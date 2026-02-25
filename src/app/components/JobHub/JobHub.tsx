import { useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Label } from "../ui/label.tsx";
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
  CheckCircle
} from "lucide-react";

interface JobEntry {
  id: string;
  company: string;
  position: string;
  status: "current" | "applied" | "interviewing" | "offered" | "rejected";
  notes: string;
  field: string;
  matchScore?: number;
}

interface JobHubProps {
  onNavigate?: (section: string) => void;
}

export function JobHub({ onNavigate }: JobHubProps) {
  const [jobs, setJobs] = useUniStorage<JobEntry[]>("university-jobs", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState<Omit<JobEntry, "id">>({
    company: "",
    position: "",
    status: "applied",
    notes: "",
    field: ""
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const addJob = () => {
    if (!newJob.company || !newJob.position) return;
    const entry: JobEntry = {
      id: Date.now().toString(),
      ...newJob,
      matchScore: Math.floor(Math.random() * 20) + 75
    };
    setJobs([entry, ...jobs]);
    setNewJob({ company: "", position: "", status: "applied", notes: "", field: "" });
    setShowAddForm(false);
  };

  return (
      <div className="space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Hub</h2>
            <p className="text-muted-foreground text-sm">Career tracking and opportunity management for all undergraduates</p>
          </div>
          <Button onClick={() => onNavigate?.("jobposter-register")}>
            <Plus className="mr-2 h-4 w-4" /> Add Opportunity
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-3 rounded-xl border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search opportunities..."
                className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
              variant={filterActive ? "default" : "outline"}
              className="sm:w-fit"
              onClick={() => setFilterActive(!filterActive)}
          >
            <Filter className="mr-2 h-3 w-3" />
            Advanced Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-sm min-h-[120px]">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Degree Alignment Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground flex items-center justify-center">
              <p className="italic">Analysis data will appear here based on your profile.</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/10 shadow-sm min-h-[120px]">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Market Popularity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <p className="text-[10px] text-muted-foreground italic">Market trends loading...</p>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader><CardTitle className="text-lg text-primary">New Job Opportunity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Organization Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Field / Industry</Label>
                    <Input value={newJob.field} onChange={(e) => setNewJob({...newJob, field: e.target.value})} placeholder="e.g. Engineering, Finance" />
                  </div>
                </div>
                <Button onClick={addJob} className="w-full">Save Career Opportunity</Button>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                No opportunities tracked yet.
              </div>
          ) : (
              filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:border-primary/40 transition-all border-border/60">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg relative">
                          <Briefcase className="h-6 w-6 text-primary" />
                          <div className="absolute -top-2 -right-2 bg-primary text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                            {job.matchScore}%
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{job.position}</h4>
                            <Badge className="bg-primary/20 text-primary border-none text-[10px]">{job.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-muted-foreground text-sm font-medium">{job.company}</p>
                            <Badge variant="outline" className="text-[9px] border-border">{job.field || "General"}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                          <ExternalLink className="mr-2 h-3 w-3" /> Requirements
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 text-destructive" onClick={() => setJobs(jobs.filter(j => j.id !== job.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}