import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Building2, User, Upload, CheckCircle, Plus, Trash2, Briefcase } from "lucide-react";
import { useUniStorage } from "../hooks/useUniStorage";

export function JobRegistration() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"company" | "individual" | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // Storage for the poster's own jobs
    const [myJobs, setMyJobs] = useUniStorage<any[]>("my-posted-jobs", []);

    // Step 01: Type Selection
    if (step === 1) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Partner with UniVerse</h2>
                    <p className="text-muted-foreground">Identify your entity to start posting opportunities.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                        className={`cursor-pointer hover:border-primary transition-all ${type === 'company' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setType('company')}
                    >
                        <CardContent className="p-6 flex flex-col items-center gap-4">
                            <Building2 className="size-12 text-primary" />
                            <div className="text-center">
                                <CardTitle>Company</CardTitle>
                                <CardDescription>Registered businesses & startups</CardDescription>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer hover:border-primary transition-all ${type === 'individual' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setType('individual')}
                    >
                        <CardContent className="p-6 flex flex-col items-center gap-4">
                            <User className="size-12 text-primary" />
                            <div className="text-center">
                                <CardTitle>Individual</CardTitle>
                                <CardDescription>Freelancers or private recruiters</CardDescription>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Button
                    className="w-full"
                    disabled={!type}
                    onClick={() => setStep(2)}
                >
                    Continue to Verification
                </Button>
            </div>
        );
    }

    // Step 02: Verification Documents
    if (step === 2 && !isRegistered) {
        return (
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Verification Details</CardTitle>
                    <CardDescription>Upload necessary documents for {type} verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>{type === 'company' ? 'Company Name' : 'Full Name'}</Label>
                            <Input placeholder="Enter official name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Official Email</Label>
                            <Input type="email" placeholder="email@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>{type === 'company' ? 'Business Registration (BR) Copy' : 'NIC / Passport Copy'}</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 hover:bg-muted/50 cursor-pointer">
                                <Upload className="size-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Click to upload PDF or Image</span>
                            </div>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => setIsRegistered(true)}>Submit for Review</Button>
                </CardContent>
            </Card>
        );
    }

    // Step 03: Exclusive Management Portal
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-primary/5 p-6 rounded-xl border border-primary/20">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle className="text-green-600 size-6" />
                        Poster Dashboard
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        Verified as: {type}
                    </p>
                </div>
                <Button onClick={() => setMyJobs([{id: Date.now(), title: "New Role", company: "My Entity"}, ...myJobs])}>
                    <Plus className="mr-2 size-4" /> Post New Job
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Briefcase className="size-4 text-primary" /> Your Active Postings
                    </CardTitle>
                    <CardDescription>Manage and track your specific listings. View-only access to global metrics is disabled.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {myJobs.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground italic">No jobs posted yet.</p>
                        ) : (
                            myJobs.map(job => (
                                <div key={job.id} className="flex justify-between items-center p-4 border rounded-lg">
                                    <span className="font-bold">{job.title}</span>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setMyJobs(myJobs.filter(j => j.id !== job.id))}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}