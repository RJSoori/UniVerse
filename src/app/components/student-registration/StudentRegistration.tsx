import React, { useState } from "react";
import { Button } from "../ui/button";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Save credentials locally so SignIn can use them
    localStorage.setItem("user", JSON.stringify(formData));

    // Redirect to Sign In after successful signup
    onNavigate("signin");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">
        Let’s set your profile up in a few steps
      </h2>
      <p className="text-gray-600 mb-8">
        {step === 1 ? "Step 1: Basic Info" : "Step 2: Account Setup"}
      </p>

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col gap-6">
            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-gray-700 mb-2">Select Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Choose your degree</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
            </div>

            <Button type="submit" className="bg-blue-600 text-white py-3 text-lg shadow-md hover:scale-105 transition-transform">
              Next
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <Button type="submit" className="bg-blue-600 text-white py-3 text-lg shadow-md hover:scale-105 transition-transform">
              Register
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
