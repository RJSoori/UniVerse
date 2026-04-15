import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
    ArrowLeft,
    Briefcase,
    Coins,
    Globe2,
    ClipboardCheck,
    SendHorizontal,
    Sparkles,
} from "lucide-react";

interface JobPostingProps {
    onBack: () => void;
    onPost: (job: any) => void;
    recruiterEmail: string;
}

export function JobPosting({ onBack, onPost, recruiterEmail }: JobPostingProps) {
    const [salaryType, setSalaryType] = useState("monthly");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        salary: "",
        workType: "on-site",
        employmentType: "full-time"
    });

    const handleSubmit = () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the essential job details.");
            return;
        }

        onPost({
            ...formData,
            id: Date.now().toString(),
            postedBy: recruiterEmail,
            salaryInfo: `${formData.salary} LKR / ${salaryType}`,
            postedAt: new Date().toLocaleDateString()
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 hover:bg-primary/5">
                <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Create Opportunity</h2>
                    <p className="text-muted-foreground">Draft a new position for the undergraduate community.</p>
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
                            <Textarea
                                placeholder="e.g. React, Python, Project Management..."
                                className="min-h-[100px] resize-none border border-border/70 bg-muted/20 rounded-xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 transition-colors"
                                value={formData.skills}
                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                            />
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
                                defaultValue="monthly"
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
                                    <Select onValueChange={(val) => setFormData({...formData, workType: val})}>
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
                                    <Select onValueChange={(val) => setFormData({...formData, employmentType: val})}>
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
                    <Button variant="outline" onClick={onBack}>Save Draft</Button>
                    <Button className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleSubmit}>
                        Publish Opportunity <SendHorizontal className="ml-2 size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}