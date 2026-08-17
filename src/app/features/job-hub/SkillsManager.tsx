import { useEffect, useRef, useState } from "react";
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
import { toast } from "sonner";
import { apiFetch, parseApiError } from "../../shared/api/client";

/**
 * Skills profile for the Job Hub. Backed by real endpoints:
 *   GET/PUT  /api/skills      - the student's manually-managed skill list
 *   POST     /api/skills/cv   - upload a PDF CV; the backend extracts text (Apache PDFBox)
 *                                and asks Gemini to identify skills, merging any new ones in.
 */
export function SkillsManager() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mySkills, setMySkills] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSkill, setNewSkill] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [newlyExtracted, setNewlyExtracted] = useState<string[]>([]);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const response = await apiFetch("/api/skills");
                if (!response.ok) {
                    throw new Error(await parseApiError(response));
                }
                const data = await response.json();
                setMySkills(data.skills ?? []);
            } catch (error) {
                console.error("Failed to load skills:", error);
                toast.error("Unable to load your skills. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        loadSkills();
    }, []);

    const saveSkills = async (updated: string[]) => {
        const previous = mySkills;
        setMySkills(updated); // optimistic
        try {
            const response = await apiFetch("/api/skills", {
                method: "PUT",
                body: JSON.stringify(updated),
            });
            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }
            const data = await response.json();
            setMySkills(data.skills ?? updated);
        } catch (error) {
            console.error("Failed to save skills:", error);
            toast.error("Unable to save that change. Please try again.");
            setMySkills(previous); // roll back
        }
    };

    const handleAddSkill = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = newSkill.trim();
        if (trimmed && !mySkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
            saveSkills([...mySkills, trimmed]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        saveSkills(mySkills.filter((skill) => skill !== skillToRemove));
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file later
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File exceeds the maximum allowed size of 10MB.");
            return;
        }

        setIsUploading(true);
        setNewlyExtracted([]);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await apiFetch("/api/skills/cv", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }
            const data = await response.json();
            setMySkills(data.skills ?? []);
            const extracted: string[] = data.newlyExtracted ?? [];
            setNewlyExtracted(extracted);

            if (extracted.length > 0) {
                toast.success(`Added ${extracted.length} skill${extracted.length === 1 ? "" : "s"} from your CV.`);
            } else {
                toast.info("We couldn't find any new skills in that CV beyond what's already listed.");
            }
            setUploadComplete(true);
            setTimeout(() => setUploadComplete(false), 3000);
        } catch (error) {
            console.error("CV upload failed:", error);
            toast.error(error instanceof Error ? error.message : "Unable to analyze that CV. Please try again.");
        } finally {
            setIsUploading(false);
        }
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
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${isUploading ? 'bg-background animate-pulse pointer-events-none' : 'bg-background/50 hover:bg-background'}`}
                            onClick={() => fileInputRef.current?.click()}
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
                                <p className="text-[10px] text-muted-foreground">PDF only (Max 10MB)</p>
                            </div>
                        </div>
                        {newlyExtracted.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {newlyExtracted.map((skill) => (
                                    <Badge key={skill} className="bg-primary/10 text-primary border-none text-[10px]">
                                        + {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground text-center italic">
                            Gemini reads your CV and identifies technical keywords to sync with recruiter requirements.
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
                                {isLoading ? (
                                    <div className="w-full flex flex-col items-center justify-center opacity-30 py-8">
                                        <p className="text-xs">Loading your skills...</p>
                                    </div>
                                ) : mySkills.length === 0 ? (
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
