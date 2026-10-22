import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Badge } from "../../shared/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import {
    ArrowLeft,
    Briefcase,
    Coins,
    Globe2,
    ClipboardCheck,
    SendHorizontal,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface JobPostingProps {
    onBack: () => void;
    onPost: (job: any) => void;
    onUpdate: (id: string, job: any) => void;
    onDelete: (id: string) => void;
    recruiterEmail: string;
    /** When set, the form opens pre-filled for this job and submits an update instead of a new post. */
    editingJob?: any | null;
}

// salaryInfo is stored as a single combined string (e.g. "50000 LKR / monthly") - this is the
// inverse of how it's built below, used to pre-fill the Compensation section when editing.
function parseSalaryInfo(salaryInfo: string | undefined): { salary: string; salaryType: string } {
    if (!salaryInfo) return { salary: "", salaryType: "monthly" };
    const match = salaryInfo.match(/^(.*?)\s*LKR\s*\/\s*(\w+)\s*$/i);
    if (match) {
        return { salary: match[1].trim(), salaryType: match[2].trim() };
    }
    return { salary: salaryInfo, salaryType: "monthly" };
}

// skills is stored as a comma-separated string - the inverse of skills.join(", ") below, used
// to pre-fill the skill chips when editing.
function parseSkillsString(skillsString: string | undefined): string[] {
    if (!skillsString) return [];
    return skillsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

export function JobPosting({ onBack, onPost, onUpdate, onDelete, recruiterEmail, editingJob }: JobPostingProps) {
    const isEditing = Boolean(editingJob);
    const initialSalary = parseSalaryInfo(editingJob?.salaryInfo);

    const [salaryType, setSalaryType] = useState(initialSalary.salaryType);
    const [formData, setFormData] = useState({
        title: editingJob?.title ?? "",
        description: editingJob?.description ?? "",
        requirements: editingJob?.requirements ?? "",
        salary: initialSalary.salary,
        workType: editingJob?.workType ?? "on-site",
        employmentType: editingJob?.employmentType ?? "full-time"
    });

    // Skills are added one at a time (same pattern as the student-side "Add Skills" manual
    // entry) rather than typed as one freeform blob - keeps the data recruiters submit in the
    // same clean, comma-separated shape the skill matcher already expects.
    const [skills, setSkills] = useState<string[]>(() => parseSkillsString(editingJob?.skills));
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = newSkill.trim();
        if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
            setSkills([...skills, trimmed]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((s) => s !== skillToRemove));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.description) {
            toast.error("Please fill in the essential job details.");
            return;
        }

        const jobPayload = {
            ...formData,
            skills: skills.join(", "),
            salaryInfo: `${formData.salary} LKR / ${salaryType}`,
        };

        if (isEditing) {
            onUpdate(editingJob.id, jobPayload);
        } else {
            onPost({
                ...jobPayload,
                id: Date.now().toString(),
                postedBy: recruiterEmail,
                postedAt: new Date().toLocaleDateString(),
            });
        }
    };

    const handleDeleteClick = () => {
        if (!editingJob) return;
        if (confirm("Are you sure you want to delete this posting? It will be removed from your dashboard and from students' view.")) {
            onDelete(editingJob.id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 hover:bg-primary/5">
                <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">
                        {isEditing ? "Edit Opportunity" : "Create Opportunity"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEditing
                            ? "Update the details of this position."
                            : "Draft a new position for the undergraduate community."}
                    </p>
                </div>
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Briefcase className="text-primary size-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Section 1: Core Details */}
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardCheck className="size-5 text-primary" /> Core Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input
                                placeholder="e.g. Associate Software Engineer, Marketing Intern"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Job Description</Label>
                            <Textarea
                                placeholder="Describe the role and day-to-day responsibilities..."
                                className="min-h-[120px] resize-none border border-border/70 bg-muted/20 rounded-xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 transition-colors"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Requirements & Skills */}
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" /> Requirements & Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Qualifications</Label>
                            <Textarea
                                placeholder="Education, certifications, or experience..."
                                className="min-h-[100px] resize-none border border-border/70 bg-muted/20 rounded-xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 transition-colors"
                                value={formData.requirements}
                                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Technical/Soft Skills</Label>
                            <form onSubmit={handleAddSkill} className="flex gap-2">
                                <Input
                                    placeholder="e.g. React, Python, Project Management..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" variant="outline">Add</Button>
                            </form>
                            <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-xl min-h-[100px] border border-border/70">
                                {skills.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No skills added yet.</p>
                                ) : (
                                    skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1 bg-background border shadow-sm"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Compensation & Environment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Coins className="size-5 text-primary" /> Compensation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <RadioGroup
                                value={salaryType}
                                onValueChange={setSalaryType}
                                className="flex gap-4 p-2 bg-muted/50 rounded-lg w-fit"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="hourly" id="hourly" />
                                    <Label htmlFor="hourly" className="cursor-pointer">Hourly Rate</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="monthly" id="monthly" />
                                    <Label htmlFor="monthly" className="cursor-pointer">Monthly Salary</Label>
                                </div>
                            </RadioGroup>
                            <div className="space-y-2">
                                <Label>Amount (LKR)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 50000"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe2 className="size-5 text-primary" /> Work Environment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Work Type</Label>
                                    <Select
                                        value={formData.workType}
                                        onValueChange={(val) => setFormData({...formData, workType: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="On-site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="on-site">On-site</SelectItem>
                                            <SelectItem value="remote">Remote</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Employment</Label>
                                    <Select
                                        value={formData.employmentType}
                                        onValueChange={(val) => setFormData({...formData, employmentType: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Full-time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    {isEditing && (
                        <Button
                            variant="ghost"
                            className="mr-auto text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="mr-2 size-4" /> Delete Posting
                        </Button>
                    )}
                    <Button variant="outline" onClick={onBack}>{isEditing ? "Cancel" : "Save Draft"}</Button>
                    <Button className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleSubmit}>
                        {isEditing ? "Save Changes" : "Publish Opportunity"} <SendHorizontal className="ml-2 size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
