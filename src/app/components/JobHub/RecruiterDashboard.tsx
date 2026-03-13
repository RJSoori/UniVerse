import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
    Plus,
    Trash2,
    Briefcase,
    Users,
    BarChart3,
    Clock,
    ExternalLink,
    LogOut,
    Settings,
    UserRoundCheck
} from "lucide-react";

interface RecruiterDashboardProps {
    type: "company" | "individual" | null;
    accessKey: string;
    jobs: any[];
    onPostNew: () => void;
    onSignOut: () => void;
    onDeleteJob: (id: string) => void;
    onOpenSettings: () => void;
}

export function RecruiterDashboard({
                                       type,
                                       accessKey,
                                       jobs,
                                       onPostNew,
                                       onSignOut,
                                       onDeleteJob,
                                       onOpenSettings
                                   }: RecruiterDashboardProps) {
    return (
        <div className="min-h-screen bg-background p-6 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <UserRoundCheck className="text-primary size-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">Recruiter Hub</h2>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5">
                                    Verified {type}
                                </Badge>
                                
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <Button
                            className="flex-1 md:flex-none shadow-lg shadow-primary/20"
                            onClick={onPostNew}
                        >
                            <Plus className="mr-2 size-4" /> Create Posting
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenSettings}
                            className="flex-1 md:flex-none"
                        >
                            <Settings className="mr-2 size-4" /> Settings
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSignOut}
                            className="text-destructive hover:bg-destructive/5"
                        >
                            <LogOut className="mr-2 size-4" /> Sign Out
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none bg-primary/5 shadow-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-background rounded-xl">
                                <Briefcase className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Active Posts</p>
                                <p className="text-2xl font-bold">{jobs.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-blue-50/50 shadow-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-background rounded-xl">
                                <Users className="size-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Reach</p>
                                <p className="text-2xl font-bold">--</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-green-50/50 shadow-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-background rounded-xl">
                                <BarChart3 className="size-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Engagements</p>
                                <p className="text-2xl font-bold">--</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="size-5 text-primary" /> Recent Listings
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {jobs.length === 0 ? (
                            <div className="py-24 bg-muted/20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground text-center px-4">
                                <Briefcase className="size-16 mb-4 opacity-10" />
                                <p className="font-semibold text-lg">Your dashboard is empty</p>
                                <p className="text-sm max-w-xs">Click "Create Posting" to attract university talent from across the ecosystem.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <Card key={job.id} className="group hover:border-primary/40 transition-all border-border/60">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                                            <div className="flex items-start gap-5">
                                                <div className="size-14 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                                    <Briefcase className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold">{job.title}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-[10px] uppercase">{job.workType}</Badge>
                                                        <Badge variant="outline" className="text-[10px]">{job.salaryInfo}</Badge>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-2">
                                                            <Clock className="size-3" /> Posted {job.postedAt}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-10">
                                                    <ExternalLink className="mr-2 size-4" /> View Applicants
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if(confirm("Are you sure you want to delete this posting?")) {
                                                            onDeleteJob(job.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}