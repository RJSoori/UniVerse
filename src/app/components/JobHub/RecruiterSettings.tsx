import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
    ArrowLeft,
    Save,
    Building2,
    Mail,
    Globe,
    MapPin,
    ShieldCheck,
    Camera,
    Bell,
    Lock
} from "lucide-react";

interface RecruiterSettingsProps {
    type: "company" | "individual" | null;
    onBack: () => void;
}

export function RecruiterSettings({ type, onBack }: RecruiterSettingsProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Profile settings updated successfully.");
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Portal Settings</h2>
                        <p className="text-muted-foreground">Manage your recruitment profile and account security.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"} <Save className="ml-2 size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Card className="overflow-hidden border-primary/10">
                        <div className="h-24 bg-primary/10 w-full" />
                        <CardContent className="relative pt-12 pb-6 text-center">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="size-24 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden group cursor-pointer">
                                    <Building2 className="size-10 text-muted-foreground group-hover:hidden" />
                                    <div className="hidden group-hover:flex flex-col items-center text-primary">
                                        <Camera className="size-6" />
                                        <span className="text-[10px] font-bold">Change</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg">Update Branding</h3>
                            <p className="text-xs text-muted-foreground">Logo visible to undergraduates</p>
                        </CardContent>
                    </Card>

                    <nav className="flex flex-col gap-1">
                        <Button variant="secondary" className="justify-start"><Building2 className="mr-2 size-4" /> Profile Info</Button>
                        <Button variant="ghost" className="justify-start"><Bell className="mr-2 size-4" /> Notifications</Button>
                        <Button variant="ghost" className="justify-start"><Lock className="mr-2 size-4" /> Security</Button>
                    </nav>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Public Profile</CardTitle>
                            <CardDescription>This information is displayed on your job postings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input placeholder="Organization or Personal Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Input placeholder="e.g. Technology" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Organization Description</Label>
                                <Textarea
                                    className="min-h-[100px] resize-none border border-border/70 bg-muted/20 rounded-xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 transition-colors"
                                    placeholder="Briefly describe your goals..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input className="pl-10" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input className="pl-10" placeholder="Colombo, Sri Lanka" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-lg text-destructive flex items-center gap-2">
                                <ShieldCheck className="size-5" /> Account Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Your account is currently <strong>Verified</strong>. Changing your business registration details or primary identity will require a re-verification process.
                            </p>
                            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                                Request Re-verification
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}