"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

const HOURS_24_OPTIONS = [
  "12:00 AM (Midnight)",
  "12:30 AM",
  "1:00 AM",
  "1:30 AM",
  "2:00 AM",
  "2:30 AM",
  "3:00 AM",
  "3:30 AM",
  "4:00 AM",
  "4:30 AM",
  "5:00 AM",
  "5:30 AM",
  "6:00 AM",
  "6:30 AM",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM (Noon)",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
];

const CATEGORIES = [
  "Accounting & Finance",
  "Administration & Office",
  "Sales",
  "Customer Service",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Construction & Trades",
  "Driving & Delivery",
  "Warehouse & Logistics",
  "IT & Technology",
  "Design & Creative",
  "Marketing",
  "Real Estate & Property Management",
  "Healthcare",
  "Education",
  "Food Service",
  "Retail",
  "Security",
  "Management",
  "Cleaning & Maintenance",
  "Manufacturing",
  "Legal",
  "Nonprofit / Community",
  "Same-Day / Short-term",
  "Other"
];

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.companyName || "");
  const [category, setCategory] = useState("Administration & Office");
  const [neighborhood, setNeighborhood] = useState("Lakewood, NJ");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<string>("Full-Time");

  // Hours
  const [hoursStart, setHoursStart] = useState("9:00 AM");
  const [hoursEnd, setHoursEnd] = useState("5:00 PM");

  // Pay
  const [salaryRate, setSalaryRate] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryType, setSalaryType] = useState<string>("Year");

  // Description & Requirements
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!title.trim() || !company.trim()) {
        setError("Please enter a job title and company name.");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 2) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 3) {
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 4) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!description.trim()) {
      setError("Please provide a job description.");
      return;
    }
    if (!employerEmail.trim()) {
      setError("Please provide an employer notification email.");
      return;
    }

    setLoading(true);

    try {
      const requirements = requirementsText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const numericPay = (salaryRate || salaryMin) ? Number((salaryRate || salaryMin).replace(/[^0-9.]/g, "")) : undefined;
      const formattedSalary = numericPay
        ? (salaryType === "Hour" ? `$${numericPay}/hr` : `$${numericPay.toLocaleString()}/yr`)
        : "Competitive";

      const finalDescription = `${description}\n\nWork Hours: ${hoursStart} - ${hoursEnd}`;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          category,
          neighborhood,
          location: location || neighborhood,
          jobType,
          pay: numericPay,
          salaryMin: numericPay,
          salaryType,
          salaryDisplay: formattedSalary,
          payText: formattedSalary,
          description: finalDescription,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-32 h-9">
              <Image src="/logo.png" alt="Yid Match" fill className="object-contain" priority />
            </div>
          </Link>
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <Link href="/jobs" className="text-slate-600 hover:text-slate-900 font-semibold">
              ← Browse Jobs
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-brand-blue">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Post a Job Listing • Flat $35 Fee</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reach Verified Heimish Job Seekers
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Step-by-step listing creation. No endless scrolling.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span className={step >= 1 ? "text-brand-blue" : ""}>1. Role Overview</span>
            <span className={step >= 2 ? "text-brand-blue" : ""}>2. Hours & Pay</span>
            <span className={step >= 3 ? "text-brand-blue" : ""}>3. Heimish Perks</span>
            <span className={step >= 4 ? "text-brand-blue" : ""}>4. Description & Pay</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-blue h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-2 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleNextStep}>
          {/* STEP 1: Position Overview */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Step 1 of 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-brand-blue" />
                  <span>Position Overview</span>
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Charge Bookkeeper, E-Commerce Account Manager..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gevaldig Enterprises"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Industry / Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Employment Type *</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Same-Day / Short-term">⚡ Same-Day / Daily Gig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Primary Community *</label>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      {NEIGHBORHOOD_OPTIONS.filter((n) => n !== "All Locations").map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specific Location Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Clifton Ave, Lakewood, NJ or Ave J, Flatbush"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 text-sm"
                >
                  <span>Continue to Hours & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Work Hours & Pay */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Step 2 of 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-brand-blue" />
                  <span>Work Hours & Compensation</span>
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                {/* 24-Hour System Dropdown with AM/PM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shift Start Time (AM / PM)</label>
                    <select
                      value={hoursStart}
                      onChange={(e) => setHoursStart(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      {HOURS_24_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shift End Time (AM / PM)</label>
                    <select
                      value={hoursEnd}
                      onChange={(e) => setHoursEnd(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      {HOURS_24_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pay rate and frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Salary / Pay Rate ($)</label>
                    <input
                      type="text"
                      placeholder="e.g. 75,000 or 35"
                      value={salaryRate || salaryMin}
                      onChange={(e) => {
                        setSalaryRate(e.target.value);
                        setSalaryMin(e.target.value);
                      }}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pay Frequency</label>
                    <select
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none bg-white font-medium cursor-pointer"
                    >
                      <option value="Year">Per Year ($/yr)</option>
                      <option value="Hour">Per Hour ($/hr)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 text-sm"
                >
                  <span>Continue to Heimish Perks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Heimish Environment Perks */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Step 3 of 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span>Heimish Environment Perks</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select all cultural and religious accommodations your workplace offers to build trust with candidates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {HEIMISH_PERK_OPTIONS.map((perk) => {
                  const selected = selectedPerks.includes(perk);
                  return (
                    <div
                      key={perk}
                      onClick={() => togglePerk(perk)}
                      className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                        selected
                          ? "bg-amber-50/80 border-amber-300 text-slate-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {}}
                        className="w-4 h-4 text-brand-blue rounded border-slate-300 pointer-events-none"
                      />
                      <span className="text-xs sm:text-sm">{perk}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 text-sm"
                >
                  <span>Continue to Description</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Description, Email & $35 Stripe Checkout */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Step 4 of 4</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-brand-blue" />
                    <span>Job Description & Notifications</span>
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Job Description *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe the day-to-day responsibilities, workplace atmosphere, and growth opportunity..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                      autoFocus
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Candidate Requirements (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Example:&#10;3+ years of QuickBooks experience&#10;Proficiency in Excel&#10;Punctual and reliable"
                      value={requirementsText}
                      onChange={(e) => setRequirementsText(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Employer Email (Where candidate applications will be sent) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="hiring@yourcompany.com"
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-brand-blue font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary & Stripe Checkout */}
              <div className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navyDark text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                      Order Summary
                    </span>
                    <h3 className="text-xl font-extrabold text-white">YID MATCH Job Listing</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      30-Day Listing + Email notifications to matched candidates
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-extrabold text-white">$35.00</span>
                    <span className="text-xs text-slate-400 block">USD • Flat One-Time</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Active for 30 Days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Direct Candidate Resumes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Stripe 256-bit Encrypted</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2.5 text-slate-300 hover:text-white font-bold text-sm flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-4 px-6 bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-base rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {loading ? "Redirecting to Stripe..." : "Proceed to $35 Payment via Stripe"}
                    </span>
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
