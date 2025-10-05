"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-50 px-6">
      <div className="max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">
          📚 Welcome to <span className="text-indigo-900">Book Tracker</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Keep track of your reading journey. Login or sign up to get started.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-xl shadow hover:bg-indigo-50 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}

