"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types";
import { NEIGHBORHOOD_OPTIONS } from "@/lib/seed-data";
import { Lock, Mail, User, Building2, Phone, MapPin, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [role, setRole] = useState<UserRole>("SEEKER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Lakewood, NJ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signup({
      role,
      name,
      email,
      pass: password,
      companyName: role === "EMPLOYER" ? companyName : undefined,
      phone,
      location,
    });

    setLoading(false);

    if (res.success) {
      if (role === "EMPLOYER") {
        router.push("/employer/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setError(res.error || "Failed to create account");
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
        <h1 className="text-2xl font-extrabold text-slate-900">Create Your Account</h1>
        <p className="text-xs text-slate-500">Join the Heimish community job network</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {/* Role Toggle */}
        <div>
          <label className="block text-slate-700 font-bold mb-2 text-xs">Account Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("SEEKER")}
              className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                role === "SEEKER"
                  ? "bg-blue-50/80 border-brand-blue text-brand-blue font-bold shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <User className="w-4 h-4 text-brand-blue" />
                {role === "SEEKER" && <Check className="w-4 h-4 text-brand-blue" />}
              </div>
              <span className="text-xs font-bold">Job Seeker</span>
              <span className="text-[10px] text-slate-500 font-normal">Apply & find jobs</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("EMPLOYER")}
              className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                role === "EMPLOYER"
                  ? "bg-blue-50/80 border-brand-blue text-brand-blue font-bold shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <Building2 className="w-4 h-4 text-brand-blue" />
                {role === "EMPLOYER" && <Check className="w-4 h-4 text-brand-blue" />}
              </div>
              <span className="text-xs font-bold">Employer</span>
              <span className="text-[10px] text-slate-500 font-normal">Post $25 listings</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chaim Berkowitz"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
            />
          </div>

          {role === "EMPLOYER" && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company / Organization Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Distribution LLC"
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(732) 555-0199"
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Community</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none bg-white font-medium"
              >
                {NEIGHBORHOOD_OPTIONS.filter((n) => n !== "All Locations").map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-navy hover:bg-brand-blue text-white font-bold rounded-xl shadow transition disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
