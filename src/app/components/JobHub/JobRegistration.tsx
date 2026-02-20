import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Building2, User, Upload, CheckCircle, Plus, Trash2, Briefcase, Lock, UserPlus, Key } from "lucide-react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { AccessRecovery } from "./AccessRecovery"; // Importing the new recovery component

export function JobRegistration() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false); // State to toggle recovery view
    const [accessKey, setAccessKey] = useState("");
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"company" | "individual" | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const [registeredKeys, setRegisteredKeys] = useUniStorage<string[]>("registered-recruiter-keys", ["uom-recruiter"]);
    const [myJobs, setMyJobs] = useUniStorage<any[]>("my-posted-jobs", []);

    const handleLogin = () => {
        if (registeredKeys.includes(accessKey)) {
            setIsAuthenticated(true);
            setStep(3); // Skip straight to dashboard
            setIsRegistered(true);
            if (!type) setType('company');
        } else {
            alert("Invalid Access Key. Please register or check your key.");
        }
    };

    const handleRegisterKey = () => {
        if (accessKey.length < 6) {
            alert("Access Key must be at least 6 characters long.");
            return;
        }
        if (registeredKeys.includes(accessKey)) {
            alert("This key is already registered. Please use Login.");
            return;
        }
        setRegisteredKeys([...registeredKeys, accessKey]);
        setIsAuthenticated(true);
        setStep(1); // Start registration flow
    };

    // Render Recovery View
    if (showRecovery) {
        return <AccessRecovery onBack={() => setShowRecovery(false)} />;
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto pt-20">
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Lock className="text-primary size-6" />
                        </div>
                        <CardTitle>Recruiter Portal</CardTitle>
                        <CardDescription>Manage your organization's job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login" className="flex items-center gap-2">
                                    <Key className="size-3" /> Login
                                </TabsTrigger>
                                <TabsTrigger value="register" className="flex items-center gap-2">
                                    <UserPlus className="size-3" /> Register
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Existing Access Key</Label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your key"
                                        value={accessKey}
                                        onChange={(e) => setAccessKey(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleLogin}>Access Account</Button>

                                {/* Forgot Access Key Trigger */}
                                <Button
                                    variant="link"
                                    className="w-full text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => setShowRecovery(true)}
                                >
                                    Forgot Access Key?
                                </Button>
                            </TabsContent>

                            <TabsContent value="register" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Create New Access Key</Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. company-name-2026"
                                        value={accessKey}
                                        onChange={(e) => setAccessKey(e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">This key will be used to log in to your dashboard in the future.</p>
                                </div>
                                <Button className="w-full" variant="secondary" onClick={handleRegisterKey}>Create Account</Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Partner Identification</h2>
                    <p className="text-muted-foreground">Please categorize your entity to proceed.</p>
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

    if (step === 2 && !isRegistered) {
        return (
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>Official documentation for {type} validation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>{type === 'company' ? 'Organization Name' : 'Full Name'}</Label>
                            <Input placeholder="Official name for listings" />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Contact Email</Label>
                            <Input type="email" placeholder="hr@company.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>{type === 'company' ? 'Business Registration (BR)' : 'NIC / Passport Copy'}</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 hover:bg-muted/50 cursor-pointer">
                                <Upload className="size-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Upload Verification PDF</span>
                            </div>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => { setIsRegistered(true); setStep(3); }}>Submit Application</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-primary/5 p-6 rounded-xl border border-primary/20">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle className="text-green-600 size-6" />
                        Recruiter Dashboard
                    </h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        Access Key: {accessKey.replace(/./g, '*')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setMyJobs([{id: Date.now(), title: "New Job Posting", company: type === 'company' ? "Verified Company" : "Verified Recruiter"}, ...myJobs])}>
                        <Plus className="mr-2 size-4" /> Add Posting
                    </Button>
                    <Button variant="outline" onClick={() => { setIsAuthenticated(false); setAccessKey(""); setStep(1); setIsRegistered(false); }}>
                        Log Out
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Briefcase className="size-4 text-primary" /> Active Opportunities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {myJobs.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground italic text-sm">You haven't posted any jobs yet.</p>
                        ) : (
                            myJobs.map(job => (
                                <div key={job.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                                    <div>
                                        <span className="font-bold text-sm">{job.title}</span>
                                        <p className="text-[10px] text-muted-foreground">Status: Live</p>
                                    </div>
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