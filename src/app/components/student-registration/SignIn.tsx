import React, { useState } from "react";
import { Button } from "../ui/button";

export default function SignIn({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  // --- UPDATED HANDLER TO TALK TO BACKEND ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Send the login request to your Spring Boot Controller
      const response = await fetch("http://localhost:8080/api/students/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // 2. Get the text response from the backend (e.g., "Login Successful!")
      const result = await response.text();

      if (result === "Login Successful!") {
        // 3. If credentials match what's in Aiven MySQL
        onNavigate("dashboard");
      } else {
        // 4. If backend returns "Invalid Password" or "User Not Found"
        setError(result);
      }
    } catch (err) {
      // 5. If the backend server isn't running
      console.error("Login Error:", err);
      setError("Cannot connect to the server. Please check your terminal.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 px-4">
      
      {/* Subtle Back Navigation */}
      <button 
        onClick={() => onNavigate("welcome")}
        className="absolute top-8 left-8 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        ← Back to Home
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mt-2">Enter your credentials to access your UniVerse</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
          
          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
              <input
                type="text"
                name="username"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate("forgot-password")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500">
            Don't have an account?{" "}
            <span 
              className="text-blue-600 font-bold cursor-pointer hover:underline"
              onClick={() => onNavigate("student-register")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}