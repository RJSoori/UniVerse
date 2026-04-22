import React, { useState } from "react";
import { Button } from "../ui/button";

export default function StudentRegistration({ onNavigate }: { onNavigate: (id: string) => void }) {
  const degrees = [
    "Engineering", "IT & Computing", "Medicine & Health Sciences",
    "Management & Business", "Architecture & Design", "Natural & Physical Sciences",
    "Social Sciences & Humanities", "Education & Teaching", "Agriculture & Veterinary",
  ];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(formData));
    onNavigate("signin");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 px-4">
      
      {/* Back Button */}
      <button 
        onClick={() => step === 2 ? setStep(1) : onNavigate("welcome")}
        className="absolute top-8 left-8 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        ← {step === 2 ? "Previous Step" : "Back"}
      </button>

      <div className="w-full max-w-md">
        {/* Header & Progress */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Profile</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <p className="text-slate-500 mt-4 font-medium">
            {step === 1 ? "Basic Information" : "Account Security"}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
          
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Select Degree</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all bg-white"
                  required
                >
                  <option value="">Choose your degree</option>
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@address.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Complete Registration
              </Button>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-slate-400">
            Already have an account?{" "}
            <span 
              className="text-blue-600 font-bold cursor-pointer hover:underline"
              onClick={() => onNavigate("signin")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}