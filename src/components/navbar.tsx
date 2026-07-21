"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  FileText,
  Home,
  Menu,
  Search,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/analyze", label: "Analyze", icon: Search },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Intelligence
          </span>
        </Link>

        {/* Center Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="hidden sm:inline-flex bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            New Analysis
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-6 py-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 sm:hidden">
            <Link
              href="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center bg-black text-white w-full py-2.5 rounded-xl text-sm font-medium"
            >
              New Analysis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
