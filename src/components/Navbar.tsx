"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Briefcase, 
  Zap, 
  PlusCircle, 
  User, 
  LogOut, 
  ChevronDown, 
  FileText, 
  Layers,
  Menu,
  X,
  Sparkles
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-navy border-b border-brand-navyLight shadow-md">
      {/* Top micro banner */}
      <div className="bg-brand-navyDark text-slate-300 text-xs py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="truncate max-w-[200px] sm:max-w-none">The Premier Heimish Jewish Job & Daily Gig Marketplace</span>
          </div>
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <span className="hidden md:inline text-slate-400">Shomer Shabbos & Yom Tov Verified</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px]">Test Role:</span>
              <button 
                onClick={() => switchDemoRole("EMPLOYER")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${user?.role === "EMPLOYER" ? "bg-brand-blue text-white" : "bg-slate-800 text-slate-300 hover:text-white"}`}
              >
                Employer
              </button>
              <button 
                onClick={() => switchDemoRole("SEEKER")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${user?.role === "SEEKER" ? "bg-brand-blue text-white" : "bg-slate-800 text-slate-300 hover:text-white"}`}
              >
                Seeker
              </button>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            {/* בס"ד at the exact top right corner */}
            <span 
              className="font-serif font-black text-amber-300 text-xs sm:text-sm tracking-widest select-none bg-slate-900/60 px-2 py-0.5 rounded border border-amber-400/20 shadow-sm"
              title="בסייעתא דשמיא"
            >
              בס״ד
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-48 sm:h-14 sm:w-56 overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="YID MATCH - Heimish Job Portal" 
                fill 
                className="object-contain object-left group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link 
              href="/" 
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === "/" ? "bg-brand-navyLight text-white" : "text-slate-200 hover:bg-brand-navyLight hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4 text-brand-blue" />
              <span>Browse Jobs</span>
            </Link>

            <Link 
              href="/daily-jobs" 
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === "/daily-jobs" ? "bg-brand-navyLight text-brand-gold" : "text-amber-300 hover:bg-brand-navyLight hover:text-brand-gold"
              }`}
            >
              <Zap className="w-4 h-4 text-brand-gold animate-bounce" />
              <span>Daily Jobs</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border border-amber-500/30">
                Same-Day
              </span>
            </Link>

            {user?.role === "EMPLOYER" && (
              <Link 
                href="/employer/dashboard" 
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith("/employer") ? "bg-brand-navyLight text-white" : "text-slate-200 hover:bg-brand-navyLight hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Employer Dashboard</span>
              </Link>
            )}

            {user?.role === "SEEKER" && (
              <Link 
                href="/seeker/applications" 
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith("/seeker") ? "bg-brand-navyLight text-white" : "text-slate-200 hover:bg-brand-navyLight hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-brand-blue" />
                <span>My Applications</span>
              </Link>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Post Job $25 CTA */}
            <Link 
              href="/post-job"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-brand-blue hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-md hover:shadow-blue-500/20 transition-all border border-blue-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                $25
              </span>
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-brand-navyLight/80 hover:bg-brand-navyLight text-slate-200 px-3 py-2 rounded-lg border border-slate-700 text-sm font-medium transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-slate-200 z-50 text-slate-800 animate-in fade-in-50 zoom-in-95"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-brand-blue">
                        {user.role === "EMPLOYER" ? "💼 Employer Account" : "👤 Job Seeker"}
                      </span>
                    </div>

                    {user.role === "EMPLOYER" ? (
                      <>
                        <Link href="/employer/dashboard" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Layers className="w-4 h-4 text-brand-blue" />
                          <span>Employer Dashboard</span>
                        </Link>
                        <Link href="/post-job" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          <span>Post Job ($25)</span>
                        </Link>
                      </>
                    ) : (
                      <Link href="/seeker/applications" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FileText className="w-4 h-4 text-brand-blue" />
                        <span>My Applications</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-slate-200 hover:text-white text-sm font-medium px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-brand-navy hover:bg-slate-100 font-semibold text-sm px-3.5 py-2 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/post-job"
              className="bg-brand-blue text-white text-xs font-semibold px-2.5 py-1.5 rounded"
            >
              Post Job ($25)
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-200 p-2 rounded-lg hover:bg-brand-navyLight"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navyDark border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 text-slate-200 py-2 font-medium"
          >
            <Briefcase className="w-4 h-4 text-brand-blue" />
            <span>Browse Jobs</span>
          </Link>
          <Link
            href="/daily-jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 text-brand-gold py-2 font-medium"
          >
            <Zap className="w-4 h-4" />
            <span>Daily Jobs / Same-Day Gigs</span>
          </Link>
          {user?.role === "EMPLOYER" ? (
            <Link
              href="/employer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-slate-200 py-2 font-medium"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Employer Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/seeker/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-slate-200 py-2 font-medium"
            >
              <FileText className="w-4 h-4 text-brand-blue" />
              <span>My Applications</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800 flex flex-col space-y-2">
            {user ? (
              <div className="flex items-center justify-between text-xs text-slate-400 py-2">
                <span>Signed in as <strong>{user.name}</strong> ({user.role})</span>
                <button onClick={logout} className="text-rose-400 font-semibold">Sign Out</button>
              </div>
            ) : (
              <div className="flex space-x-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 text-white rounded text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-brand-blue text-white rounded text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
