import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
    Building2, User, Upload, ArrowLeft, GraduationCap,
    Lock, UserPlus, Key, ImageIcon, Globe, Mail, MapPin, FileText,
    ShieldCheck
} from "lucide-react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { AccessRecovery } from "./AccessRecovery";
import { JobPosting } from "./JobPosting";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { RecruiterSettings } from "./RecruiterSettings";

export function JobRegistration({ onNavigate }: { onNavigate?: (section: string) => void }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"company" | "individual" | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const [registeredKeys, setRegisteredKeys] = useUniStorage<string[]>("registered-recruiter-keys", ["uom-recruiter"]);
    const [myJobs, setMyJobs] = useUniStorage<any[]>("my-posted-jobs", []);

    const handleLogin = () => {
        if (registeredKeys.includes(accessKey)) {
            setIsAuthenticated(true);
            setStep(3);
            setIsRegistered(true);
            if (!type) setType('company');
        } else {
            alert("Invalid Access Key.");
        }
    };

    const handleRegisterKey = () => {
        if (accessKey.length < 6) return alert("Key too short.");
        setRegisteredKeys([...registeredKeys, accessKey]);
        setIsAuthenticated(true);
        setStep(1);
    };

    const handleNewPost = (job: any) => {
        setMyJobs([job, ...myJobs]);
        setIsPosting(false);
    };

    const handleDeleteJob = (id: string) => {
        setMyJobs(myJobs.filter(j => j.id !== id));
    };

    if (showRecovery) return <AccessRecovery onBack={() => setShowRecovery(false)} />;
    if (isPosting) return <JobPosting onBack={() => setIsPosting(false)} onPost={handleNewPost} />;
    if (isSettings) return <RecruiterSettings type={type} onBack={() => setIsSettings(false)} />;

    if (isAuthenticated && isRegistered && step === 3) {
        return (
            <RecruiterDashboard
                type={type}
                accessKey={accessKey}
                jobs={myJobs}
                onPostNew={() => setIsPosting(true)}
                onDeleteJob={handleDeleteJob}
                onSignOut={() => {
                    setIsAuthenticated(false);
                    setAccessKey("");
                    setStep(1);
                    setIsRegistered(false);
                }}
                onOpenSettings={() => setIsSettings(true)}
            />
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="mb-8 flex flex-col items-center gap-2">
                    <div className="size-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="size-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">UniVerse Recruiter</h1>
                </div>
                <Card className="w-full max-w-md border-primary/20 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Lock className="text-primary size-6" />
                        </div>
                        <CardTitle>Recruiter Portal</CardTitle>
                        <CardDescription>Secure access for talent acquisition</CardDescription>
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
                                <Button variant="link" className="w-full text-xs text-muted-foreground hover:text-primary" onClick={() => setShowRecovery(true)}>
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
                                </div>
                                <Button className="w-full" variant="secondary" onClick={handleRegisterKey}>Create Account</Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <Button variant="ghost" className="mt-6 text-muted-foreground" onClick={() => onNavigate?.("signup")}>
                    <ArrowLeft className="mr-2 size-4" /> Back to Sign Up Options
                </Button>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-primary">Identity Selection</h2>
                        <p className="text-muted-foreground text-lg">Define your presence in the undergraduate ecosystem.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                            className={`group cursor-pointer hover:border-primary transition-all duration-300 border-2 shadow-sm ${type === 'company' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                            onClick={() => setType('company')}
                        >
                            <CardContent className="p-8 flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-2xl transition-colors ${type === 'company' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <Building2 className="size-12" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">Corporate</h3>
                                    <p className="text-sm text-muted-foreground mt-1">For registered businesses & startups</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card
                            className={`group cursor-pointer hover:border-primary transition-all duration-300 border-2 shadow-sm ${type === 'individual' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                            onClick={() => setType('individual')}
                        >
                            <CardContent className="p-8 flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-2xl transition-colors ${type === 'individual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <User className="size-12" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">Individual</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Freelancers or private recruiters</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 h-12" onClick={() => setIsAuthenticated(false)}>Cancel</Button>
                        <Button className="flex-[2] h-12 font-bold" disabled={!type} onClick={() => setStep(2)}>Continue to Verification</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2 && !isRegistered) {
        return (
            <div className="min-h-screen bg-background py-16 px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-primary">Verification Portal</h2>
                            <p className="text-muted-foreground">Complete your profile for {type === 'company' ? 'Corporate' : 'Individual'} status.</p>
                        </div>
                    </div>

                    <Card className="border-primary/10 shadow-2xl bg-card/50 backdrop-blur overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-primary size-6" />
                                <CardTitle className="text-xl">Organization Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Legal Entity Name</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/20 border-none" placeholder={type === 'company' ? "e.g. Acme Innovations PLC" : "Full legal name"} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">{type === 'company' ? 'BR Number' : 'NIC / Passport'}</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/20 border-none" placeholder="e.g. PV-XXXXXX" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Official Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/20 border-none" type="email" placeholder="recruitment@org.com" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Website / Portfolio</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/20 border-none" placeholder="https://www.company.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Headquarters / Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/20 border-none" placeholder="City, Country" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Industry Field</Label>
                                        <Input className="h-11 bg-muted/20 border-none px-4" placeholder="e.g. FinTech, Healthcare" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Brief Description</Label>
                                    <Textarea className="resize-none h-28 bg-muted/20 border-none p-4" placeholder="Briefly describe your recruitment focus or mission..." />
                                </div>

                                <div className="md:col-span-2 pt-6">
                                    <Label className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4 block text-primary">Required Verification Assets</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                                            <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                                                <Upload className="size-6 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <span className="text-xs font-bold mt-1">{type === 'company' ? 'BR Certificate' : 'ID Document'}</span>
                                            <p className="text-[10px] text-muted-foreground text-center">PDF or High-res Image</p>
                                        </div>
                                        {type === 'company' && (
                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                                                <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                                                    <ImageIcon className="size-6 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <span className="text-xs font-bold mt-1">Company Logo</span>
                                                <p className="text-[10px] text-muted-foreground text-center">PNG / SVG Preferred</p>
                                            </div>
                                        )}
                                        <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-muted/10 group">
                                            <div className="p-3 bg-background rounded-full group-hover:bg-primary/10">
                                                <ShieldCheck className="size-6 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <span className="text-xs font-bold mt-1">Letter of Auth</span>
                                            <p className="text-[10px] text-muted-foreground text-center">Optional verification proof</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t">
                                <Button variant="ghost" className="flex-1 h-12 order-2 sm:order-1" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2 size-4" /> Go Back
                                </Button>
                                <Button className="flex-[2] h-12 font-black uppercase text-sm tracking-widest order-1 sm:order-2 shadow-xl shadow-primary/20" onClick={() => { setIsRegistered(true); setStep(3); }}>
                                    Submit Application
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return null;
}