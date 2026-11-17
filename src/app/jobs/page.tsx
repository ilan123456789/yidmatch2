"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Bell,
  ArrowLeft,
  Bookmark,
  Share2,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter
} from "lucide-react";

const CATEGORY_OPTIONS = [
  "All Categories",
  "Accounting",
  "Administration",
  "Sales",
  "Customer Service",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Construction",
  "Driving",
  "Warehouse",
  "IT / Tech",
  "Design",
  "Marketing",
  "Real Estate",
  "Healthcare",
  "Education",
  "Food Service",
  "Retail",
  "Security",
  "Management",
  "Other"
];

const LOCATION_OPTIONS = [
  "All Locations",
  "Lakewood, NJ",
  "Brooklyn, NY",
  "Monsey, NY",
  "Five Towns, NY",
  "Passaic, NJ",
  "Crown Heights, NY",
  "Williamsburg, NY",
  "Boro Park, NY",
  "Remote",
  "Other"
];

function JobsDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertName, setAlertName] = useState("");
  const [alertCategory, setAlertCategory] = useState("Administration");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("yidmatch_saved_jobs");
      if (stored) {
        setSavedJobs(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  // Fetch jobs from API
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.jobs)) {
            setJobs(data.jobs);
          }
        }
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let next: string[];
    if (savedJobs.includes(id)) {
      next = savedJobs.filter((item) => item !== id);
      showToast("Job removed from saved");
    } else {
      next = [...savedJobs, id];
      showToast("Job saved to your list!");
    }
    setSavedJobs(next);
    try {
      localStorage.setItem("yidmatch_saved_jobs", JSON.stringify(next));
    } catch (_) {}
  };

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Saved filter
      if (viewSavedOnly && !savedJobs.includes(job.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          (job.category && job.category.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== "All Categories") {
        const cat = selectedCategory.toLowerCase();
        const jobCat = (job.category || "").toLowerCase();
        const jobTitle = job.title.toLowerCase();
        if (!jobCat.includes(cat) && !jobTitle.includes(cat)) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation && selectedLocation !== "All Locations") {
        const loc = selectedLocation.toLowerCase();
        const jobLoc = (job.location || "").toLowerCase();
        const jobNeigh = (job.neighborhood || "").toLowerCase();
        if (!jobLoc.includes(loc.split(",")[0].trim().toLowerCase()) && !jobNeigh.includes(loc.split(",")[0].trim().toLowerCase())) {
          return false;
        }
      }

      // Job Type filter
      if (selectedType && selectedType !== "All Types") {
        if (job.jobType !== selectedType) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchQuery, selectedCategory, selectedLocation, selectedType, viewSavedOnly, savedJobs]);

  const handleSubscribeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;

    setAlertSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail.trim(),
          name: alertName.trim() || undefined,
          interests: [alertCategory],
          active: true,
        }),
      });

      if (res.ok) {
        setAlertSuccess(true);
        setTimeout(() => {
          setAlertModalOpen(false);
          setAlertSuccess(false);
          setAlertEmail("");
        }, 2200);
      } else {
        showToast("Could not subscribe. Please try again.");
      }
    } catch (err) {
      showToast("Subscription error. Please try again.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-in flex items-center space-x-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-36 h-10">
                <Image
                  src="/logo.png"
                  alt="Yid Match"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 text-sm font-medium">
              <Link href="/" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                ← Home
              </Link>
              <Link href="/jobs" className="px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue font-bold">
                All Jobs
              </Link>
              <Link href="/same-day-gigs" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                ⚡ Daily Gigs
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Bell className="w-4 h-4 text-brand-blue" />
              <span>Job Alerts</span>
            </button>

            <Link
              href="/post-job"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navy/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-navy/20 transition-all hover:scale-[1.02]"
            >
              <span>Post a Job ($35)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-b from-blue-50/60 to-transparent py-10 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-blue font-bold text-xs uppercase tracking-wider mb-2">
                <span>✦ Jewish Community Job Board</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Explore Available Jobs
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Browse verified, heimish job openings across Lakewood, Brooklyn, Monsey, and beyond.
              </p>
            </div>

            {/* Quick Stats & Saved Tab */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
              <button
                onClick={() => setViewSavedOnly(false)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  !viewSavedOnly
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setViewSavedOnly(true)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  viewSavedOnly
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>⭐ Saved</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
                  {savedJobs.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type */}
              <div className="md:col-span-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
                >
                  <option value="All Types">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Active Filters / Reset */}
            {(searchQuery || selectedCategory !== "All Categories" || selectedLocation !== "All Locations" || selectedType !== "All Types") && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {filteredJobs.length} result{filteredJobs.length === 1 ? "" : "s"}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                    setSelectedLocation("All Locations");
                    setSelectedType("All Types");
                  }}
                  className="text-brand-blue font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Reset all filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Listings Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"></div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl font-bold">
              🔍
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">No jobs found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              There are currently no job postings matching your selected filters. Try broadening your search or resetting filters.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Categories");
                  setSelectedLocation("All Locations");
                  setSelectedType("All Types");
                  setViewSavedOnly(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const cleanId = job.id.replace(/^job-job-/, "job-");
              const isSaved = savedJobs.includes(job.id);

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden group ${
                    job.isSponsored
                      ? "border-amber-300 ring-1 ring-amber-200 shadow-amber-500/5 bg-amber-50/20"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Category Pill & Save Button */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-brand-blue border border-blue-100">
                        {job.category || "General"}
                      </span>
                      {job.isSponsored && (
                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                          ⭐ Featured
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`ml-auto p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-amber-50 border-amber-200 text-amber-500"
                            : "border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        }`}
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <Link href={`/jobs/${cleanId}`} className="group-hover:text-brand-blue transition-colors">
                        <h2 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                          {job.title}
                        </h2>
                      </Link>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.company}</span>
                      </div>
                    </div>

                    {/* Metadata: Location, Pay, Type */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location || job.neighborhood || "Local"}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">
                          {job.salaryDisplay || job.payText || (job.pay ? `$${job.pay}/hr` : "Competitive")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.jobType || "Full-Time"}</span>
                      </div>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Card Footer: View Details & Apply */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/jobs/${cleanId}`}
                      className="w-full text-center py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      View Details & Apply →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Job Alert Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setAlertModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {alertSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">You're Subscribed!</h3>
                <p className="text-sm text-slate-600">
                  We'll send you an instant email notification whenever a matching job opens up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribeAlert} className="space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Get Instant Job Alerts</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Receive an email as soon as new jobs matching your career interests are posted.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Yossi Goldberg"
                      value={alertName}
                      onChange={(e) => setAlertName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Industry</label>
                    <select
                      value={alertCategory}
                      onChange={(e) => setAlertCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
                    >
                      {CATEGORY_OPTIONS.filter((c) => c !== "All Categories").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={alertSubmitting}
                    className="w-full py-3 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-lg shadow-brand-navy/20 transition-all hover:scale-[1.01] disabled:opacity-50 text-sm"
                  >
                    {alertSubmitting ? "Activating Alerts..." : "Activate Job Alerts"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <JobsDirectoryContent />
    </Suspense>
  );
}
