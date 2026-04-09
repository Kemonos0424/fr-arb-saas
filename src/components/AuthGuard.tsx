"use client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "./Navbar";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <>
      <Navbar userName={user.display_name || user.email} onLogout={() => { logout(); window.location.href = "/"; }} />
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </>
  );
}
