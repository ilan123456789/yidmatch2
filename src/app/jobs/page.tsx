"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { formatJobAge, formatDbDate } from "@/lib/date-utils";

interface JobItem {
  id: number | string;
  icon?: string;
  title: string;
  company: string;
  location: string;
  country: string;
  category: string;
  pay: number;
  payText: string;
  type: string;
  age: string;
  desc: string;
  postedAt?: string;
  createdAt?: string;
  isSponsored?: boolean;
}

const JOB_CATEGORIES = [
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
  const { user, logout } = useAuth();

  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<(string | number)[]>([]);
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  // User Dropdown State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Filter States
  const [searchInput, setSearchInput] = useState(searchParams?.get("q") || "");
  const [locationSearch, setLocationSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get("category") || "");
  const [payFilter, setPayFilter] = useState("0");
  const [typeFilter, setTypeFilter] = useState("");

  // Pagination State (6 items per page, exactly as before)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Selected Job Details Modal
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Apply Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [appliedJob, setAppliedJob] = useState<JobItem | null>(null);
  const [applyName, setApplyName] = useState(user?.name || "");
  const [applyEmail, setApplyEmail] = useState(user?.email || "");
  const [applyPhone, setApplyPhone] = useState(user?.phone || "");
  const [applyNote, setApplyNote] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);

  // Resume Modal State
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState(user?.name || "");
  const [resumeEmail, setResumeEmail] = useState(user?.email || "");
  const [resumePhone, setResumePhone] = useState(user?.phone || "");
  const [resumeExp, setResumeExp] = useState("");
  const [resumeSkills, setResumeSkills] = useState("");
  const [resumeGenerated, setResumeGenerated] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-profile-menu-container")) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yidmatch_saved_jobs");
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Fetch jobs from /api/jobs & real-time Firestore sync
  useEffect(() => {
    let unsub: (() => void) | null = null;

    const loadFromApi = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.jobs)) {
            const mapped: JobItem[] = data.jobs.map((j: any, idx: number) => ({
              id: j.id || "job-" + Date.now() + "-" + idx,
              icon: j.icon || (j.isSponsored ? "⭐" : j.jobType?.includes("Same-Day") ? "⚡" : "💼"),
              title: j.title,
              company: j.company,
              location: j.location,
              country: j.location?.includes("Israel") ? "Israel" : j.location?.includes("UK") || j.location?.includes("London") ? "United Kingdom" : "United States",
              category: j.category || "General",
              pay: Number(j.salaryMin) || Number(j.pay) || 25,
              payText: j.salaryDisplay || j.payText || `$${j.salaryMin || 25}/hr`,
              type: j.jobType || j.type || "Full-time",
              age: formatJobAge(j.postedAt || j.createdAt),
              desc: j.description || j.desc || "",
              postedAt: j.postedAt || (j.createdAt ? formatDbDate(new Date(j.createdAt)) : undefined),
              createdAt: j.createdAt,
              isSponsored: Boolean(j.isSponsored || j.featured)
            }));
            setJobsList(mapped);

            // Check if URL hash has a direct job to open (e.g. #job-job-1794883356949 or #job-1794883356949)
            if (typeof window !== "undefined") {
              const hash = window.location.hash;
              const search = window.location.search;
              const jm = hash.match(/^#job-(.+)$/) || search.match(/[?&]job=([^&]+)/);
              if (jm) {
                const raw = jm[1];
                const clean = raw.replace(/^job-job-/, "job-");
                const bare = clean.replace(/^job-/, "");
                const matched = mapped.find((p) => {
                  const sid = String(p.id);
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
    };

    loadFromApi();

    // Firestore real-time listener
    const initFirestore = async () => {
      if (typeof window === "undefined") return;
      try {
        const { getClientFirestore } = await import("@/lib/firebase/client");
        const firestore = await getClientFirestore();
        if (!firestore) return;
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");
        const q = query(collection(firestore, "jobs"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const firestoreJobs: JobItem[] = snap.docs.map((doc) => {
              const d = doc.data();
              return {
                id: d.id || doc.id,
                icon: d.icon || (d.isSponsored ? "⭐" : d.type?.includes("Same-Day") ? "⚡" : "💼"),
                title: d.title || "Untitled Position",
                company: d.company || "Community Business",
                location: d.location || "Lakewood, NJ",
                country: d.country || "United States",
                category: d.category || "General",
                pay: Number(d.pay) || 25,
                payText: d.payText || `$${d.pay || 25}/hr`,
                type: d.type || "Full-time",
                age: formatJobAge(d.postedAt || d.createdAt || d.timestamp),
                desc: d.desc || "",
                postedAt: d.postedAt,
                createdAt: d.createdAt,
                isSponsored: Boolean(d.isSponsored || d.featured)
              };
            });
            setJobsList((prev) => {
              const seen = new Set(firestoreJobs.map((p) => `${p.title.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`));
              const remaining = prev.filter((p) => !seen.has(`${p.title.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`));
              return [...firestoreJobs, ...remaining];
            });

            // Auto-open job if hash matches
            const hash = window.location.hash;
            const jm = hash.match(/^#job-(.+)$/);
            if (jm) {
              const raw = jm[1];
              const clean = raw.replace(/^job-job-/, "job-");
              const bare = clean.replace(/^job-/, "");
              const match = firestoreJobs.find((p) => {
                const sid = String(p.id);
                return sid === clean || sid === raw || sid === `job-${bare}` || sid === bare || sid.includes(bare);
              });
              if (match) setSelectedJob(match);
            }
          }
        });
      } catch (_) {}
    };

    initFirestore();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Listen for hashchange
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        const jm = hash.match(/^#job-(.+)$/);
        if (jm) {
          const raw = jm[1];
          const clean = raw.replace(/^job-job-/, "job-");
          const bare = clean.replace(/^job-/, "");
          const match = jobsList.find((p) => {
            const sid = String(p.id);
            return sid === clean || sid === raw || sid === `job-${bare}` || sid === bare || sid.includes(bare);
          });
          if (match) {
            setSelectedJob(match);
          } else {
            fetch(`/api/jobs/${clean.startsWith("job-") ? clean : "job-" + clean}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.job) {
                  const fj = d.job;
                  setSelectedJob({
                    id: fj.id,
                    icon: fj.icon || (fj.isSponsored ? "⭐" : "💼"),
                    title: fj.title,
                    company: fj.company,
                    location: fj.location || fj.neighborhood || "Local",
                    country: fj.country || "United States",
                    category: fj.category || "General",
                    type: fj.jobType || "Full-Time",
                    pay: fj.pay || fj.salaryMin || 0,
                    payText: fj.payText || fj.salaryDisplay || (fj.pay ? `$${fj.pay}/hr` : "Competitive"),
                    desc: fj.description || "",
                    age: "Active",
                    isSponsored: Boolean(fj.isSponsored)
                  });
                }
              })
              .catch(console.error);
          }
        }
      }
    };

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [jobsList]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (!!selectedJob || applyModalOpen || resumeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob, applyModalOpen, resumeModalOpen]);

  // Save / Bookmark job
  const handleToggleSaveJob = (job: JobItem) => {
    let next: (string | number)[];
    if (savedJobs.includes(job.id)) {
      next = savedJobs.filter((id) => id !== job.id);
      showToast(`Removed "${job.title}" from saved jobs`);
    } else {
      next = [...savedJobs, job.id];
      showToast(`⭐ Saved "${job.title}"!`);
    }
    setSavedJobs(next);
    try {
      localStorage.setItem("yidmatch_saved_jobs", JSON.stringify(next));
    } catch (_) {}
  };

  // Open apply modal for a job
  const handleOpenApply = (job: JobItem) => {
    setAppliedJob(job);
    setApplyModalOpen(true);
    setSelectedJob(null);
  };

  // Submit job application
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appliedJob) return;

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: appliedJob.id,
          seekerId: user?.uid || "guest",
          seekerName: applyName.trim() || "Job Seeker",
          seekerEmail: applyEmail.trim(),
          seekerPhone: applyPhone.trim(),
          coverNote: applyNote.trim()
        })
      });

      if (res.ok) {
        setApplySubmitted(true);
        setTimeout(() => {
          setApplyModalOpen(false);
          setApplySubmitted(false);
          showToast("Application submitted successfully!");
        }, 1800);
      } else {
        showToast("Error submitting application. Please try again.");
      }
    } catch (_) {
      showToast("Network error submitting application.");
    }
  };

  // Filter & Sort Jobs (Featured always on top!)
  const filteredJobs = useMemo(() => {
    const q = searchInput.toLowerCase().trim();
    const loc = locationSearch.toLowerCase().trim();
    const min = Number(payFilter);

    const result = jobsList.filter((j) => {
      if (viewSavedOnly && !savedJobs.includes(j.id)) return false;
      const matchesQ =
        !q || (j.title + " " + j.company + " " + j.category + " " + j.desc).toLowerCase().includes(q);
      const matchesLoc = !loc || (j.location + " " + j.country).toLowerCase().includes(loc);
      const matchesPay = j.pay >= min;
      const matchesType = !typeFilter || j.type === typeFilter;
      const matchesCat = !categoryFilter || categoryFilter === "All Categories" || j.category.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesQ && matchesLoc && matchesPay && matchesType && matchesCat;
    });

    // Pinned sponsored jobs always show on front and top
    return result.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return 0;
    });
  }, [jobsList, searchInput, locationSearch, payFilter, typeFilter, categoryFilter, viewSavedOnly, savedJobs]);

  // Reset to page 1 whenever any search or filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, locationSearch, categoryFilter, payFilter, typeFilter, viewSavedOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const target = document.querySelector("#jobsList") || document.querySelector("#jobs");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderPagination = (key: string) => {
    if (totalPages <= 1) return null;

    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-bar" key={key}>
        <div className="pagination-info">
          Showing <b>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredJobs.length)}</b>–<b>{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}</b> of <b>{filteredJobs.length}</b> jobs
        </div>
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn pagination-arrow"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous Page"
          >
            ← Previous
          </button>
          <div className="pagination-numbers">
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`pagination-num ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pagination-btn pagination-arrow"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next Page"
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      <div className={`toast ${toastVisible ? "show" : ""}`} id="toast" role="status" aria-live="polite">
        {toastMessage}
      </div>

      {/* Floating Contact Owner Button */}
      <button
        type="button"
        className="contact-float-btn"
        id="floatingContactBtn"
        onClick={() => {
          window.location.href = "mailto:hiring@yidmatch.com?subject=Contact%20YidMatch";
        }}
        aria-label="Contact Us"
      >
        <span className="badge-dot" />
        <span className="contact-text-full">💬 Contact Us</span>
        <span className="contact-text-short">💬 Contact</span>
      </button>

      {/* TOPBAR - EXACT SAME AS PHOTO 2 */}
      <header className="topbar">
        <div className="shell nav" style={{ justifyContent: "space-between" }}>
          <Link className="brand" href="/" aria-label="YidMatch Home">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={180}
              height={60}
              className="topbar-brand-logo"
              priority
            />
          </Link>
          <div className="nav-actions">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="user-profile-menu-container" style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`auth-user-chip-btn ${userDropdownOpen ? "open" : ""}`}
                    id="userProfileTriggerBtn"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    title={user.email}
                    aria-label="User Profile and Settings"
                  >
                    <span className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                    </span>
                    <div className="user-name-role">
                      <span className="user-display-name">{user.name}</span>
                      <span className="auth-role-tag">
                        {user.role === "EMPLOYER" ? "Employer" : "Seeker"}
                      </span>
                    </div>
                    <span className={`dropdown-chevron ${userDropdownOpen ? "open" : ""}`}>▼</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="user-profile-dropdown-card" id="userProfileDropdown">
                      <div className="user-dropdown-header">
                        <div className="user-avatar-large">
                          {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <div className="user-dropdown-name">{user.name}</div>
                          <div className="user-dropdown-email">{user.email}</div>
                          <span className="user-dropdown-role-badge">
                            {user.role === "EMPLOYER" ? "🏢 Employer Account" : "💼 Job Seeker Account"}
                          </span>
                        </div>
                      </div>

                      <div className="user-dropdown-divider" />

                      <div className="user-dropdown-actions">
                        <Link
                          href="/"
                          className="user-dropdown-item-btn"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <span className="item-icon">🏠</span>
                          <div>
                            <div className="item-title">Home Portal</div>
                            <div className="item-sub">Go to main menu</div>
                          </div>
                        </Link>

                        <button
                          type="button"
                          className="user-dropdown-item-btn"
                          id="userDropdownCreateResumeBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setResumeModalOpen(true);
                          }}
                        >
                          <span className="item-icon">📄</span>
                          <div>
                            <div className="item-title">Create Resume</div>
                            <div className="item-sub">Build, view & download resume</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          className="user-dropdown-item-btn"
                          id="userDropdownSavedJobsBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setViewSavedOnly(true);
                            setTimeout(() => {
                              document.querySelector("#jobsList")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                          }}
                        >
                          <span className="item-icon">⭐</span>
                          <div>
                            <div className="item-title">Saved Jobs ({savedJobs.length})</div>
                            <div className="item-sub">View your bookmarked opportunities</div>
                          </div>
                        </button>

                        <div className="user-dropdown-divider" />

                        <button
                          type="button"
                          className="user-dropdown-item-btn logout"
                          id="userDropdownLogoutBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                        >
                          <span className="item-icon">🚪</span>
                          <div>
                            <div className="item-title" style={{ color: "#dc2626" }}>Logout</div>
                            <div className="item-sub">Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="topbar-resume-btn"
                  id="userTopbarResumeBtn"
                  onClick={() => setResumeModalOpen(true)}
                  title="Make a Resume"
                >
                  <span className="resume-icon">📄</span>
                  <span className="resume-text-full">Make a Resume</span>
                  <span className="resume-text-short">Resume</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="user-profile-menu-container" style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`auth-user-chip-btn ${userDropdownOpen ? "open" : ""}`}
                    id="guestProfileTriggerBtn"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    title="User Profile & Settings"
                  >
                    <span className="user-avatar-circle" style={{ background: "#64748b" }}>👤</span>
                    <div className="user-name-role">
                      <span className="user-display-name">My Profile</span>
                      <span className="auth-role-tag" style={{ background: "#f1f5f9", color: "#64748b" }}>Candidate</span>
                    </div>
                    <span className={`dropdown-chevron ${userDropdownOpen ? "open" : ""}`}>▼</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="user-profile-dropdown-card" id="userProfileDropdown">
                      <div className="user-dropdown-header">
                        <div className="user-avatar-large" style={{ background: "#64748b" }}>👤</div>
                        <div>
                          <div className="user-dropdown-name">Job Seeker</div>
                          <div className="user-dropdown-email">Heimish Candidate Profile</div>
                          <span className="user-dropdown-role-badge">Local Member</span>
                        </div>
                      </div>

                      <div className="user-dropdown-divider" />

                      <div className="user-dropdown-actions">
                        <button
                          type="button"
                          className="user-dropdown-item-btn"
                          id="guestDropdownCreateResumeBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setResumeModalOpen(true);
                          }}
                        >
                          <span className="item-icon">📄</span>
                          <div>
                            <div className="item-title">Create Resume</div>
                            <div className="item-sub">Build, view & download resume</div>
                          </div>
                        </button>

                        <div className="user-dropdown-divider" />

                        <Link
                          href="/login"
                          className="user-dropdown-item-btn"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <span className="item-icon">🔑</span>
                          <div>
                            <div className="item-title" style={{ color: "#1e72c8" }}>Sign In / Register</div>
                            <div className="item-sub">Sync applications and email alerts</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="topbar-resume-btn"
                  id="guestTopbarResumeBtn"
                  onClick={() => setResumeModalOpen(true)}
                  title="Make a Resume"
                >
                  <span className="resume-icon">📄</span>
                  <span className="resume-text-full">Make a Resume</span>
                  <span className="resume-text-short">Resume</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - EXACT SAME AS PHOTO 3 */}
      <main id="jobsPageMain">
        <section className="section" id="jobs" style={{ paddingTop: "24px" }}>
          <div className="shell">
            {/* Search Box */}
            <div className="search-card" style={{ marginBottom: "20px" }}>
              <div className="search-grid">
                <div className="search-input-wrap">
                  <span className="search-icon">🔎</span>
                  <input
                    type="text"
                    id="searchJobsInput"
                    placeholder="Job title, keywords, or company..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <div className="search-input-wrap">
                  <span className="search-icon">📍</span>
                  <input
                    type="text"
                    id="locationSearchInput"
                    placeholder="Location (e.g. Lakewood, Brooklyn)..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid #dfe7ef",
                    padding: "0 14px",
                    background: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none"
                  }}
                >
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat === "All Categories" ? "" : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* All Jobs vs Saved Jobs Switcher */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
              <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "10px", padding: "3px" }}>
                <button
                  type="button"
                  onClick={() => setViewSavedOnly(false)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 750,
                    border: "none",
                    cursor: "pointer",
                    background: !viewSavedOnly ? "#ffffff" : "transparent",
                    color: !viewSavedOnly ? "#092040" : "#64748b",
                    boxShadow: !viewSavedOnly ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  💼 All Jobs ({jobsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewSavedOnly(true)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 750,
                    border: "none",
                    cursor: "pointer",
                    background: viewSavedOnly ? "#ffffff" : "transparent",
                    color: viewSavedOnly ? "#092040" : "#64748b",
                    boxShadow: viewSavedOnly ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>⭐ Saved Jobs</span>
                  <span
                    style={{
                      background: viewSavedOnly ? "#dbeafe" : "#e2e8f0",
                      color: viewSavedOnly ? "#1e40af" : "#475569",
                      padding: "1px 7px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 800
                    }}
                  >
                    {savedJobs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Top Pagination */}
            {renderPagination("top")}

            {/* Job Listings: LONG STRIPS with FEATURED AT TOP - EXACT SAME AS PHOTO 3 */}
            <div className="jobs-list" id="jobsList">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#647b8c" }}>
                  Loading job opportunities...
                </div>
              ) : paginatedJobs.length > 0 ? (
                paginatedJobs.map((j) => (
                  <article
                    key={j.id}
                    className="panel job-card"
                    data-id={j.id}
                    style={
                      j.isSponsored
                        ? { border: "2px solid #f59e0b", background: "#fffdfa" }
                        : undefined
                    }
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0 }}>{j.title}</h3>
                        {j.isSponsored && (
                          <span
                            style={{
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "#ffffff",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "10.5px",
                              fontWeight: 850,
                              letterSpacing: "0.03em"
                            }}
                          >
                            ⭐ SPONSORED
                          </span>
                        )}
                      </div>
                      <div className="meta">
                        <span>{j.company}</span>
                        <span>•</span>
                        <span>📍 {j.location}</span>
                        <span className="tag">{j.type}</span>
                        <span className="category-pill">{j.category}</span>
                      </div>
                      <p style={{ color: "#677a80", lineHeight: 1.5, margin: "10px 0 0" }}>
                        {j.desc}
                      </p>
                    </div>
                    <div className="side">
                      <div className="salary">{j.payText}</div>
                      <div className="age">{j.age}</div>
                      <div className="job-card-actions">
                        <button
                          type="button"
                          className="btn btn-primary job-action-btn"
                          id={`applyJobBtn-${j.id}`}
                          onClick={() => handleOpenApply(j)}
                        >
                          Apply Now
                        </button>
                        <button
                          type="button"
                          className="btn btn-light job-action-btn"
                          id={`viewJobBtn-${j.id}`}
                          onClick={() => setSelectedJob(j)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className={`btn ${savedJobs.includes(j.id) ? "btn-warning" : "btn-light"} job-action-btn`}
                          id={`saveJobBtn-${j.id}`}
                          onClick={() => handleToggleSaveJob(j)}
                          title={savedJobs.includes(j.id) ? "Remove from saved jobs" : "Save this job"}
                          style={{
                            fontSize: "12.5px",
                            padding: "6px 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: savedJobs.includes(j.id) ? "#fef3c7" : undefined,
                            color: savedJobs.includes(j.id) ? "#92400e" : undefined,
                            borderColor: savedJobs.includes(j.id) ? "#fde68a" : undefined
                          }}
                        >
                          <span>{savedJobs.includes(j.id) ? "⭐ Saved" : "☆ Save"}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#647b8c" }}>
                  <p>No jobs found matching your criteria.</p>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setSearchInput("");
                      setLocationSearch("");
                      setCategoryFilter("");
                      setPayFilter("0");
                      setTypeFilter("");
                      setViewSavedOnly(false);
                    }}
                    style={{ marginTop: "12px" }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Pagination */}
            {renderPagination("bottom")}
          </div>
        </section>
      </main>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div
          className="modal open"
          id="jobModal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "jobModal") setSelectedJob(null);
          }}
        >
          <div className="modal-box">
            <div className="modal-head">
              <strong>Job Details</strong>
              <button
                type="button"
                className="close"
                id="closeModal"
                onClick={() => setSelectedJob(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" id="modalBody">
              <h3>{selectedJob.title}</h3>
              <div style={{ color: "#6e8086" }}>
                {selectedJob.company} · {selectedJob.location}
              </div>
              <div className="details-grid">
                <div className="detail">
                  <b>PAY</b>
                  {selectedJob.payText}
                </div>
                <div className="detail">
                  <b>SCHEDULE</b>
                  {selectedJob.type}
                </div>
                <div className="detail">
                  <b>STATUS</b>
                  Approved
                </div>
              </div>
              <h4>Job Description</h4>
              <p style={{ lineHeight: 1.65, color: "#5d7279", whiteSpace: "pre-line" }}>
                {selectedJob.desc}
              </p>

              {/* Direct Employer Contact Bar (WhatsApp, Phone, Email) */}
              {(() => {
                const contact = getJobContactInfo(selectedJob);
                return (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 14px",
                      background: "#f0f7ff",
                      border: "1px solid #d0e5f8",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#0c3365" }}>
                        ⚡ Direct Contact Available
                      </div>
                      <div style={{ fontSize: "12px", color: "#546e7a" }}>
                        WhatsApp, Phone &amp; Email direct to employer
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a
                        href={contact.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="direct-btn direct-btn-wa"
                        style={{ padding: "8px 14px", fontSize: "12.5px" }}
                      >
                        <span>💬</span> WhatsApp
                      </a>
                      <a
                        href={`tel:${contact.phoneRaw}`}
                        className="direct-btn direct-btn-phone"
                        style={{ padding: "8px 14px", fontSize: "12.5px" }}
                      >
                        <span>📞</span> Call
                      </a>
                      <a
                        href={`mailto:${contact.email}?subject=${encodeURIComponent("Job Application: " + selectedJob.title)}`}
                        className="direct-btn direct-btn-email"
                        style={{ padding: "8px 14px", fontSize: "12.5px" }}
                      >
                        <span>✉️</span> Email
                      </a>
                    </div>
                  </div>
                );
              })()}

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenApply(selectedJob)}
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {applyModalOpen && appliedJob && (
        <div
          className="modal open"
          id="applyModal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "applyModal") setApplyModalOpen(false);
          }}
        >
          <div className="modal-box">
            <div className="modal-head">
              <strong>Apply for {appliedJob.title}</strong>
              <button
                type="button"
                className="close"
                onClick={() => setApplyModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {applySubmitted ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
                  <h3 style={{ margin: "0 0 6px" }}>Application Submitted!</h3>
                  <p style={{ color: "#647b8c", fontSize: "14px" }}>
                    Your application has been received by {appliedJob.company}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. (732) 555-0199"
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Cover Note / Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Brief note about your relevant background..."
                      value={applyNote}
                      onChange={(e) => setApplyNote(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }}>
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESUME MAKER MODAL */}
      {resumeModalOpen && (
        <div
          className="modal open"
          id="resumeModal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "resumeModal") setResumeModalOpen(false);
          }}
        >
          <div className="modal-box">
            <div className="modal-head">
              <strong>📄 Make a Resume</strong>
              <button
                type="button"
                className="close"
                onClick={() => setResumeModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {resumeGenerated ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📄</div>
                  <h3 style={{ margin: "0 0 6px" }}>Resume Generated!</h3>
                  <p style={{ color: "#647b8c", fontSize: "14px", marginBottom: "16px" }}>
                    Your resume has been formatted and saved to your profile.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setResumeGenerated(false);
                      setResumeModalOpen(false);
                      showToast("Resume ready!");
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResumeGenerated(true);
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mendy Goldberg"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={resumeEmail}
                        onChange={(e) => setResumeEmail(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Phone</label>
                      <input
                        type="tel"
                        placeholder="(732) 555-0199"
                        value={resumePhone}
                        onChange={(e) => setResumePhone(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Work Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Recent jobs, companies, dates and key achievements..."
                      value={resumeExp}
                      onChange={(e) => setResumeExp(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    ></textarea>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Key Skills</label>
                    <input
                      type="text"
                      placeholder="e.g. QuickBooks, Excel, Customer Service, Bilingual Yiddish/English"
                      value={resumeSkills}
                      onChange={(e) => setResumeSkills(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dfe7ef" }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }}>
                    Generate Resume
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsDirectoryContent />
    </Suspense>
  );
}
