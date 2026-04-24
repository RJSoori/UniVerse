import React, { useState } from "react";
import { Button } from "../ui/button";

export default function StudentRegistration({ onNavigate }: { onNavigate: (id: string) => void }) {
  //constants
  const degrees = [
    "Engineering", "IT & Computing", "Medicine & Health Sciences",
    "Management & Business", "Architecture & Design", "Natural & Physical Sciences",
    "Social Sciences & Humanities", "Education & Teaching", "Agriculture & Veterinary",
  ];

  // Controls which part of the form is visible (Step 1: Info, Step 2: Security)
  const [step, setStep] = useState(1);
  
  // Stores all user input data in one object
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    email: "",
    username: "",
    password: "",
  });

  //confirmation password
  const [confirmPassword, setConfirmPassword] = useState("");
  
  //error messages if passwords don't match
  const [passwordError, setPasswordError] = useState("");

  
  // Handles changes for all input fields and the dropdown
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "confirmPassword") {
      setConfirmPassword(value);
      // Clear error message if user fixes the mismatch
      if (passwordError && value === formData.password) {
        setPasswordError("");
      }
    } else {
      // Updates the specific field in formData based on the 'name' attribute
      setFormData({ ...formData, [name]: value });
      
      // Clear error message if user fixes the password field
      if (name === "password" && confirmPassword && value === confirmPassword) {
        setPasswordError("");
      }
    }
  };

  // Moves the user from Step 1 to Step 2
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // The main function that talks to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser from refreshing the page
    
    //Ensure passwords match before even calling the API
    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please enter the same password twice.");
      return;
    }

    try {
      //Sends a POST request to your local Java server
      const response = await fetch("http://localhost:8080/api/students/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        //If backend returns a 200 OK status
        alert("Registration Successful!");
        onNavigate("signin"); // Redirect user to the login screen
      } else {
        //If backend returns an error
        const errorMsg = await response.text();
        alert("Registration failed: " + errorMsg);
      }
    } catch (error) {
      //If the Java server is not running
      console.error("Connection error:", error);
      alert("Backend server is not reachable. Check your terminal!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 px-4">
      
      {/* Dynamic Navigation: Goes back to Welcome page or Step 1*/}
      <button 
        onClick={() => step === 2 ? setStep(1) : onNavigate("welcome")}
        className="absolute top-8 left-8 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        ← {step === 2 ? "Previous Step" : "Back"}
      </button>

      <div className="w-full max-w-md">
        {/* Header Section */}
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

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
          
          {/* STEP 1: Name and Degree Selection */}
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

          {/* STEP 2: Email, Username, and Password fields */}
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
                {/* Visual feedback for password errors */}
                {passwordError && (
                  <p className="text-xs text-rose-600 mt-1">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Complete Registration
              </Button>
            </form>
          )}

          {/* Bottom Navigation: Switch back to Login */}
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