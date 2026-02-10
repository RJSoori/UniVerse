import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Briefcase, Plus, Trash2, ExternalLink } from "lucide-react";

interface JobEntry {
  id: string;
  company: string;
  position: string;
  status: "current" | "applied" | "interviewing" | "offered" | "rejected";
  deadline?: string;
  notes: string;
}

export function JobHub() {
  const [jobs, setJobs] = useUniStorage<JobEntry[]>("university-jobs", []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState<Omit<JobEntry, "id">>({
    company: "",
    position: "",
    status: "applied",
    notes: "",
  });

  const addJob = () => {
    if (!newJob.company || !newJob.position) return;
    const entry: JobEntry = {
      id: Date.now().toString(),
      ...newJob,
    };
    setJobs([entry, ...jobs]);
    setNewJob({ company: "", position: "", status: "applied", notes: "" });
    setShowAddForm(false);
  };

  const deleteJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current": return "bg-green-500";
      case "interviewing": return "bg-blue-500";
      case "offered": return "bg-purple-500";
      case "applied": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Hub</h2>
            <p className="text-muted-foreground">Manage your career and internships</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Opportunity
          </Button>
        </div>

        {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                        placeholder="e.g. Google, Dialog, LSEG"
                        value={newJob.company}
                        onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                        placeholder="e.g. Software Engineer Intern"
                        value={newJob.position}
                        onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                      className="w-full p-2 border rounded-md bg-background"
                      value={newJob.status}
                      onChange={(e) => setNewJob({...newJob, status: e.target.value as any})}
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="current">Current Role</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                      placeholder="Key responsibilities or interview dates..."
                      value={newJob.notes}
                      onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addJob} className="flex-1">Save Entry</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {jobs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No job entries yet.</CardContent></Card>
          ) : (
              jobs.map((job) => (
                  <Card key={job.id} className="hover:bg-accent/5 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{job.position}</h4>
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          </div>
                          <p className="text-muted-foreground">{job.company}</p>
                          {job.notes && <p className="text-sm mt-2 italic">"{job.notes}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" /> Details
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteJob(job.id)} className="text-destructive">
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