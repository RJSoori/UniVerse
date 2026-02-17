import { Button } from "./components/ui/button";

export default function StudentChoice({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Are you a student?</h2>
      <div className="space-x-4">
        <Button
          className="bg-primary text-primary-foreground"
          onClick={() => onNavigate("student-register")}
        >
          Yes
        </Button>
        <Button
          className="bg-secondary text-secondary-foreground"
          onClick={() => alert("Non-student flow coming soon!")}
        >
          No
        </Button>
      </div>
    </div>
  );
}
