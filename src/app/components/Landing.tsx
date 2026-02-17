import { Button } from "./ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-card">
      <h1 className="text-2xl mb-6">Welcome to UniVerse</h1>
      <div className="space-x-4">
        <Button className="bg-primary text-primary-foreground" onClick={() => onNavigate("signup")}>
          Sign Up
        </Button>
        <Button className="bg-secondary text-secondary-foreground" onClick={() => onNavigate("signin")}>
          Sign In
        </Button>
      </div>
    </div>
  );
}
