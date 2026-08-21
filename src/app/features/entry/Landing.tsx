import { Button } from "../../shared/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-primary/20">
            {/* Background Ambient Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Main content - vertically centered in the remaining space */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10">
                {/* Headings */}
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

                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed mb-12">
                    The intelligent management system for undergraduates.
                    Unify your academic progress, finances, and career trajectory in one platform.
                </p>

                <Button
                    className="w-64 h-14 text-lg font-bold rounded-2xl
                    bg-gradient-to-r from-primary to-blue-600
                    text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform group"
                    onClick={() => navigate("/signup")}
                >
                    Get Started
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            {/* Footer Branding pinned to the bottom of the page */}
            <div className="text-center pb-6 z-10">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">
                    UoM Undergraduate Life Management System
                </p>
            </div>
        </div>
    );
}
