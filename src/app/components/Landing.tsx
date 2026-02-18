import { Button } from "./ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-background to-muted text-center">
      {/* Headings */}
      <h2 className="text-xl text-muted-foreground mb-2">Welcome to</h2>
      <h1 className="text-6xl font-extrabold tracking-tight text-primary mb-3">
        UniVerse
      </h1>
      <p className="text-sm text-muted-foreground mb-12">
        Undergraduate Life Management System
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Button
          className="bg-primary text-primary-foreground w-full py-4 text-lg shadow-md hover:scale-105 transition-transform"
          onClick={() => onNavigate("signup")}
        >
          Sign Up
        </Button>
        <Button
          className="bg-secondary text-secondary-foreground w-full py-4 text-lg shadow-md hover:scale-105 transition-transform"
          onClick={() => onNavigate("signin")}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
