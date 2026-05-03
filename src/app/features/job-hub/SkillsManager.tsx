import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Badge } from "../../shared/ui/badge";
import {
    ArrowLeft,
    Upload,
    Plus,
    X,
    FileText,
    Sparkles,
    CheckCircle2,
    BrainCircuit,
    Wand2
} from "lucide-react";
import { useUniStorage } from "../../shared/hooks/useUniStorage";

export function SkillsManager() {
    const navigate = useNavigate();
    const [mySkills, setMySkills] = useUniStorage<string[]>("student-skills", ["React", "TypeScript", "Node.js"]);
    const [newSkill, setNewSkill] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleAddSkill = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newSkill && !mySkills.includes(newSkill)) {
            setMySkills([...mySkills, newSkill]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setMySkills(mySkills.filter(skill => skill !== skillToRemove));
    };

    const simulateCvParse = () => {
        setIsUploading(true);
        // Mocking AI parsing logic
        setTimeout(() => {
            const extracted = ["Docker", "Kubernetes", "AWS", "Python"];
            const uniqueNew = extracted.filter(s => !mySkills.includes(s));
            setMySkills([...mySkills, ...uniqueNew]);
            setIsUploading(false);
            setUploadComplete(true);
            setTimeout(() => setUploadComplete(false), 3000);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="mb-6 hover:bg-primary/5">
                <ArrowLeft className="mr-2 size-4" /> Back to Job Hub
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Skills Inventory</h2>
                    <p className="text-muted-foreground">Enhance your profile to improve your AI Match Score.</p>
                </div>
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <BrainCircuit className="text-primary size-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CV Upload Section */}
                <Card className="md:col-span-1 border-primary/20 bg-primary/5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" /> Smart Upload
                        </CardTitle>
                        <CardDescription className="text-xs">Extract skills from your resume automatically.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'bg-background animate-pulse' : 'bg-background/50 hover:bg-background'}`}
                            onClick={simulateCvParse}
                        >
                            {isUploading ? (
                                <Wand2 className="size-8 text-primary animate-spin" />
                            ) : uploadComplete ? (
                                <CheckCircle2 className="size-8 text-green-500" />
                            ) : (
                                <Upload className="size-8 text-muted-foreground" />
                            )}
                            <div className="text-center">
                                <p className="text-xs font-bold">{isUploading ? "Analyzing..." : uploadComplete ? "Skills Added!" : "Upload CV"}</p>
                                <p className="text-[10px] text-muted-foreground">PDF/DOCX (Max 5MB)</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center italic">
                            Our AI identifies technical keywords to sync with recruiter requirements.
                        </p>
                    </CardContent>
                </Card>

                {/* Manual Management Section */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="size-4 text-primary" /> Manual Entry
                        </CardTitle>
                        <CardDescription className="text-xs">Add specific skills or refine your existing list.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleAddSkill} className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="e.g. Project Management, SQL, Figma..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    className="bg-muted/30 border-none h-11"
                                />
                            </div>
                            <Button type="submit" className="h-11 px-6">Add</Button>
                        </form>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Currently Identified Skills</Label>
                            <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl min-h-[120px]">
                                {mySkills.length === 0 ? (
                                    <div className="w-full flex flex-col items-center justify-center opacity-30 py-8">
                                        <FileText className="size-8 mb-2" />
                                        <p className="text-xs">No skills listed yet.</p>
                                    </div>
                                ) : (
                                    mySkills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1 group bg-background border shadow-sm"
                                        >
                                            {skill}
                                            <button
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

                        <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <BrainCircuit className="size-4 text-blue-600" />
                            <p className="text-[11px] text-blue-800 font-medium">
                                Pro tip: Including keywords like <strong>"Docker"</strong> or <strong>"Agile"</strong> increases visibility to Corporate recruiters.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
