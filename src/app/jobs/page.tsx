"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Bell,
  Bookmark,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle2,
  Share2
} from "lucide-react";

const CATEGORY_OPTIONS = [
  "All Categories",
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
  "Same-Day / Short-term",
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

function getJobContactInfo(job: { title: string; company: string; country?: string; location: string }) {
  const companySlug = (job.company || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  let phone = "+1 (732) 555-0144";
  let phoneRaw = "17325550144";
  let email = `jobs@${companySlug || "yidmatch"}.com`;

  const loc = (job.location || "").toLowerCase();
  const ctry = (job.country || "").toLowerCase();

  if (ctry.includes("kingdom") || loc.includes("london") || loc.includes("manchester")) {
    phone = "+44 20 7946 0192";
    phoneRaw = "442079460192";
    email = `careers@${companySlug || "yidmatch"}.co.uk`;
  } else if (ctry.includes("israel") || loc.includes("jerusalem") || loc.includes("shemesh")) {
    phone = "+972 2-555-0188";
    phoneRaw = "97225550188";
    email = `jobs@${companySlug || "yidmatch"}.co.il`;
  } else if (loc.includes("brooklyn") || loc.includes("boro park") || loc.includes("williamsburg") || loc.includes("crown heights")) {
    phone = "+1 (718) 555-0182";
    phoneRaw = "17185550182";
    email = `hiring@${companySlug || "yidmatch"}.com`;
  } else if (loc.includes("monsey") || loc.includes("rockland")) {
    phone = "+1 (845) 555-0163";
    phoneRaw = "18455550163";
    email = `hr@${companySlug || "yidmatch"}.com`;
  } else if (loc.includes("lakewood") || loc.includes("nj")) {
    phone = "+1 (732) 555-0199";
    phoneRaw = "17325550199";
    email = `office@${companySlug || "yidmatch"}.com`;
  }

  const cleanDigits = phoneRaw.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Shalom! I saw your listing for "${job.title}" at ${job.company} on YidMatch and I would like to apply.`
  );
  const whatsappUrl = `https://wa.me/${cleanDigits}?text=${whatsappMessage}`;

  return { phone, phoneRaw: cleanDigits, email, whatsappUrl };
}

function JobsDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");

  // Selected Job Modal (for direct view & apply)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application subform
  const [applicantName, setApplicantName] = useState(user?.name || "");
  const [applicantEmail, setApplicantEmail] = useState(user?.email || "");
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "");
  const [coverNote, setCoverNote] = useState("");
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertName, setAlertName] = useState("");
  const [alertCategory, setAlertCategory] = useState("Administration & Office");
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

            // Check if URL hash or query matches a direct job
            if (typeof window !== "undefined") {
              const hash = window.location.hash;
              const search = window.location.search;
              const jm = hash.match(/^#job-(.+)$/) || search.match(/[?&]job=([^&]+)/);
              if (jm) {
                const raw = jm[1];
                const clean = raw.replace(/^job-job-/, "job-");
                const bare = clean.replace(/^job-/, "");
                const matched = data.jobs.find((j: Job) => {
                  const sid = String(j.id);
                  return sid === clean || sid === raw || sid === `job-${bare}` || sid === bare || sid.includes(bare);
                });
                if (matched) {
                  setSelectedJob(matched);
                }
              }
            }
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

  // Listen for hash changes
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        const jm = hash.match(/^#job-(.+)$/);
        if (jm) {
          const raw = jm[1];
          const clean = raw.replace(/^job-job-/, "job-");
          const bare = clean.replace(/^job-/, "");
          const matched = jobs.find((j) => {
            const sid = String(j.id);
            return sid === clean || sid === raw || sid === `job-${bare}` || sid === bare || sid.includes(bare);
          });
          if (matched) {
            setSelectedJob(matched);
          } else {
            // Fetch directly from API
            fetch(`/api/jobs/${clean.startsWith("job-") ? clean : "job-" + clean}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.job) setSelectedJob(d.job);
              })
              .catch(console.error);
          }
        }
      }
    };

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [jobs]);

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

  // Filtered and Sorted Jobs
  const filteredAndSortedJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
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
        const loc = selectedLocation.toLowerCase().split(",")[0].trim();
        const jobLoc = (job.location || "").toLowerCase();
        const jobNeigh = (job.neighborhood || "").toLowerCase();
        if (!jobLoc.includes(loc) && !jobNeigh.includes(loc)) {
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

    // Sort: Featured / Sponsored jobs at the very top!
    return filtered.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;

      // Then sort by newest created date
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [jobs, searchQuery, selectedCategory, selectedLocation, selectedType, viewSavedOnly, savedJobs]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setSubmittingApply(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          seekerId: user?.uid || "guest",
          seekerName: applicantName.trim() || "Job Seeker",
          seekerEmail: applicantEmail.trim(),
          seekerPhone: applicantPhone.trim(),
          coverNote: coverNote.trim(),
        }),
      });

      if (res.ok) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setSelectedJob(null);
          showToast("Application submitted successfully!");
        }, 2000);
      } else {
        showToast("Error submitting application. Please try again.");
      }
    } catch (err) {
      showToast("Network error submitting application.");
    } finally {
      setSubmittingApply(false);
    }
  };

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
    <div className="min-h-screen bg-[#f8fbfa] text-slate-900 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#081c3b] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
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
              <Link href="/jobs" className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-brand-blue font-bold">
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
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#081c3b] hover:bg-[#0c2a59] text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Post a Job ($35)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-b from-blue-50/70 to-transparent py-10 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-blue font-bold text-xs uppercase tracking-wider mb-2">
                <span>✦ Jewish Community Job Board</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#081c3b] tracking-tight">
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
                    ? "bg-[#081c3b] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setViewSavedOnly(true)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  viewSavedOnly
                    ? "bg-[#081c3b] text-white shadow-sm"
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
                  <option value="Same-Day / Short-term">⚡ Same-Day</option>
                </select>
              </div>
            </div>

            {/* Active Filters / Reset */}
            {(searchQuery || selectedCategory !== "All Categories" || selectedLocation !== "All Locations" || selectedType !== "All Types") && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {filteredAndSortedJobs.length} result{filteredAndSortedJobs.length === 1 ? "" : "s"}
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

      {/* Main Job Listings - LONG HORIZONTAL STRIPS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"></div>
            ))}
          </div>
        ) : filteredAndSortedJobs.length === 0 ? (
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
          <div className="space-y-4">
            {filteredAndSortedJobs.map((job) => {
              const cleanId = String(job.id).replace(/^job-job-/, "job-");
              const isSaved = savedJobs.includes(job.id);
              const salaryText =
                job.salaryDisplay || job.payText || (job.pay ? `$${job.pay}/hr` : "Competitive");

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:border-brand-blue/50 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer relative group ${
                    job.isSponsored
                      ? "border-amber-300 ring-2 ring-amber-300/40 bg-gradient-to-r from-amber-50/50 via-white to-white shadow-sm"
                      : "border-slate-200"
                  }`}
                >
                  {/* Left Column: Title, Badges, Meta, Description */}
                  <div className="flex-1 space-y-2.5">
                    {/* Badge Row */}
                    <div className="flex items-center flex-wrap gap-2">
                      {job.isSponsored && (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                          <span>⭐</span>
                          <span>FEATURED</span>
                        </span>
                      )}
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-brand-blue border border-blue-100">
                        {job.category || "General"}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {job.jobType || "Full-Time"}
                      </span>
                    </div>

                    {/* Job Title */}
                    <div>
                      <h2 className="text-xl font-extrabold text-[#081c3b] group-hover:text-brand-blue transition-colors">
                        {job.title}
                      </h2>
                    </div>

                    {/* Company, Location, Date Meta */}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-semibold">
                      <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                        <Building2 className="w-4 h-4 text-brand-blue shrink-0" />
                        <span>{job.company}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{job.location || job.neighborhood || "Local"}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center space-x-1.5 text-slate-500 font-normal">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}</span>
                      </div>
                    </div>

                    {/* Snippet Description */}
                    {job.description && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 leading-relaxed max-w-3xl pt-1">
                        {job.description}
                      </p>
                    )}

                    {/* Heimish Perks Badges (if any) */}
                    {job.heimishPerks && job.heimishPerks.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1.5 pt-1">
                        {job.heimishPerks.slice(0, 3).map((perk, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center space-x-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>{perk}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Salary, View Button, Bookmark */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-lg sm:text-xl font-extrabold text-[#081c3b]">
                        {salaryText}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {job.salaryType ? `Per ${job.salaryType}` : "Compensation"}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          isSaved
                            ? "bg-amber-50 border-amber-300 text-amber-500 shadow-sm"
                            : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        }`}
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-[#081c3b] hover:bg-brand-blue text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center space-x-1.5"
                      >
                        <span>View Details & Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedJob(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-brand-blue px-2.5 py-1 rounded-md">
                  {selectedJob.category || "General"}
                </span>
                {selectedJob.isSponsored && (
                  <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-md uppercase">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Job Title & Company */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081c3b] leading-tight">
                  {selectedJob.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-slate-600 text-sm mt-2 font-medium">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-brand-blue" />
                    <span>{selectedJob.company}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{selectedJob.location || selectedJob.neighborhood || "Local"}</span>
                  </span>
                  <span>•</span>
                  <span className="text-brand-navy font-bold">
                    {selectedJob.salaryDisplay || selectedJob.payText || (selectedJob.pay ? `$${selectedJob.pay}/hr` : "Competitive")}
                  </span>
                </div>
              </div>

              {/* Direct Employer Contact Bar (WhatsApp, Phone, Email) */}
              {(() => {
                const contact = getJobContactInfo(selectedJob);
                return (
                  <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-brand-navy flex items-center space-x-1.5">
                        <span>⚡</span>
                        <span>Direct Employer Contact Available</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={contact.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp Direct</span>
                      </a>
                      <a
                        href={`tel:${contact.phoneRaw}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${contact.email}?subject=${encodeURIComponent("Application for " + selectedJob.title)}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs transition-colors shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Email Employer</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Job Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Heimish Environment Perks */}
              {selectedJob.heimishPerks && selectedJob.heimishPerks.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Heimish Environment Perks</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedJob.heimishPerks.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/70 text-xs font-semibold text-slate-800"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Application Form */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Apply Online Through YidMatch
                </h4>

                {applySuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2 text-green-800">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-600" />
                    <div className="font-bold text-sm">Application Sent!</div>
                    <div className="text-xs text-green-700">The employer has received your details.</div>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="e.g. Mendy Klein"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Your Email Address *</label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="e.g. (732) 555-0199"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Short Note / Introduction</label>
                      <textarea
                        rows={2}
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Brief summary of your background or experience..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submittingApply}
                        className="w-full py-3 bg-[#081c3b] hover:bg-brand-blue text-white font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{submittingApply ? "Sending Application..." : "Submit Application"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOB ALERT MODAL */}
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
                    className="w-full py-3 bg-[#081c3b] hover:bg-[#0c2a59] text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 text-sm"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fbfa] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <JobsDirectoryContent />
    </Suspense>
  );
}
