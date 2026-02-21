import React, { useState } from "react";
import { Button } from "../ui/button";

export default function ForgotPassword({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (formData.name === savedUser.name && formData.email === savedUser.email) {
      // ✅ Verified → go to reset password
      onNavigate("reset-password");
    } else {
      setError("No matching account found. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">Forgot Password</h2>
      <p className="text-gray-600 mb-8">Enter your name and email to reset your password</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded w-full max-w-md text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name */}
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

          {/* Email */}
          <div className="flex flex-col text-left">
            <label className="text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-blue-600 text-white py-3 text-lg shadow-md hover:scale-105 transition-transform"
          >
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}
