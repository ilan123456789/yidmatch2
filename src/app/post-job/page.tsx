"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { NEIGHBORHOOD_OPTIONS, HEIMISH_PERK_OPTIONS } from "@/lib/seed-data";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "");
  const [neighborhood, setNeighborhood] = useState("Lakewood, NJ");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<"Full-Time" | "Part-Time" | "Remote" | "Hybrid">("Full-Time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryType, setSalaryType] = useState<"Year" | "Hour">("Year");
  const [description, setDescription] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    "Shomer Shabbos & Yom Tov",
    "Kosher Kitchen",
    "Early Friday Dismissal"
  ]);
  const [employerEmail, setEmployerEmail] = useState(user?.email || "");

  const togglePerk = (perk: string) => {
    if (selectedPerks.includes(perk)) {
      setSelectedPerks(selectedPerks.filter((p) => p !== perk));
    } else {
      setSelectedPerks([...selectedPerks, perk]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const requirements = requirementsText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          neighborhood,
          location: location || neighborhood,
          jobType,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          salaryType,
          salaryDisplay: salaryMin && salaryMax 
            ? `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()} / ${salaryType.toLowerCase()}`
            : (salaryMin ? `From $${Number(salaryMin).toLocaleString()} / ${salaryType.toLowerCase()}` : "Competitive"),
          description,
          requirements,
          heimishPerks: selectedPerks,
          employerId: user?.uid || "emp-guest",
          employerEmail: employerEmail || user?.email || "billing@yidmatch.com",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect directly to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while preparing your listing");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-brand-blue">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Employer Portal</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Post a Job Listing on YID MATCH
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Reach thousands of qualified Heimish job seekers across Lakewood, Brooklyn, Rockland, and beyond for a flat <strong>$25 listing fee</strong>.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Role Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-brand-blue" />
            <span>1. Position Overview</span>
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full-Charge Bookkeeper, E-Commerce Account Manager..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Distribution LLC"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Employment Type *</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none bg-white font-medium cursor-pointer"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Community / Region *</label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none bg-white font-medium cursor-pointer"
                >
                  {NEIGHBORHOOD_OPTIONS.filter((n) => n !== "All Locations").map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location Details</label>
                <input
                  type="text"
                  placeholder="e.g. Clifton Ave, Lakewood, NJ or Ave J, Flatbush"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Compensation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>2. Compensation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Minimum Pay ($)</label>
              <input
                type="number"
                placeholder="e.g. 70000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Maximum Pay ($)</label>
              <input
                type="number"
                placeholder="e.g. 95000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Pay Period</label>
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none bg-white font-medium cursor-pointer"
              >
                <option value="Year">Per Year ($/yr)</option>
                <option value="Hour">Per Hour ($/hr)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Heimish Workplace Perks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>3. Heimish Environment & Accommodations</span>
          </h2>
          <p className="text-xs text-slate-500">
            Select the cultural and religious perks your workplace provides. These badges give candidates high trust and confidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {HEIMISH_PERK_OPTIONS.map((perk) => {
              const selected = selectedPerks.includes(perk);
              return (
                <div
                  key={perk}
                  onClick={() => togglePerk(perk)}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    selected 
                      ? "bg-amber-50/70 border-amber-300 text-slate-900 font-bold" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}} // handled by parent div
                    className="w-4 h-4 text-brand-blue rounded border-slate-300 pointer-events-none"
                  />
                  <span className="text-xs sm:text-sm">{perk}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Details & Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-brand-blue" />
            <span>4. Job Description & Requirements</span>
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Job Description *</label>
              <textarea
                required
                rows={5}
                placeholder="Describe the day-to-day responsibilities, company background, and team environment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Candidate Requirements (One per line)
              </label>
              <textarea
                rows={4}
                placeholder="Example:&#10;3+ years of QuickBooks experience&#10;Proficiency in Excel and inventory forecasting&#10;Strong communication skills"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Employer Notification Email (for candidate resumes) *
              </label>
              <input
                type="email"
                required
                value={employerEmail}
                onChange={(e) => setEmployerEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-brand-blue font-medium"
                placeholder="careers@yourcompany.com"
              />
            </div>
          </div>
        </div>

        {/* Section 5: $25 Listing Order Summary & Stripe Checkout */}
        <div className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navyDark text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                Order Summary
              </span>
              <h3 className="text-xl font-extrabold text-white">YID MATCH 30-Day Listing</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-featured standard job listing with candidate resume tracking
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl font-extrabold text-white">$25.00</span>
              <span className="text-xs text-slate-400 block">USD • Flat One-Time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Active for 30 Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct Candidate Resumes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Stripe 256-bit Encrypted</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-base rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {loading ? "Redirecting to Stripe..." : "Proceed to $25 Payment via Stripe"}
              </span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-3 flex items-center justify-center space-x-1">
              <Lock className="w-3.5 h-3.5 inline text-slate-500" />
              <span>Payments are processed securely via Stripe. Test mode supported.</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
