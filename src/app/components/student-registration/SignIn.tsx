import React, { useState } from "react";
import { Button } from "../ui/button";

export default function SignIn({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (formData.username === savedUser.username && formData.password === savedUser.password) {
      onNavigate("dashboard"); // ✅ successful login
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome back to UniVerse</h2>
      <p className="text-gray-600 mb-8">Sign in to continue your journey</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded w-full max-w-md text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col text-left">
            <label className="text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-blue-600 text-white py-3 text-lg shadow-md hover:scale-105 transition-transform"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
