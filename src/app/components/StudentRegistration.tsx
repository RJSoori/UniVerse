import React, { useState } from "react";
import { Button } from "./ui/button";

export default function StudentRegistration({ onNavigate }: { onNavigate: (id: string) => void }) {
  const degrees = [
    "Engineering",
    "IT & Computing",
    "Medicine & Health Sciences",
    "Management & Business",
    "Architecture & Design",
    "Natural & Physical Sciences",
    "Social Sciences & Humanities",
    "Education & Teaching",
    "Agriculture & Veterinary",
  ];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", degree: "", username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Registration successful! Welcome, ${formData.name}`);
    onNavigate("dashboard"); // ✅ Redirect to Dashboard
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card shadow rounded">
      {/* ✅ Inline success message */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNext}>
          <h2 className="text-lg mb-4">Step 1: Basic Info</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded bg-input-background"
            required
          />
          <select
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded bg-input-background"
            required
          >
            <option value="">Select Degree</option>
            {degrees.map((deg) => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>
          <Button type="submit" className="bg-primary text-primary-foreground w-full">
            Next
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg mb-4">Step 2: Account Setup</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded bg-input-background"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded bg-input-background"
            required
          />
          <Button type="submit" className="bg-primary text-primary-foreground w-full">
            Register
          </Button>
        </form>
      )}
    </div>
  );
}
