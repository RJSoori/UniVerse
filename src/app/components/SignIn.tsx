import { useState } from "react";
import { Button } from "./ui/button";

export default function SignIn({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real auth check
    if (username && password) {
      alert(`Welcome back, ${username}!`);
      onNavigate("dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card shadow rounded">
      <h2 className="text-lg mb-4">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded bg-input-background"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded bg-input-background"
          required
        />
        <Button type="submit" className="bg-primary text-primary-foreground w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
