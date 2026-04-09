"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("goldman424@gmail.com");
  const [password, setPassword] = useState("yachida0024");
  const [error, setError] = useState("");

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (user) {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">FR Arbitrage</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
