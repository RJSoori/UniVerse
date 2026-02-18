import { Button } from "./ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center">
      {/* Headings */}
      <h2 className="text-xl text-muted-foreground mb-2">Welcome to</h2>
      <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-12">
        UniVerse
      </h1>

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button
          className="bg-primary text-primary-foreground w-full py-3 text-lg"
          onClick={() => onNavigate("signup")}
        >
          Sign Up
        </Button>
        <Button
          className="bg-secondary text-secondary-foreground w-full py-3 text-lg"
          onClick={() => onNavigate("signin")}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
