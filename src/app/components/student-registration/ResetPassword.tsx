import React, { useState } from "react";
import { Button } from "../ui/button";

export default function ResetPassword({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (savedUser.username) {
      // ✅ Update password in localStorage
      const updatedUser = { ...savedUser, password: formData.password };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Password reset successful! Redirecting to Sign In...");
      setTimeout(() => {
        onNavigate("signin"); // ✅ back to SignIn, not dashboard
      }, 2000);
    } else {
      setError("No user found. Please sign up first.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-3xl font-bold text-blue-700 mb-2">Reset Password</h2>
      <p className="text-gray-600 mb-8">Enter your new password below</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded w-full max-w-md text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded w-full max-w-md text-center">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* New Password */}
          <div className="flex flex-col text-left">
            <label className="text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col text-left">
            <label className="text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-blue-600 text-white py-3 text-lg shadow-md hover:scale-105 transition-transform"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
