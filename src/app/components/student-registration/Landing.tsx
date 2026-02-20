import { Button } from "../ui/button";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center justify-center selection:bg-primary/20">
            {/* Background Ambient Accents to match the professional sapphire aesthetic */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 text-center z-10">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Sparkles className="size-3" />
                    <span>The Future of Student Life</span>
                </div>

                {/* Headings with Sapphire Blue Gradients */}
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-muted-foreground mb-4">
                    Welcome to
                </h2>

                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="size-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform">
                        <GraduationCap className="size-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        UniVerse
                    </h1>
                </div>

                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-16 leading-relaxed">
                    The intelligent management system for undergraduates.
                    Unify your academic progress, finances, and career trajectory in one platform.
                </p>

                {/* Action Buttons styled to match Job Registration & SignIn modules */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto">
                    <Button
                        className="w-full sm:flex-1 h-14 text-lg font-bold rounded-2xl
                       bg-gradient-to-r from-primary to-blue-600
                       text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform group"
                        onClick={() => onNavigate("signup")}
                    >
                        Get Started
                        <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:flex-1 h-14 text-lg font-bold rounded-2xl
                       border-primary/20 hover:bg-primary/5 transition-colors"
                        onClick={() => onNavigate("signin")}
                    >
                        Sign In
                    </Button>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">
                    UoM Undergraduate Life Management System
                </p>
            </div>
        </div>
    );
}