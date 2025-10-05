"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState(""); // new success state
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      if (error.message.includes("duplicate key")) {
        setErrorMessage("This email is already registered. Try logging in.");
      } else if (error.message.includes("Anonymous sign-ins")) {
        setErrorMessage(
          "Sign up is currently disabled. Please contact support."
        );
      } else {
        setErrorMessage(error.message);
      }
      return;
    }

    // Friendly success message
    setSuccessMessage(
      "🎉 Signed up successfully! Please check your email for confirmation (if required), then log in."
    );
    
    // Optionally redirect after a short delay
    setTimeout(() => router.push("/login"), 4000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Create Your Account
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign up to start tracking your reading journey
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 text-green-600 text-sm text-center font-medium">
            {successMessage}
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}
