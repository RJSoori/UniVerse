import { Button } from "./ui/button";

export default function SignUpChoice({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-card">
      <h2 className="text-xl mb-4">Choose your role</h2>
      <div className="space-y-3">
        <Button className="bg-primary w-40" onClick={() => onNavigate("student-register")}>
          Student
        </Button>
        <Button className="bg-primary w-40" onClick={() => onNavigate("buyer-register")}>
          Buyer
        </Button>
        <Button className="bg-primary w-40" onClick={() => onNavigate("seller-register")}>
          Seller
        </Button>
      </div>
    </div>
  );
}
