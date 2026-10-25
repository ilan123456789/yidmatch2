"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Building2, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Invalid login credentials");
    }
  };

  const handleDemoLogin = (role: "EMPLOYER" | "SEEKER") => {
    switchDemoRole(role);
    if (role === "EMPLOYER") {
      router.push("/employer/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="relative h-12 w-48 mx-auto mb-2">
          <Image 
            src="/logo.png" 
            alt="YID MATCH" 
            fill 
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">Sign in to your YID MATCH account</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-navy hover:bg-brand-blue text-white font-bold rounded-xl shadow transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Instant Test Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin("EMPLOYER")}
              className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-blue transition"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
              <span>Employer Demo</span>
            </button>
            <button
              onClick={() => handleDemoLogin("SEEKER")}
              className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-blue transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seeker Demo</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 pt-1">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand-blue font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
