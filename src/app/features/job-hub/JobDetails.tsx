import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Mail,
  Sparkles,
  ListChecks,
  CheckCircle,
  Flag,
} from "lucide-react";

interface JobDetailsProps {
  job: any;
  matchPercentage?: number;
  onBack: () => void;
  onReport?: (job: any) => void;
}

export function JobDetails({ job, matchPercentage, onBack, onReport }: JobDetailsProps) {
  const skillList: string[] = (job.skills || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const handleEmailCV = () => {
    const recruiterEmail = job.recruiter?.email || "";
    const subject = encodeURIComponent(
      `Application for ${job.title} - UniVerse Portal`,
    );
    const body = encodeURIComponent(
      `Hello ${job.company || "Recruitment Team"},\n\nI am interested in the ${job.title} position posted on UniVerse. Please find my CV attached.\n\nBest regards.`,
    );
    window.location.href = `mailto:${recruiterEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6 hover:bg-primary/5"
      >
        <ArrowLeft className="mr-2 size-4" /> Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <header className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Briefcase className="text-primary size-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {job.title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                  {job.company || "Verified Recruiter"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="px-3 py-1 flex gap-1 items-center"
              >
                <MapPin className="size-3" /> {job.workType}
              </Badge>
              <Badge
                variant="secondary"
                className="px-3 py-1 flex gap-1 items-center capitalize"
              >
                <Clock className="size-3" /> {job.employmentType}
              </Badge>
              <Badge className="bg-green-500/10 text-green-600 border-none px-3 py-1">
                {job.salaryInfo}
              </Badge>
            </div>
          </header>

          <Card className="border-none bg-muted/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Key Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {job.requirements || "Refer to description for requirements."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="size-4 text-primary" /> Skills Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specific skills listed for this role.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 text-xs font-semibold"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-xl shadow-primary/5 sticky top-24">
            <CardHeader>
              <CardTitle className="text-center text-sm uppercase tracking-widest font-black">
                Application Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                <p className="text-xs text-muted-foreground font-bold mb-1">
                  UniVerse Match Score
                </p>
                {matchPercentage === undefined ? (
                  <>
                    <p className="text-2xl font-black text-muted-foreground">—</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                      Not enough data yet
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-black text-primary">{matchPercentage}%</p>
                    <p className="text-[10px] text-primary/70 mt-1 font-medium">
                      {matchPercentage >= 80
                        ? "Strong Candidate"
                        : matchPercentage >= 50
                          ? "Good Fit"
                          : "Skill Gap"}
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={handleEmailCV}
                className="w-full h-12 bg-primary shadow-lg shadow-primary/20 font-bold"
              >
                <Mail className="mr-2 size-4" /> Apply via Email
              </Button>

              <Button
                variant="ghost"
                className="w-full h-12 text-destructive border-destructive/20 hover:bg-destructive/10 font-bold"
                onClick={() => onReport?.(job)}
              >
                <Flag className="mr-2 size-4" /> Report Job
              </Button>

              <div className="pt-4 border-t flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                  <CheckCircle className="size-3 text-green-500" /> Verified
                  Recruiter
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                  <Clock className="size-3" /> Posted {job.postedAt}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
