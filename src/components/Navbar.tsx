"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  userName?: string;
  onLogout: () => void;
}

export function Navbar({ userName, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/scan", label: "Scan" },
    { href: "/settings", label: "Settings" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-blue-400">
          FR Arbitrage
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                pathname === link.href
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4 pl-4 border-l border-gray-700 flex items-center gap-3">
            <span className="text-sm text-gray-400">{userName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
