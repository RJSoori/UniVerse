import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
  field: "IT" | "Management" | "Other";
  matchScore?: number;
}

export function JobHub() {
  const [jobs, setJobs] = useUniStorage<JobEntry[]>("university-jobs", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [itFilterOnly, setItFilterOnly] = useState(true); // Default ON to show "Analysis"
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState<Omit<JobEntry, "id">>({
    company: "",
    position: "",
    status: "applied",
    notes: "",
    field: "IT"
  });

  // Filtering Logic: Simulates the "Analysis" part
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position.toLowerCase().includes(searchTerm.toLowerCase());

    // If itFilterOnly is true, only show IT or Management roles (Logic requested by supervisor)
    const matchesField = itFilterOnly ? (job.field === "IT" || job.field === "Management") : true;

    return matchesSearch && matchesField;
  });

  const addJob = () => {
    if (!newJob.company || !newJob.position) return;
    const entry: JobEntry = {
      id: Date.now().toString(),
      ...newJob,
      matchScore: Math.floor(Math.random() * 15) + 82 // Mock match score analysis
    };
    setJobs([entry, ...jobs]);
    setNewJob({ company: "", position: "", status: "applied", notes: "", field: "IT" });
    setShowAddForm(false);
  };

  return (
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Hub</h2>
            <p className="text-muted-foreground text-sm">AI-Powered career tracking for IT & Management students</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Opportunity
          </Button>
        </div>

        {/* --- SEARCH & INTELLIGENT FILTER --- */}
        <div className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-3 rounded-xl border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by company or job title..."
                className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
              variant={itFilterOnly ? "default" : "outline"}
              className="sm:w-fit"
              onClick={() => setItFilterOnly(!itFilterOnly)}
          >
            <Filter className="mr-2 h-3 w-3" />
            {itFilterOnly ? "Major-Specific: IT/Mgmt" : "All Job Fields"}
          </Button>
        </div>

        {/* --- ANALYTICS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Degree Alignment Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-[11px] text-muted-foreground leading-relaxed">
              <p>System is currently prioritizing <span className="text-primary font-bold">Software Engineering</span> and <span className="text-primary font-bold">Business Analytics</span> roles based on your University of Moratuwa curriculum.</p>
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Non-relevant fields (e.g., Arts, Photography) are hidden.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/30 shadow-sm">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-semibold">Market Popularity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-[10px] border-b border-green-100 pb-1">
                <span className="font-medium text-green-800">QA Engineering</span>
                <span className="text-green-600 font-bold">+18% Peak</span>
              </div>
              <div className="flex justify-between text-[10px] border-b border-green-100 pb-1">
                <span className="font-medium text-green-800">Cloud Interns</span>
                <span className="text-green-600 font-bold">+12% High</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Form */}
        {showAddForm && (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader><CardTitle className="text-lg text-primary">New Job Opportunity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. WSO2, Axiata" />
                  </div>
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <select
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        value={newJob.field}
                        onChange={(e) => setNewJob({...newJob, field: e.target.value as any})}
                    >
                      <option value="IT">IT / Software</option>
                      <option value="Management">Management / BA</option>
                      <option value="Other">Other (Non-Major)</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addJob} className="w-full">Save Career Opportunity</Button>
              </CardContent>
            </Card>
        )}

        {/* Job List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                {itFilterOnly ? "No IT/Management jobs found. Toggle filter to see more." : "No jobs tracked yet."}
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
                            <Badge variant="outline" className="text-[9px] text-green-600 border-green-200">Field Match</Badge>
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