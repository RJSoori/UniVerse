import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Mail,
  Sparkles,
  CheckCircle,
  Send,
  Flag,
  Loader2,
} from "lucide-react";

interface JobDetailsProps {
  job: any;
  onBack: () => void;
  onReport?: (job: any) => void;
  studentEmail?: string;
}

export function JobDetails({
  job,
  onBack,
  onReport,
  studentEmail,
}: JobDetailsProps) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: studentEmail || "",
    studentPhone: "",
    resumeUrl: "",
    coverLetter: "",
  });

  const handleApply = async () => {
    if (!formData.studentName || !formData.studentEmail) {
      alert("Please fill in your name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8080/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          studentPhone: formData.studentPhone,
          resumeUrl: formData.resumeUrl,
          coverLetter: formData.coverLetter,
        }),
      });

      if (response.ok) {
        setApplicationStatus("success");
      } else {
        throw new Error("Application failed");
      }
    } catch (error) {
      console.error("Application error:", error);
      setApplicationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === "success") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6 hover:bg-primary/5"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Opportunities
        </Button>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-12 text-center">
            <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black tracking-tight">
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mt-2">
              Your application for {job.title} has been sent to the recruiter.
            </p>
            <Button onClick={onBack} className="mt-6">
              Back to Job Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showApplyForm) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowApplyForm(false)}
          className="mb-6 hover:bg-primary/5"
        >
          <ArrowLeft className="mr-2 size-4" /> Back to Job Details
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Apply for {job.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="Your full name"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="your.email@uni.ac.lk"
                  value={formData.studentEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, studentEmail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="+94 71 234 5678"
                value={formData.studentPhone}
                onChange={(e) =>
                  setFormData({ ...formData, studentPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Resume URL (LinkedIn/Google Drive)
              </label>
              <Input
                placeholder="https://..."
                value={formData.resumeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, resumeUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Letter</label>
              <Textarea
                placeholder="Brief introduction and why you're interested..."
                className="min-h-[120px]"
                value={formData.coverLetter}
                onChange={(e) =>
                  setFormData({ ...formData, coverLetter: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowApplyForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        {/* Main Content */}
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
        </div>

        {/* Sidebar Actions */}
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
                <p className="text-4xl font-black text-primary">85%</p>
                <p className="text-[10px] text-primary/70 mt-1 font-medium">
                  Strong Candidate
                </p>
              </div>

              <Button
                onClick={handleEmailCV}
                className="w-full h-12 bg-primary shadow-lg shadow-primary/20 font-bold"
              >
                <Mail className="mr-2 size-4" /> Email CV to Company
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 border-primary/20 text-primary font-bold"
              >
                <Send className="mr-2 size-4" /> Submit via UniVerse
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
