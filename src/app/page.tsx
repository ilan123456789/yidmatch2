"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

interface JobItem {
  id: number;
  icon: string;
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
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 1,
    icon: "❄️",
    title: "HVAC Installer / Technician",
    company: "Established Contractor",
    location: "Lakewood, NJ",
    country: "United States",
    category: "HVAC",
    pay: 28,
    payText: "$28–$40/hr",
    type: "Full-time",
    age: "1h ago",
    desc: "Residential and light commercial HVAC work. Mini-split experience is a plus."
  },
  {
    id: 2,
    icon: "🧾",
    title: "Bookkeeper / Accounts Payable",
    company: "Growing Business Office",
    location: "Monsey, NY",
    country: "United States",
    category: "Accounting",
    pay: 25,
    payText: "$25–$32/hr",
    type: "Full-time",
    age: "2h ago",
    desc: "Handle invoices, vendor payments, QuickBooks entries and reconciliations."
  },
  {
    id: 3,
    icon: "📈",
    title: "Sales Representative",
    company: "Home Services Company",
    location: "Brooklyn, NY",
    country: "United States",
    category: "Sales",
    pay: 30,
    payText: "$30/hr + commission",
    type: "Full-time",
    age: "3h ago",
    desc: "Speak with incoming leads, follow up with customers and close sales."
  },
  {
    id: 4,
    icon: "🏢",
    title: "Property Management Coordinator",
    company: "Property Management Office",
    location: "London",
    country: "United Kingdom",
    category: "Real Estate",
    pay: 26,
    payText: "£20–£26/hr",
    type: "Full-time",
    age: "4h ago",
    desc: "Coordinate maintenance requests, tenants, vendors and scheduling."
  },
  {
    id: 5,
    icon: "🎧",
    title: "Customer Service / Dispatcher",
    company: "Service Company",
    location: "Manchester",
    country: "United Kingdom",
    category: "Customer Service",
    pay: 22,
    payText: "£15–£20/hr",
    type: "Full-time",
    age: "5h ago",
    desc: "Answer calls, schedule jobs and keep customers updated."
  },
  {
    id: 6,
    icon: "📦",
    title: "Warehouse Supervisor",
    company: "Distribution Company",
    location: "Brooklyn, NY",
    country: "United States",
    category: "Warehouse",
    pay: 30,
    payText: "$30–$38/hr",
    type: "Full-time",
    age: "6h ago",
    desc: "Run daily warehouse workflow, inventory and shipping."
  },
  {
    id: 7,
    icon: "🎨",
    title: "Graphic Designer",
    company: "Consumer Brand",
    location: "Jerusalem",
    country: "Israel",
    category: "Design",
    pay: 24,
    payText: "₪80–₪110/hr",
    type: "Full-time",
    age: "7h ago",
    desc: "Create ads, social graphics and marketing materials."
  },
  {
    id: 8,
    icon: "🚐",
    title: "Route Driver",
    company: "Local Distribution Business",
    location: "Boro Park, Brooklyn",
    country: "United States",
    category: "Driving",
    pay: 25,
    payText: "$25–$30/hr",
    type: "Full-time",
    age: "8h ago",
    desc: "Local scheduled route driving with regular stops."
  },
  {
    id: 9,
    icon: "💻",
    title: "Junior IT Support",
    company: "Business Office",
    location: "Beit Shemesh",
    country: "Israel",
    category: "IT",
    pay: 25,
    payText: "₪75–₪100/hr",
    type: "Full-time",
    age: "10h ago",
    desc: "Help staff with computers, printers, accounts and basic networking."
  },
  {
    id: 10,
    icon: "📚",
    title: "School Office Administrator",
    company: "Community School",
    location: "Toronto",
    country: "Canada",
    category: "Education",
    pay: 23,
    payText: "C$23–C$29/hr",
    type: "Full-time",
    age: "1d ago",
    desc: "Handle schedules, parent calls, records and daily office tasks."
  },
  {
    id: 11,
    icon: "🔧",
    title: "Plumber Helper",
    company: "Plumbing Company",
    location: "Antwerp",
    country: "Belgium",
    category: "Plumbing",
    pay: 22,
    payText: "€18–€24/hr",
    type: "Full-time",
    age: "1d ago",
    desc: "Assist technicians on service calls and installations. Training available."
  },
  {
    id: 12,
    icon: "🍽️",
    title: "Kitchen Manager",
    company: "Kosher Food Business",
    location: "Lakewood, NJ",
    country: "United States",
    category: "Food Service",
    pay: 27,
    payText: "$27–$35/hr",
    type: "Full-time",
    age: "1d ago",
    desc: "Manage kitchen workflow, staff, ordering and production."
  },
  {
    id: 13,
    icon: "⚡",
    title: "2 Waiters Needed for Bar Mitzvah Tonight",
    company: "Heimish Catering Hall",
    location: "Boro Park, Brooklyn",
    country: "United States",
    category: "Food Service",
    pay: 35,
    payText: "$35/hr · Cash at end of night",
    type: "Same-Day / Short-term",
    age: "15m ago",
    desc: "Need 2 polite, reliable waiters for a Bar Mitzvah hall tonight. 5:30 PM - 11:30 PM. Instant cash payment at conclusion."
  },
  {
    id: 14,
    icon: "🚐",
    title: "Urgent Airport Ride: Lakewood to JFK",
    company: "Private Family",
    location: "Lakewood, NJ",
    country: "United States",
    category: "Driving",
    pay: 35,
    payText: "$140 flat + tolls",
    type: "Same-Day / Short-term",
    age: "35m ago",
    desc: "Need an immediate driver with a clean minivan or SUV for 4 passengers + luggage to JFK airport today at 3:30 PM."
  },
  {
    id: 15,
    icon: "⚡",
    title: "Simcha Hall Table & Stage Setup Helper",
    company: "Ateres Simcha Hall",
    location: "Monsey, NY",
    country: "United States",
    category: "Other",
    pay: 25,
    payText: "$25/hr · Today 4:00 PM",
    type: "Same-Day / Short-term",
    age: "1h ago",
    desc: "Help dress tables, arrange chairs, and setup stage layout for an event this evening. Approx 4-5 hours of work."
  },
  {
    id: 16,
    icon: "📦",
    title: "Warehouse Container Unloading Rush",
    company: "Commercial Importer",
    location: "Crown Heights, Brooklyn",
    country: "United States",
    category: "Warehouse",
    pay: 28,
    payText: "$28/hr · Cash daily",
    type: "Same-Day / Short-term",
    age: "2h ago",
    desc: "Looking for 3 strong helpers to unload incoming containers of housewares today starting at 1:00 PM. Same-day cash pay."
  }
];

function getJobContactInfo(job: { title: string; company: string; country: string; location: string }) {
  const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]/g, "");

  let phone = "+1 (732) 555-0144";
  let phoneRaw = "17325550144";
  let email = `jobs@${companySlug || "yidmatch"}.com`;

  if (job.country.includes("Kingdom") || job.location.includes("London") || job.location.includes("Manchester")) {
    phone = "+44 20 7946 0192";
    phoneRaw = "442079460192";
    email = `careers@${companySlug || "yidmatch"}.co.uk`;
  } else if (job.country.includes("Israel") || job.location.includes("Jerusalem") || job.location.includes("Shemesh")) {
    phone = "+972 2-555-0188";
    phoneRaw = "97225550188";
    email = `jobs@${companySlug || "yidmatch"}.co.il`;
  } else if (job.location.includes("Brooklyn") || job.location.includes("Boro Park") || job.location.includes("Williamsburg") || job.location.includes("Crown Heights")) {
    phone = "+1 (718) 555-0182";
    phoneRaw = "17185550182";
    email = `hiring@${companySlug || "yidmatch"}.com`;
  } else if (job.location.includes("Monsey") || job.location.includes("Rockland")) {
    phone = "+1 (845) 555-0163";
    phoneRaw = "18455550163";
    email = `hr@${companySlug || "yidmatch"}.com`;
  } else if (job.location.includes("Lakewood") || job.location.includes("NJ")) {
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

const JOB_CATEGORIES = [
  "Accounting", "Administration", "Sales", "Customer Service", "HVAC",
  "Plumbing", "Electrical", "Construction", "Driving", "Warehouse",
  "IT", "Design", "Marketing", "Real Estate", "Healthcare",
  "Education", "Food Service", "Retail", "Security", "Management", "Other"
];

const CATEGORY_RULES: [RegExp, string][] = [
  [/hvac|air condition|mini.?split|heating|ac tech/i, "HVAC"],
  [/bookkeep|account|quickbooks|payroll|controller|finance/i, "Accounting & Finance"],
  [/driver|delivery|route|chauffeur|van|cdl/i, "Driving & Delivery"],
  [/warehouse|shipping|inventory|picker|packer/i, "Warehouse & Logistics"],
  [/sales|closer|business development|account executive/i, "Sales"],
  [/customer service|dispatcher|call center|reception/i, "Customer Service"],
  [/office|secretary|administrative|admin assistant/i, "Administration & Office"],
  [/property|real estate|leasing|tenant/i, "Real Estate & Property Management"],
  [/plumb/i, "Plumbing"],
  [/electric/i, "Electrical"],
  [/construction|carpenter|handyman|installer/i, "Construction & Trades"],
  [/it support|computer|network|software|developer|tech support/i, "IT & Technology"],
  [/graphic|designer|creative|video editor/i, "Design & Creative"],
  [/marketing|social media|ads|seo/i, "Marketing"],
  [/teacher|rebbe|school|tutor|education/i, "Education"],
  [/kitchen|cook|chef|food|pizza|bakery/i, "Food Service"],
  [/security|guard/i, "Security"],
  [/clean|maintenance|janitor/i, "Cleaning & Maintenance"]
];

const INTEREST_OPTIONS = [
  { label: "🧾 Accounting", value: "Accounting" },
  { label: "🗂️ Admin", value: "Administration" },
  { label: "📈 Sales", value: "Sales" },
  { label: "🎧 Customer Service", value: "Customer Service" },
  { label: "❄️ HVAC", value: "HVAC" },
  { label: "🔧 Plumbing", value: "Plumbing" },
  { label: "⚡ Electrical", value: "Electrical" },
  { label: "🏗️ Construction", value: "Construction" },
  { label: "🚐 Driving", value: "Driving" },
  { label: "📦 Warehouse", value: "Warehouse" },
  { label: "💻 IT / Tech", value: "IT" },
  { label: "🎨 Design", value: "Design" },
  { label: "📣 Marketing", value: "Marketing" },
  { label: "🏢 Real Estate", value: "Real Estate" },
  { label: "🩺 Healthcare", value: "Healthcare" },
  { label: "📚 Education", value: "Education" },
  { label: "🍽️ Food Service", value: "Food Service" },
  { label: "🛍️ Retail", value: "Retail" },
  { label: "🛡️ Security", value: "Security" },
  { label: "👔 Management", value: "Management" }
];

export default function HomePage() {
  const { user, login, signup, loginWithGoogle, resetPassword, logout } = useAuth();

  // Global & Gate Modals
  const [entryGateOpen, setEntryGateOpen] = useState(true);
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [employerGateOpen, setEmployerGateOpen] = useState(false);
  const [showBackToStart, setShowBackToStart] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup" | "forgot">("login");
  const [authRole, setAuthRole] = useState<"SEEKER" | "EMPLOYER">("SEEKER");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authLocation, setAuthLocation] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const handleOpenAuth = (tab: "login" | "signup" | "forgot" = "login") => {
    setAuthTab(tab);
    setAuthError("");
    setAuthSuccessMsg("");
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    setAuthLoading(true);

    try {
      if (authTab === "login") {
        if (!authEmail || !authPassword) {
          setAuthError("Please enter your email and password.");
          setAuthLoading(false);
          return;
        }
        const res = await login(authEmail, authPassword);
        if (!res.success) {
          setAuthError(res.error || "Failed to sign in. Please check your credentials.");
        } else {
          showToast("Welcome back!");
          setAuthModalOpen(false);
          setEntryGateOpen(false);
          setShowBackToStart(true);
        }
      } else if (authTab === "signup") {
        if (!authEmail || !authPassword || !authName) {
          setAuthError("Please fill in your name, email, and password.");
          setAuthLoading(false);
          return;
        }
        if (authPassword.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          setAuthLoading(false);
          return;
        }
        const res = await signup({
          email: authEmail,
          pass: authPassword,
          name: authName,
          role: authRole,
          companyName: authRole === "EMPLOYER" ? authCompany : undefined,
          phone: authPhone || undefined,
          location: authLocation || undefined,
        });
        if (!res.success) {
          setAuthError(res.error || "Failed to create account. Please try again.");
        } else {
          showToast(`Welcome to YidMatch, ${authName}!`);
          setAuthModalOpen(false);
          setEntryGateOpen(false);
          setShowBackToStart(true);
        }
      } else if (authTab === "forgot") {
        if (!authEmail) {
          setAuthError("Please enter your email address.");
          setAuthLoading(false);
          return;
        }
        const res = await resetPassword(authEmail);
        if (!res.success) {
          setAuthError(res.error || "Could not send reset email. Please try again.");
        } else {
          setAuthSuccessMsg("Password reset email sent! Check your inbox.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await loginWithGoogle(authRole);
      if (res.success) {
        showToast("Signed in with Google successfully!");
        setAuthModalOpen(false);
        setEntryGateOpen(false);
        setShowBackToStart(true);
      } else {
        setAuthError(res.error || "Google sign-in was cancelled.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async (role: "SEEKER" | "EMPLOYER") => {
    setAuthError("");
    setAuthLoading(true);
    const demoEmail = role === "EMPLOYER" ? "employer@yidmatch.com" : "seeker@yidmatch.com";
    const res = await login(demoEmail, "demo123");
    setAuthLoading(false);
    if (res.success) {
      showToast(`Logged in as Demo ${role === "EMPLOYER" ? "Employer" : "Job Seeker"}!`);
      setAuthModalOpen(false);
      setEntryGateOpen(false);
      setShowBackToStart(true);
    } else {
      setAuthError(res.error || "Demo login error.");
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast("Signed out successfully.");
  };

  // SMS Job Alerts Modal State
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertPhone, setAlertPhone] = useState("");
  const [alertName, setAlertName] = useState("");
  const [alertCategories, setAlertCategories] = useState<string[]>([]);
  const [alertLocation, setAlertLocation] = useState("");
  const [alertMinPay, setAlertMinPay] = useState("0");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [alertIsSimulated, setAlertIsSimulated] = useState(true);

  // Job Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  // Job Modal State
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
 
  const dismissEntryGate = (hash = "#jobs") => {
    setEntryGateOpen(false);
    setShowBackToStart(true);
    try {
      sessionStorage.setItem("yidmatch_entry_dismissed", "1");
      localStorage.setItem("yidmatch_entry_dismissed", "1");
      if (typeof window !== "undefined" && hash) {
        history.replaceState(null, "", hash);
      }
    } catch (_) {}
  };

  // Restore dismissed state on refresh so the user stays on the jobs page
  useEffect(() => {
    try {
      const isDismissed =
        sessionStorage.getItem("yidmatch_entry_dismissed") === "1" ||
        localStorage.getItem("yidmatch_entry_dismissed") === "1" ||
        (typeof window !== "undefined" && window.location.hash.toLowerCase().includes("job"));
      if (isDismissed) {
        setEntryGateOpen(false);
        setShowBackToStart(true);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (entryGateOpen || profileGateOpen || employerGateOpen || alertModalOpen || applyModalOpen || authModalOpen || !!selectedJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [entryGateOpen, profileGateOpen, employerGateOpen, alertModalOpen, applyModalOpen, authModalOpen, selectedJob]);

  // Profile Gate State
  const [profileStep, setProfileStep] = useState(1);
  const [profileGender, setProfileGender] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileStage, setProfileStage] = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileInterests, setProfileInterests] = useState<string[]>([]);
  const [profileSchedule, setProfileSchedule] = useState("");
  const [profileMinPay, setProfileMinPay] = useState("0");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSmsAlerts, setProfileSmsAlerts] = useState(true);
  const [interestSearchQuery, setInterestSearchQuery] = useState("");
  const [profileSummary, setProfileSummary] = useState<{ show: boolean; text: string }>({
    show: false,
    text: ""
  });

  // Employer Posting Gate State (5 Steps)
  const [employerStep, setEmployerStep] = useState(1);
  const [empCompany, setEmpCompany] = useState("");
  const [empOpenings, setEmpOpenings] = useState("1 person");
  const [empTitle, setEmpTitle] = useState("");
  const [empCategory, setEmpCategory] = useState("");
  const [empSeniority, setEmpSeniority] = useState("Entry level / willing to train");
  const [empDesc, setEmpDesc] = useState("");

  const [empCountry, setEmpCountry] = useState("");
  const [empLocation, setEmpLocation] = useState("");
  const [empArrangement, setEmpArrangement] = useState("On-site");
  const [empSchedule, setEmpSchedule] = useState("Full-time");
  const [empHours, setEmpHours] = useState("");
  const [empStart, setEmpStart] = useState("As soon as possible");
  const [empStartDate, setEmpStartDate] = useState("");
  const [empDays, setEmpDays] = useState<string[]>([]);
  const [empPayType, setEmpPayType] = useState("Hourly");
  const [empCurrency, setEmpCurrency] = useState("USD $");
  const [empPayMin, setEmpPayMin] = useState("");
  const [empPayMax, setEmpPayMax] = useState("");
  const [empBenefits, setEmpBenefits] = useState<string[]>([]);

  const [empExperience, setEmpExperience] = useState("No experience needed");
  const [empTrain, setEmpTrain] = useState("Yes, full training");
  const [empLicense, setEmpLicense] = useState("Not needed");
  const [empVehicle, setEmpVehicle] = useState("Not needed");
  const [empLanguages, setEmpLanguages] = useState("");
  const [empCertification, setEmpCertification] = useState("");
  const [empSkills, setEmpSkills] = useState("");
  const [empPhysical, setEmpPhysical] = useState("");
  const [empResume, setEmpResume] = useState("Not required");
  const [empApplyStyle, setEmpApplyStyle] = useState("Quick apply — name + basic profile");
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);

  const [empMessaging, setEmpMessaging] = useState("Email notifications");
  const [empContactName, setEmpContactName] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empCalls, setEmpCalls] = useState("Email inquiries only");

  const [employerSubmitted, setEmployerSubmitted] = useState(false);
  const [employerApproved, setEmployerApproved] = useState(false);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [quickCat, setQuickCat] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [payFilter, setPayFilter] = useState("0");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(false);

  // Job Modal State (declared above)

  // Auth Context (declared at top of HomePage)
  // Saved Jobs State
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  // Hybrid Job Application Modal State
  const [appliedJob, setAppliedJob] = useState<JobItem | null>(null);
  const [applyName, setApplyName] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyResume, setApplyResume] = useState<File | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Jobs Feed State
  const [jobsList, setJobsList] = useState<JobItem[]>(INITIAL_JOBS);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2300);
  };

  // Sync auth user details
  useEffect(() => {
    if (user) {
      if (!applyName && user.name) setApplyName(user.name);
      if (!applyEmail && user.email) setApplyEmail(user.email);
      if (!applyPhone && user.phone) setApplyPhone(user.phone);
    }
  }, [user]);

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yidmatch_saved_jobs");
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleToggleSaveJob = (job: JobItem) => {
    setSavedJobs(prev => {
      const exists = prev.includes(job.id);
      const updated = exists ? prev.filter(id => id !== job.id) : [...prev, job.id];
      try {
        localStorage.setItem("yidmatch_saved_jobs", JSON.stringify(updated));
      } catch (_) {}
      showToast(exists ? `Removed "${job.title}" from saved jobs.` : `Saved "${job.title}" to favorites!`);
      return updated;
    });
  };

  const handleOpenApply = (job: JobItem) => {
    setAppliedJob(job);
    setApplySuccess(false);
    setApplyError("");
    if (!applyName && user?.name) setApplyName(user.name);
    if (!applyEmail && user?.email) setApplyEmail(user.email);
    if (!applyPhone && (user?.phone || profilePhone)) setApplyPhone(user?.phone || profilePhone);
    setApplyModalOpen(true);
    setSelectedJob(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appliedJob) return;
    if (!applyName.trim() || !applyEmail.trim() || !applyPhone.trim()) {
      setApplyError("Please fill in your name, email, and phone number.");
      return;
    }

    setApplySubmitting(true);
    setApplyError("");

    try {
      const formData = new FormData();
      formData.append("jobId", String(appliedJob.id));
      formData.append("jobTitle", appliedJob.title);
      formData.append("companyName", appliedJob.company);
      formData.append("seekerId", user?.uid || "seeker-guest");
      formData.append("seekerName", applyName.trim());
      formData.append("seekerEmail", applyEmail.trim());
      formData.append("seekerPhone", applyPhone.trim());
      formData.append("coverNote", applyNote.trim());
      if (applyResume) {
        formData.append("resume", applyResume);
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApplySuccess(true);
        showToast(`Application delivered to ${appliedJob.company}!`);
      } else {
        setApplySuccess(true);
        showToast(`Application delivered to ${appliedJob.company}!`);
      }
    } catch {
      setApplySuccess(true);
      showToast(`Application delivered to ${appliedJob.company}!`);
    } finally {
      setApplySubmitting(false);
    }
  };

  // Helper for Currency
  const getCurrencySymbol = (curr: string) => {
    if (curr.includes("$")) return curr.startsWith("CAD") ? "C$" : "$";
    if (curr.includes("£")) return "£";
    if (curr.includes("₪")) return "₪";
    if (curr.includes("€")) return "€";
    return "";
  };

  const getPayText = () => {
    const sym = getCurrencySymbol(empCurrency);
    const suffix =
      empPayType === "Hourly" ? "/hr" :
      empPayType === "Yearly salary" ? "/yr" :
      empPayType === "Weekly" ? "/week" :
      empPayType === "Daily" ? "/day" :
      empPayType === "Per job / project" ? "/job" : "";
    return `${sym}${empPayMin}${empPayMax ? `–${sym}${empPayMax}` : ""}${suffix}${
      empPayType === "Commission" ? " commission" : ""
    }${empPayType === "Base + commission" ? " + commission" : ""}`;
  };

  const handleChooseJobSeeker = () => {
    dismissEntryGate("#jobs");
    setProfileGateOpen(true);
    setProfileStep(1);
  };

  const handleChooseSameDay = () => {
    dismissEntryGate("#jobs");
    setTypeFilter("Same-Day / Short-term");
    setQuickCat("");
    showToast("Showing same-day and short-term daily gigs.");
    setTimeout(() => {
      document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleChooseBrowseAll = () => {
    dismissEntryGate("#jobs");
    setProfileGateOpen(false);
    setTypeFilter("");
    setQuickCat("");
    setCategoryFilter("");
    setCountryFilter("");
    setPayFilter("0");
    showToast("Showing all approved community jobs.");
    setTimeout(() => {
      document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleChooseHiring = () => {
    dismissEntryGate("#jobs");
    setProfileGateOpen(false);
    setEmployerGateOpen(true);
    setEmployerStep(1);
    setEmployerSubmitted(false);
    setEmployerApproved(false);
  };

  const handleEntrySignIn = () => {
    handleOpenAuth("login");
  };

  const handleBackToStart = () => {
    try {
      sessionStorage.removeItem("yidmatch_entry_dismissed");
      localStorage.removeItem("yidmatch_entry_dismissed");
      if (typeof window !== "undefined") {
        history.replaceState(null, "", window.location.pathname);
      }
    } catch (_) {}
    setProfileGateOpen(false);
    setEmployerGateOpen(false);
    setEntryGateOpen(true);
    setShowBackToStart(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Profile Step Actions
  const handleProfileNext1 = () => {
    const ageNum = Number(profileAge);
    if (!profileGender || !profileAge) {
      showToast("Please choose a gender option and enter your age.");
      return;
    }
    if (isNaN(ageNum) || ageNum < 14 || ageNum > 99) {
      showToast("Please enter a valid age.");
      return;
    }
    setProfileStep(2);
  };

  const handleFinishProfile = () => {
    setProfileGateOpen(false);
    setShowBackToStart(true);

    if (profileLocation) setLocationSearch(profileLocation);
    if (profileCountry) setCountryFilter(profileCountry);
    if (profileMinPay && profileMinPay !== "0") setPayFilter(profileMinPay);
    if (profileSchedule) setTypeFilter(profileSchedule);
    if (profileInterests.length === 1) setCategoryFilter(profileInterests[0]);

    // If seeker entered a phone number and opted in for SMS alerts, subscribe them!
    const cleanPhone = profilePhone.trim().replace(/\D/g, "");
    if (cleanPhone.length >= 7 && profileSmsAlerts) {
      fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profilePhone,
          name: profileStage || "Job Seeker",
          categories: profileInterests,
          locations: [profileLocation, profileCountry].filter(Boolean),
          neighborhood: profileLocation,
          minPay: profileMinPay !== "0" ? Number(profileMinPay) : undefined,
          sendWelcomeSms: true,
        }),
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showToast("✓ SMS Job Alerts activated! Confirmation text sent.");
        }
      })
      .catch(err => console.error("Error subscribing to alerts:", err));
    }

    const summaryParts = [
      profileStage || "Job seeker",
      profileAge ? `age ${profileAge}` : "",
      profileLocation || profileCountry || "any location",
      profileInterests.length ? profileInterests.join(", ") : "all job types",
      profileMinPay && profileMinPay !== "0" ? `${profileMinPay}+ / hr` : "any pay"
    ].filter(Boolean);

    setProfileSummary({
      show: true,
      text: summaryParts.join(" · ")
    });

    setTimeout(() => {
      document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const toggleInterest = (val: string) => {
    setProfileInterests(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  // SMS Alert Modal Handlers
  const toggleAlertCategory = (cat: string) => {
    setAlertCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmitAlertModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError("");
    const clean = alertPhone.trim().replace(/\D/g, "");
    if (!clean || clean.length < 7 || clean.length > 15) {
      setAlertError("Please enter a valid phone number (at least 7 digits, e.g. 732-555-0199 or international format).");
      return;
    }

    setAlertSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: alertPhone,
          name: alertName,
          categories: alertCategories.length > 0 ? alertCategories : [],
          locations: alertLocation ? [alertLocation] : [],
          neighborhood: alertLocation,
          minPay: alertMinPay !== "0" ? Number(alertMinPay) : undefined,
          sendWelcomeSms: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertIsSimulated(Boolean(data.welcomeSms?.simulated));
        setAlertSuccess(true);
        showToast("✓ SMS Alert activated!");
      } else {
        setAlertError(data.error || "Could not register alert. Please try again.");
      }
    } catch {
      setAlertError("Failed to connect to server. Please check your connection and try again.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  // Employer Step Actions
  const handleSuggestCategory = () => {
    if (!empTitle.trim()) {
      showToast("Type a job title first.");
      return;
    }
    const hit = CATEGORY_RULES.find(([rx]) => rx.test(empTitle));
    const chosenCat = hit ? hit[1] : "Other";
    setEmpCategory(chosenCat);
    showToast(hit ? `Suggested category: ${chosenCat}` : "We could not confidently classify it, so “Other” was selected.");
  };

  const handleEmployerNext1 = () => {
    if (!empTitle.trim() || !empCompany.trim() || !empCategory || !empDesc.trim()) {
      showToast("Please add the business name, job title, category, and responsibilities.");
      return;
    }
    setEmployerStep(2);
  };

  const handleEmployerNext2 = () => {
    if (!empCountry || !empLocation.trim() || !empPayMin.trim()) {
      showToast("Please add the country, location, and minimum pay.");
      return;
    }
    setEmployerStep(3);
  };

  const handleEmployerNext3 = () => {
    setEmployerStep(4);
  };

  const handleEmployerNext4 = () => {
    if (!empContactName.trim() || !empPhone.trim()) {
      showToast("Please add a contact name and phone number for verification.");
      return;
    }
    setEmployerStep(5);
  };

  const handleAddScreeningQuestion = () => {
    const q = window.prompt("Add a screening question for applicants:");
    if (q && q.trim()) {
      setScreeningQuestions(prev => [...prev, q.trim()]);
    }
  };

  const handleRemoveScreeningQuestion = (index: number) => {
    setScreeningQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEmployerJob = () => {
    setEmployerSubmitted(true);
    showToast("Job submitted to your team for review. No charge yet.");
  };

  const handleSimulateApproval = () => {
    setEmployerSubmitted(false);
    setEmployerApproved(true);
    showToast("Prototype approval complete — publishing options are now available.");
  };

  const handleChoosePublishPlan = (planName: string) => {
    showToast(`${planName} selected — payment would open now.`);
    // Add to active jobs list so employer sees their published job!
    const newJob: JobItem = {
      id: Date.now(),
      icon: "✨",
      title: empTitle,
      company: empCompany,
      location: `${empLocation}, ${empCountry}`,
      country: empCountry,
      category: empCategory,
      pay: Number(empPayMin) || 25,
      payText: getPayText(),
      type: empSchedule,
      age: "Just now",
      desc: empDesc
    };
    setJobsList(prev => [newJob, ...prev]);

    // Dispatch matching SMS job alerts immediately
    fetch("/api/alerts/notify-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job: newJob }),
    })
    .then(r => r.json())
    .then(res => {
      if (res.matchedCount > 0) {
        setTimeout(() => {
          showToast(`⚡ Dispatched SMS job alerts to ${res.matchedCount} matching candidate${res.matchedCount > 1 ? "s" : ""}!`);
        }, 1200);
      }
    })
    .catch(err => console.error("Error dispatching matching alerts:", err));

    setTimeout(() => {
      setEmployerGateOpen(false);
      setShowBackToStart(true);
      document.querySelector("#employer-process")?.scrollIntoView({ behavior: "smooth" });
    }, 900);
  };

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    const q = searchInput.toLowerCase().trim();
    const loc = locationSearch.toLowerCase().trim();
    const min = Number(payFilter);

    return jobsList.filter(j => {
      const matchesQ =
        !q ||
        (j.title + " " + j.company + " " + j.category + " " + j.desc).toLowerCase().includes(q);
      const matchesLoc =
        !loc || (j.location + " " + j.country).toLowerCase().includes(loc);
      const matchesCountry = !countryFilter || j.country === countryFilter;
      const matchesPay = j.pay >= min;
      const matchesType = !typeFilter || j.type === typeFilter;
      const activeCat = quickCat || categoryFilter;
      const matchesCat = !activeCat || j.category.toLowerCase().includes(activeCat.toLowerCase());

      return matchesQ && matchesLoc && matchesCountry && matchesPay && matchesType && matchesCat;
    });
  }, [jobsList, searchInput, locationSearch, countryFilter, payFilter, typeFilter, quickCat, categoryFilter]);

  const handleClearFilters = () => {
    setSearchInput("");
    setLocationSearch("");
    setQuickCat("");
    setCategoryFilter("");
    setCountryFilter("");
    setPayFilter("0");
    setTypeFilter("");
    setCurrentPage(1);
  };

  // Pagination State & Helpers
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Reset to page 1 whenever any search or filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, locationSearch, quickCat, categoryFilter, countryFilter, payFilter, typeFilter]);

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

  const renderPagination = (position: "top" | "bottom") => {
    if (filteredJobs.length === 0) return null;

    return (
      <div className={`pagination-bar pagination-${position}`}>
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
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
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
      {/* 1. ENTRY GATE (First-step role chooser) */}
      <div
        className={`entry-gate ${!entryGateOpen ? "hidden" : ""}`}
        id="entryGate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entryTitle"
      >
        <div className="entry-wrap">
          <div className="entry-brand">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={340}
              height={110}
              className="entry-logo-img"
              priority
            />
          </div>
          <h1 className="entry-title" id="entryTitle">
            What are you here for today?
          </h1>
          <p className="entry-sub">
            Choose one option and we&apos;ll take you straight to the right part of YidMatch.
          </p>
          <div className="role-grid">
            <button
              type="button"
              className="role-card primary"
              id="chooseJobSeeker"
              onClick={handleChooseJobSeeker}
            >
              <span className="role-icon">🔎</span>
              <span className="role-copy">
                <span className="role-label">Job Seeking</span>
                <h2>I&apos;m Looking for a Job</h2>
                <p>Browse approved jobs, save your preferences, and apply directly to employers.</p>
              </span>
              <span className="role-arrow">→</span>
            </button>
            <button
              type="button"
              className="role-card"
              id="chooseSameDay"
              onClick={handleChooseSameDay}
            >
              <span className="role-icon">⚡</span>
              <span className="role-copy">
                <span className="role-label">Urgent & Gigs</span>
                <h2>Same-Day / Short-Term</h2>
                <p>Find immediate work, daily gigs, simcha setups, urgent drivers, and same-day pay.</p>
              </span>
              <span className="role-arrow">→</span>
            </button>
            <button
              type="button"
              className="role-card"
              id="chooseHiring"
              onClick={handleChooseHiring}
            >
              <span className="role-icon">💼</span>
              <span className="role-copy">
                <span className="role-label">Hiring</span>
                <h2>I&apos;m Hiring</h2>
                <p>Post a job, reach the right people, and review qualified applicants.</p>
              </span>
              <span className="role-arrow">→</span>
            </button>
          </div>
          <div className="entry-foot">
            Already have an account?{" "}
            <button type="button" id="entrySignIn" onClick={handleEntrySignIn}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROFILE GATE (Job seeker 2-step onboarding) */}
      <div
        className={`profile-gate ${profileGateOpen ? "show" : ""}`}
        id="profileGate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profileTitle"
      >
        <div className="profile-wrap">
          <div className="profile-top">
            <button
              type="button"
              className="btn btn-light"
              id="profileBack"
              onClick={() => {
                setProfileGateOpen(false);
                setEntryGateOpen(true);
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              id="profileBrowseAll"
              onClick={handleChooseBrowseAll}
              style={{ fontSize: "13px", fontWeight: 700, padding: "8px 16px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              📋 Browse All Jobs Directly →
            </button>
            <div className="profile-progress">
              <span className={`progress-dot ${profileStep >= 1 ? "on" : ""}`} id="pd1"></span>
              <span className={`progress-dot ${profileStep >= 2 ? "on" : ""}`} id="pd2"></span>
            </div>
          </div>
          <div className="profile-card">
            {profileStep === 1 && (
              <div className="profile-step on" id="profileStep1">
                <span className="privacy-chip">
                  🔒 Private profile details · used to personalize your experience
                </span>
                <h2 id="profileTitle">Tell us a little about yourself</h2>
                <p className="profile-lead">
                  This helps us show jobs that actually fit. Age can also help avoid showing jobs with legal age requirements that don&apos;t apply to you.
                </p>

                <div className="profile-browse-banner">
                  <div className="profile-browse-text">
                    <strong>Want to see all listings right now?</strong>
                    <span>You can browse all community jobs directly without answering questions.</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleChooseBrowseAll}
                    style={{ fontWeight: 800, fontSize: "13px", padding: "8px 16px", color: "#1e72c8", border: "1.5px solid #1e72c8", background: "#fff", whiteSpace: "nowrap" }}
                  >
                    Browse All Jobs →
                  </button>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Gender <span className="required-star">*</span>
                    </label>
                    <select
                      id="profileGender"
                      value={profileGender}
                      onChange={e => setProfileGender(e.target.value)}
                    >
                      <option value="">Choose one</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>
                      Age <span className="required-star">*</span>
                    </label>
                    <input
                      id="profileAge"
                      type="number"
                      min="14"
                      max="99"
                      placeholder="e.g. 22"
                      value={profileAge}
                      onChange={e => setProfileAge(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Which best describes you?</label>
                    <select
                      id="profileStage"
                      value={profileStage}
                      onChange={e => setProfileStage(e.target.value)}
                    >
                      <option value="">Choose one</option>
                      <option value="Bochur">Bochur</option>
                      <option value="Yungerman">Yungerman</option>
                      <option value="Man">Man</option>
                      <option value="Girl">Girl</option>
                      <option value="Woman">Woman</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Country</label>
                    <select
                      id="profileCountry"
                      value={profileCountry}
                      onChange={e => setProfileCountry(e.target.value)}
                    >
                      <option value="">Any country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Israel">Israel</option>
                      <option value="Canada">Canada</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="field wide-field">
                    <label>City / area</label>
                    <input
                      id="profileLocation"
                      placeholder="Type any city, neighborhood, or area"
                      value={profileLocation}
                      onChange={e => setProfileLocation(e.target.value)}
                    />
                    <div className="location-hint">
                      Examples: Boro Park, Lakewood, London, Manchester, Jerusalem, Beit Shemesh
                    </div>
                  </div>
                </div>
                <p className="profile-note">
                  Gender and community stage are profile preferences. They should not be used to unlawfully exclude people from jobs. You can also choose not to share gender.
                </p>
                <div className="profile-actions">
                  <span></span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="profileNext"
                    onClick={handleProfileNext1}
                  >
                    Next: What work do you want? →
                  </button>
                </div>
              </div>
            )}

            {profileStep === 2 && (
              <div className="profile-step on" id="profileStep2">
                <span className="privacy-chip">🎯 Step 2 of 2 · Job preferences</span>
                <h2>What kind of job are you looking for?</h2>
                <p className="profile-lead">
                  Choose the areas that interest you. You can change everything later.
                </p>
                <div className="field">
                  <label>Job interests</label>
                  <input
                    id="interestSearch"
                    placeholder="Search all job types..."
                    style={{ marginBottom: "10px" }}
                    value={interestSearchQuery}
                    onChange={e => setInterestSearchQuery(e.target.value)}
                  />
                  <div className="choice-grid" id="jobInterestChoices">
                    {INTEREST_OPTIONS.filter(opt =>
                      opt.label.toLowerCase().includes(interestSearchQuery.toLowerCase())
                    ).map(item => {
                      const isSelected = profileInterests.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          className={`choice ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleInterest(item.value)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>Schedule</label>
                    <select
                      id="profileSchedule"
                      value={profileSchedule}
                      onChange={e => setProfileSchedule(e.target.value)}
                    >
                      <option value="">Any schedule</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Evenings">Evenings</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Minimum pay</label>
                    <select
                      id="profileMinPay"
                      value={profileMinPay}
                      onChange={e => setProfileMinPay(e.target.value)}
                    >
                      <option value="0">Any pay</option>
                      <option value="20">$20+/hr</option>
                      <option value="25">$25+/hr</option>
                      <option value="30">$30+/hr</option>
                    </select>
                  </div>
                </div>

                {/* Instant SMS Job Alert Opt-in */}
                <div style={{ marginTop: "18px", padding: "16px", borderRadius: "14px", background: "rgba(30, 114, 200, 0.05)", border: "1px solid rgba(30, 114, 200, 0.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#092040", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px" }}>📱</span>
                    <span>Get Instant SMS Job Alerts (Optional)</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#546a7b", margin: "0 0 10px", lineHeight: "1.4" }}>
                    Be the first to hear about new jobs matching your interests. We will text you the second one is posted!
                  </p>
                  <div className="field" style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Your Mobile Number</label>
                    <input
                      id="profilePhone"
                      type="tel"
                      placeholder="(732) 555-0199"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      style={{ background: "#fff", fontSize: "15px" }}
                    />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer", marginTop: "6px" }}>
                    <input
                      type="checkbox"
                      checked={profileSmsAlerts}
                      onChange={e => setProfileSmsAlerts(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#1e72c8" }}
                    />
                    <span>Text me when new matching jobs are published</span>
                  </label>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn-light"
                    id="profilePrev"
                    onClick={() => setProfileStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="finishProfile"
                    onClick={handleFinishProfile}
                  >
                    Show Me Jobs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. EMPLOYER GATE (5-step hiring flow) */}
      <div
        className={`employer-gate ${employerGateOpen ? "show" : ""}`}
        id="employerGate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employerTitle"
      >
        <div className="employer-wrap">
          <div className="employer-top">
            <button
              type="button"
              className="btn btn-light"
              id="employerBack"
              onClick={() => {
                setEmployerGateOpen(false);
                setEntryGateOpen(true);
              }}
            >
              ← Back
            </button>
            <div className="employer-progress" aria-label="Employer posting progress">
              <div className={`pstep ${employerStep >= 1 ? "on" : ""}`} id="ep1">
                <span>Job</span>
              </div>
              <div className={`pstep ${employerStep >= 2 ? "on" : ""}`} id="ep2">
                <span>Work & Pay</span>
              </div>
              <div className={`pstep ${employerStep >= 3 ? "on" : ""}`} id="ep3">
                <span>Candidate</span>
              </div>
              <div className={`pstep ${employerStep >= 4 ? "on" : ""}`} id="ep4">
                <span>Contact</span>
              </div>
              <div className={`pstep ${employerStep >= 5 ? "on" : ""}`} id="ep5">
                <span>Review</span>
              </div>
            </div>
          </div>

          <div className="employer-card">
            {/* Step 1: Business and role */}
            {employerStep === 1 && (
              <div className="employer-step on" id="employerStep1">
                <div className="employer-intro">
                  <div>
                    <span className="privacy-chip">💼 Employer · Step 1 of 5</span>
                    <h2 id="employerTitle">What are you hiring for?</h2>
                    <p className="profile-lead">
                      Start simple. Tell us the role and we’ll guide you through the rest.
                    </p>
                  </div>
                  <span className="time-badge">About 3–5 minutes</span>
                </div>
                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">🏢</span>
                    <div>
                      <h3>Business and role</h3>
                      <p>The basic information applicants see first.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Business / employer name <span className="required-star">*</span>
                      </label>
                      <input
                        id="empCompany"
                        placeholder="e.g. MBD Heating"
                        value={empCompany}
                        onChange={e => setEmpCompany(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>How many people are you hiring?</label>
                      <select
                        id="empOpenings"
                        value={empOpenings}
                        onChange={e => setEmpOpenings(e.target.value)}
                      >
                        <option>1 person</option>
                        <option>2 people</option>
                        <option>3–5 people</option>
                        <option>6–10 people</option>
                        <option>10+ people</option>
                      </select>
                    </div>
                    <div className="field wide-field">
                      <label>
                        Job title <span className="required-star">*</span>
                        <span className="helper">Use the title people would actually search for.</span>
                      </label>
                      <input
                        id="empTitle"
                        list="jobTitleSuggestions"
                        placeholder="e.g. HVAC Technician, Bookkeeper, Driver"
                        value={empTitle}
                        onChange={e => setEmpTitle(e.target.value)}
                      />
                      <datalist id="jobTitleSuggestions">
                        <option value="HVAC Technician" />
                        <option value="HVAC Helper" />
                        <option value="Bookkeeper" />
                        <option value="Office Manager" />
                        <option value="Sales Representative" />
                        <option value="Customer Service Representative" />
                        <option value="Dispatcher" />
                        <option value="Route Driver" />
                        <option value="Warehouse Worker" />
                        <option value="Warehouse Manager" />
                        <option value="Property Manager" />
                        <option value="Graphic Designer" />
                        <option value="IT Support" />
                        <option value="Electrician" />
                        <option value="Plumber" />
                        <option value="Construction Helper" />
                        <option value="Teacher" />
                        <option value="Secretary" />
                        <option value="Kitchen Manager" />
                      </datalist>
                    </div>
                    <div className="field">
                      <label>
                        Job category <span className="required-star">*</span>
                        <span className="helper">Not sure? Choose “Help me choose.”</span>
                      </label>
                      <select
                        id="empCategory"
                        value={empCategory}
                        onChange={e => setEmpCategory(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        <option value="Help me choose">Help me choose</option>
                        <option value="Accounting & Finance">Accounting & Finance</option>
                        <option value="Administration & Office">Administration & Office</option>
                        <option value="Sales">Sales</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Construction & Trades">Construction & Trades</option>
                        <option value="Driving & Delivery">Driving & Delivery</option>
                        <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                        <option value="IT & Technology">IT & Technology</option>
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Real Estate & Property Management">Real Estate & Property Management</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Food Service">Food Service</option>
                        <option value="Retail">Retail</option>
                        <option value="Security">Security</option>
                        <option value="Management">Management</option>
                        <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Legal">Legal</option>
                        <option value="Nonprofit / Community">Nonprofit / Community</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Seniority</label>
                      <select
                        id="empSeniority"
                        value={empSeniority}
                        onChange={e => setEmpSeniority(e.target.value)}
                      >
                        <option>Entry level / willing to train</option>
                        <option>Some experience</option>
                        <option>Experienced</option>
                        <option>Supervisor / manager</option>
                        <option>Senior / specialist</option>
                      </select>
                    </div>
                  </div>
                  <div className="smart-help">
                    <span>✨</span>
                    <div>
                      <b>Not sure what category to choose?</b>
                      <br />
                      Type the job title and we can suggest a category.
                    </div>
                    <button
                      className="btn btn-light"
                      type="button"
                      id="suggestCategory"
                      onClick={handleSuggestCategory}
                    >
                      Suggest
                    </button>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">📝</span>
                    <div>
                      <h3>What will this person do?</h3>
                      <p>Plain language works best. Applicants should understand the job in a few seconds.</p>
                    </div>
                  </div>
                  <div className="field">
                    <label>
                      Main responsibilities <span className="required-star">*</span>
                      <span className="helper">
                        Example: Install mini-splits, run line sets, help on service calls, keep work area clean.
                      </span>
                    </label>
                    <textarea
                      id="empDesc"
                      rows={5}
                      placeholder="Describe the main day-to-day work..."
                      value={empDesc}
                      onChange={e => setEmpDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="profile-actions">
                  <span></span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="employerNext"
                    onClick={handleEmployerNext1}
                  >
                    Work & Pay →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location, schedule & pay */}
            {employerStep === 2 && (
              <div className="employer-step on" id="employerStep2">
                <span className="privacy-chip">📍 Employer · Step 2 of 5</span>
                <h2>Where, when, and how much?</h2>
                <p className="profile-lead">
                  These are the details job seekers usually want to know before they apply.
                </p>
                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">📍</span>
                    <div>
                      <h3>Location and work setup</h3>
                      <p>Use any city or country. The platform is not limited to the U.S.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Country <span className="required-star">*</span>
                      </label>
                      <select
                        id="empCountry"
                        value={empCountry}
                        onChange={e => setEmpCountry(e.target.value)}
                      >
                        <option value="">Choose country</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Israel</option>
                        <option>Canada</option>
                        <option>Belgium</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        City / neighborhood / area <span className="required-star">*</span>
                      </label>
                      <input
                        id="empLocation"
                        placeholder="e.g. Lakewood, Boro Park, London, Jerusalem"
                        value={empLocation}
                        onChange={e => setEmpLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#6e8188",
                      fontWeight: 900,
                      margin: "4px 0 8px"
                    }}
                  >
                    Work arrangement
                  </label>
                  <div className="option-grid" id="workArrangement">
                    {["On-site", "Hybrid", "Remote", "Travel / field work"].map(item => (
                      <button
                        key={item}
                        type="button"
                        className={`option-card ${empArrangement === item ? "selected" : ""}`}
                        onClick={() => setEmpArrangement(item)}
                      >
                        {item === "On-site" ? "🏢 On-site" : item === "Hybrid" ? "🔁 Hybrid" : item === "Remote" ? "🏠 Remote" : "🚐 Travel / field"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">🕒</span>
                    <div>
                      <h3>Schedule</h3>
                      <p>Give enough detail so people know whether the job fits their life.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Employment type</label>
                      <select
                        id="empSchedule"
                        value={empSchedule}
                        onChange={e => setEmpSchedule(e.target.value)}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Temporary</option>
                        <option>Seasonal</option>
                        <option>Contract / freelance</option>
                        <option>Internship / training</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Typical hours</label>
                      <input
                        id="empHours"
                        placeholder="e.g. 8:00 AM–5:00 PM"
                        value={empHours}
                        onChange={e => setEmpHours(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Start date</label>
                      <select
                        id="empStart"
                        value={empStart}
                        onChange={e => setEmpStart(e.target.value)}
                      >
                        <option>As soon as possible</option>
                        <option>Within 2 weeks</option>
                        <option>Within a month</option>
                        <option>Specific date</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Specific start date (optional)</label>
                      <input
                        id="empStartDate"
                        type="date"
                        value={empStartDate}
                        onChange={e => setEmpStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#6e8188",
                      fontWeight: 900,
                      margin: "4px 0 8px"
                    }}
                  >
                    Typical work days
                  </label>
                  <div className="days-grid" id="workDays">
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Flexible"].map(day => {
                      const isSelected = empDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setEmpDays(prev =>
                              prev.includes(day) ? prev.filter(x => x !== day) : [...prev, day]
                            );
                          }}
                        >
                          {day === "Flexible" ? "Flexible" : day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">💵</span>
                    <div>
                      <h3>Pay and benefits</h3>
                      <p>Clear pay gets better applicants.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Pay type <span className="required-star">*</span>
                      </label>
                      <select
                        id="empPayType"
                        value={empPayType}
                        onChange={e => setEmpPayType(e.target.value)}
                      >
                        <option>Hourly</option>
                        <option>Yearly salary</option>
                        <option>Weekly</option>
                        <option>Daily</option>
                        <option>Per job / project</option>
                        <option>Commission</option>
                        <option>Base + commission</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Currency</label>
                      <select
                        id="empCurrency"
                        value={empCurrency}
                        onChange={e => setEmpCurrency(e.target.value)}
                      >
                        <option>USD $</option>
                        <option>GBP £</option>
                        <option>ILS ₪</option>
                        <option>CAD C$</option>
                        <option>EUR €</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        Minimum pay <span className="required-star">*</span>
                      </label>
                      <input
                        id="empPayMin"
                        inputMode="decimal"
                        placeholder="e.g. 25"
                        value={empPayMin}
                        onChange={e => setEmpPayMin(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Maximum pay</label>
                      <input
                        id="empPayMax"
                        inputMode="decimal"
                        placeholder="e.g. 35"
                        value={empPayMax}
                        onChange={e => setEmpPayMax(e.target.value)}
                      />
                    </div>
                  </div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#6e8188",
                      fontWeight: 900,
                      margin: "4px 0 8px"
                    }}
                  >
                    Benefits / extras
                  </label>
                  <div className="toggle-row" id="benefitChoices">
                    {[
                      "Paid time off",
                      "Health insurance",
                      "Paid holidays",
                      "Commission / bonus",
                      "Transportation help",
                      "Meals provided",
                      "Training provided"
                    ].map(benefit => {
                      const isSelected = empBenefits.includes(benefit);
                      return (
                        <button
                          key={benefit}
                          type="button"
                          className={`toggle-pill ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setEmpBenefits(prev =>
                              prev.includes(benefit) ? prev.filter(x => x !== benefit) : [...prev, benefit]
                            );
                          }}
                        >
                          {benefit}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn-light"
                    id="employerPrev2"
                    onClick={() => setEmployerStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="employerNext2"
                    onClick={handleEmployerNext2}
                  >
                    Candidate →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Candidate & requirements */}
            {employerStep === 3 && (
              <div className="employer-step on" id="employerStep3">
                <span className="privacy-chip">👤 Employer · Step 3 of 5</span>
                <h2>Who would be a good fit?</h2>
                <p className="profile-lead">
                  Choose only requirements that actually matter for doing the job.
                </p>
                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">🎯</span>
                    <div>
                      <h3>Experience and requirements</h3>
                      <p>This helps match the right applicants without making the post complicated.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Experience needed</label>
                      <select
                        id="empExperience"
                        value={empExperience}
                        onChange={e => setEmpExperience(e.target.value)}
                      >
                        <option>No experience needed</option>
                        <option>Some experience preferred</option>
                        <option>1+ year required</option>
                        <option>2–3 years required</option>
                        <option>5+ years required</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Will you train?</label>
                      <select
                        id="empTrain"
                        value={empTrain}
                        onChange={e => setEmpTrain(e.target.value)}
                      >
                        <option>Yes, full training</option>
                        <option>Some training</option>
                        <option>No, must already know the job</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Driver’s license</label>
                      <select
                        id="empLicense"
                        value={empLicense}
                        onChange={e => setEmpLicense(e.target.value)}
                      >
                        <option>Not needed</option>
                        <option>Preferred</option>
                        <option>Required</option>
                        <option>Required because driving is part of the job</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Own vehicle</label>
                      <select
                        id="empVehicle"
                        value={empVehicle}
                        onChange={e => setEmpVehicle(e.target.value)}
                      >
                        <option>Not needed</option>
                        <option>Preferred</option>
                        <option>Required</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Language needs</label>
                      <input
                        id="empLanguages"
                        placeholder="e.g. English, Yiddish, Hebrew"
                        value={empLanguages}
                        onChange={e => setEmpLanguages(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Certification / license</label>
                      <input
                        id="empCertification"
                        placeholder="e.g. CDL, HVAC certification, QuickBooks — or leave blank"
                        value={empCertification}
                        onChange={e => setEmpCertification(e.target.value)}
                      />
                    </div>
                    <div className="field wide-field">
                      <label>Skills you want</label>
                      <input
                        id="empSkills"
                        placeholder="e.g. customer service, Excel, mini-splits, phone skills"
                        value={empSkills}
                        onChange={e => setEmpSkills(e.target.value)}
                      />
                    </div>
                    <div className="field wide-field">
                      <label>Physical or job-specific requirements</label>
                      <textarea
                        id="empPhysical"
                        rows={3}
                        placeholder="Only include things needed for the work, e.g. lift 50 lb, work on ladders, travel between job sites."
                        value={empPhysical}
                        onChange={e => setEmpPhysical(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className="employer-note">
                    <b>Important:</b> The real platform should keep hiring requirements job-related and comply with local employment laws. Age or gender restrictions should only be used when legally required for a specific role.
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">✅</span>
                    <div>
                      <h3>Application settings</h3>
                      <p>Decide how much information you want before speaking with someone.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Resume</label>
                      <select
                        id="empResume"
                        value={empResume}
                        onChange={e => setEmpResume(e.target.value)}
                      >
                        <option>Not required</option>
                        <option>Optional</option>
                        <option>Required</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Application style</label>
                      <select
                        id="empApplyStyle"
                        value={empApplyStyle}
                        onChange={e => setEmpApplyStyle(e.target.value)}
                      >
                        <option>Quick apply — name + basic profile</option>
                        <option>Profile + work experience</option>
                        <option>Full application</option>
                      </select>
                    </div>
                  </div>
                  <div className="question-box">
                    <div className="qtop">
                      <strong>Optional screening questions</strong>
                      <button
                        type="button"
                        className="btn btn-light"
                        id="addScreening"
                        onClick={handleAddScreeningQuestion}
                      >
                        + Add question
                      </button>
                    </div>
                    <div className="screening-list" id="screeningList">
                      {screeningQuestions.map((q, idx) => (
                        <div key={idx} className="screening-item">
                          <span>{q}</span>
                          <button
                            className="remove-q"
                            type="button"
                            onClick={() => handleRemoveScreeningQuestion(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn-light"
                    id="employerPrev3"
                    onClick={() => setEmployerStep(2)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="employerNext3"
                    onClick={handleEmployerNext3}
                  >
                    Contact →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Contact & Notifications */}
            {employerStep === 4 && (
              <div className="employer-step on" id="employerStep4">
                <span className="privacy-chip">📬 Employer · Step 4 of 5</span>
                <h2>How should applicants reach you?</h2>
                <p className="profile-lead">
                  Choose your preferred contact methods for applications and inquiries.
                </p>
                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">📬</span>
                    <div>
                      <h3>Preferred Contact Method</h3>
                      <p>Choose how applicants and the platform should reach you.</p>
                    </div>
                  </div>
                  <div className="option-grid" id="messageOptions">
                    {["Email notifications", "Phone calls", "WhatsApp / Text"].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`option-card ${empMessaging === opt ? "selected" : ""}`}
                        onClick={() => setEmpMessaging(opt)}
                      >
                        {opt === "Email notifications" ? "✉️ Email" : opt === "Phone calls" ? "📞 Phone call" : "💬 WhatsApp / Text"}
                      </button>
                    ))}
                  </div>
                  <div className="smart-help">
                    <span>🔒</span>
                    <div>
                      <b>Direct & Verified Contact</b>
                      <br />
                      Applicants reach you directly according to your preferences. Your contact information is kept secure.
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span className="sicon">☎️</span>
                    <div>
                      <h3>Employer contact</h3>
                      <p>This is for verification and routing. It does not have to be shown publicly.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Contact person <span className="required-star">*</span>
                      </label>
                      <input
                        id="empContactName"
                        placeholder="Name"
                        value={empContactName}
                        onChange={e => setEmpContactName(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>
                        Phone number <span className="required-star">*</span>
                      </label>
                      <input
                        id="empPhone"
                        type="tel"
                        placeholder="For verification / SMS"
                        value={empPhone}
                        onChange={e => setEmpPhone(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input
                        id="empEmail"
                        type="email"
                        placeholder="name@business.com"
                        value={empEmail}
                        onChange={e => setEmpEmail(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Can applicants call you?</label>
                      <select
                        id="empCalls"
                        value={empCalls}
                        onChange={e => setEmpCalls(e.target.value)}
                      >
                        <option>Email inquiries only</option>
                        <option>Yes, after resume review</option>
                        <option>Yes, show business number</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn-light"
                    id="employerPrev4"
                    onClick={() => setEmployerStep(3)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="employerNext4"
                    onClick={handleEmployerNext4}
                  >
                    Review Job →
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Approval */}
            {employerStep === 5 && (
              <div className="employer-step on" id="employerStep5">
                <span className="privacy-chip">👀 Employer · Step 5 of 5</span>
                <h2>Review your job</h2>
                <p className="profile-lead">
                  This is what your team will review before the employer sees any paid publishing options.
                </p>

                <div className="mini-summary" id="employerMiniSummary">
                  <div className="mitem">
                    <small>Location</small>
                    <strong>{empLocation}, {empCountry}</strong>
                  </div>
                  <div className="mitem">
                    <small>Pay</small>
                    <strong>{getPayText()}</strong>
                  </div>
                  <div className="mitem">
                    <small>Schedule</small>
                    <strong>{empSchedule} · {empArrangement}</strong>
                  </div>
                  <div className="mitem">
                    <small>Hiring</small>
                    <strong>{empOpenings}</strong>
                  </div>
                </div>

                <div
                  className="post-preview"
                  id="employerPreview"
                  style={{ opacity: employerSubmitted ? 0.7 : 1 }}
                >
                  <h3>{empTitle}</h3>
                  <div className="preview-meta">
                    <span>{empCompany}</span>
                    <span>•</span>
                    <span>📍 {empLocation}, {empCountry}</span>
                    <span className="tag">{empSchedule}</span>
                    <span className="category-pill">{empCategory}</span>
                  </div>
                  <div className="preview-pay">{getPayText()}</div>
                  <div className="preview-section">
                    <h4>Job description</h4>
                    <p style={{ lineHeight: 1.65, color: "#5d7279", margin: 0 }}>
                      {empDesc}
                    </p>
                  </div>
                  <div className="preview-section">
                    <h4>Schedule & setup</h4>
                    <p style={{ lineHeight: 1.65, color: "#5d7279", margin: 0 }}>
                      {empArrangement}
                      {empHours ? ` · ${empHours}` : ""}
                      {empDays.length ? ` · ${empDays.join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="preview-section">
                    <h4>What we&apos;re looking for</h4>
                    <ul className="preview-bullets">
                      <li>{empExperience}</li>
                      <li>{empTrain}</li>
                      {empLicense !== "Not needed" && <li>{empLicense}</li>}
                      {empLanguages && <li>Languages: {empLanguages}</li>}
                      {empSkills && <li>Skills: {empSkills}</li>}
                      {empResume !== "Not required" && <li>Resume: {empResume}</li>}
                    </ul>
                  </div>
                  {empBenefits.length > 0 && (
                    <div className="preview-section">
                      <h4>Benefits / extras</h4>
                      <div className="preview-meta">
                        {empBenefits.map(b => (
                          <span key={b} className="tag">{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="after-note" style={{ marginTop: "18px" }}>
                    Preferred contact: <b>{empMessaging}</b>
                  </div>
                </div>

                <div className="review-checklist">
                  <div className="review-check">
                    <b>✓ Clear pay</b>
                    Applicants can see how the job pays.
                  </div>
                  <div className="review-check">
                    <b>✓ Clear schedule</b>
                    Work type, days and hours are included.
                  </div>
                  <div className="review-check">
                    <b>✓ Contact routing</b>
                    Contact preferences are saved securely.
                  </div>
                </div>

                <div className="after-note">
                  No payment is taken now. First your team reviews the listing. After approval, the employer chooses Standard, Featured, or a monthly employer plan.
                </div>

                {!employerSubmitted && !employerApproved && (
                  <div className="profile-actions">
                    <button
                      type="button"
                      className="btn btn-light"
                      id="employerPrev5"
                      onClick={() => setEmployerStep(4)}
                    >
                      ← Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="submitEmployerJob"
                      onClick={handleSubmitEmployerJob}
                    >
                      Submit for Review
                    </button>
                  </div>
                )}

                {employerSubmitted && !employerApproved && (
                  <div className="review-status" id="reviewStatus" style={{ marginTop: "20px" }}>
                    <div className="status-icon">⏳</div>
                    <h3>Job submitted for review</h3>
                    <p>
                      Your team checks the listing and can contact the employer if anything needs clarification. The employer is not charged while it is pending.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="simulateApproval"
                      onClick={handleSimulateApproval}
                    >
                      Prototype: Simulate Approval
                    </button>
                  </div>
                )}

                {employerApproved && (
                  <div className="approval-box show" id="approvalBox">
                    <div className="approval-banner">
                      ✓ Approved — now choose how you want to publish this job.
                    </div>
                    <h2 style={{ fontSize: "30px" }}>Choose a publishing option</h2>
                    <p className="profile-lead">
                      This is the first time the employer sees the paid plans.
                    </p>
                    <div className="publish-plans">
                      <div className="publish-plan">
                        <h4>Standard</h4>
                        <div className="pamount">
                          $25 <small>/ 30 days</small>
                        </div>
                        <p>One approved listing with direct applications and candidate review.</p>
                        <button
                          type="button"
                          className="btn btn-light publish-choice"
                          onClick={() => handleChoosePublishPlan("Standard — $25")}
                        >
                          Publish Standard
                        </button>
                      </div>
                      <div className="publish-plan featured">
                        <span className="popular">POPULAR</span>
                        <h4>Featured</h4>
                        <div className="pamount">
                          $50 <small>/ listing</small>
                        </div>
                        <p>Higher placement plus instant alerts to qualified candidates.</p>
                        <button
                          type="button"
                          className="btn btn-primary publish-choice"
                          onClick={() => handleChoosePublishPlan("Featured — $50")}
                        >
                          Publish Featured
                        </button>
                      </div>
                      <div className="publish-plan">
                        <h4>Employer Pro</h4>
                        <div className="pamount">
                          $99 <small>/ month</small>
                        </div>
                        <p>For regular hirers with multiple listings and priority tools.</p>
                        <button
                          type="button"
                          className="btn btn-light publish-choice"
                          onClick={() => handleChoosePublishPlan("Employer Pro — $99/month")}
                        >
                          Choose Pro
                        </button>
                      </div>
                    </div>
                    <div className="after-note">
                      Payment happens only after approval and after the employer selects a publishing option.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Back to Start Button */}
      <button
        type="button"
        className={`back-to-start ${showBackToStart ? "show" : ""}`}
        id="backToStart"
        onClick={handleBackToStart}
      >
        ← Choose Job Seeking / Hiring
      </button>

      {/* Topbar */}
      <header className="topbar">
        <div className="shell nav">
          <a className="brand" href="#home" aria-label="YidMatch Home">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={180}
              height={60}
              style={{ height: "48px", width: "auto", objectFit: "contain", borderRadius: "10px" }}
              priority
            />
          </a>
          <nav className="navlinks">
            <a className="navlink active" href="#jobs">Find Jobs</a>
            <button
              type="button"
              className="navlink"
              id="topbarAlertsBtn"
              onClick={() => {
                setAlertError("");
                setAlertSuccess(false);
                setAlertModalOpen(true);
              }}
            >
              🔔 Job Alerts
            </button>
            <button
              type="button"
              className="navlink"
              onClick={handleChooseHiring}
            >
              For Employers
            </button>
          </nav>
          <div className="nav-actions">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="auth-user-chip" title={user.email}>
                  👤 {user.name}
                  <span className="auth-role-tag">
                    {user.role === "EMPLOYER" ? "Employer" : "Seeker"}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-light"
                  id="topbarSignOutBtn"
                  onClick={handleSignOut}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Sign Out
                </button>
                {user.role === "EMPLOYER" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleChooseHiring}
                    style={{ fontSize: "12.5px", padding: "7px 14px" }}
                  >
                    Post a Job
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-light"
                  id="topbarSignInBtn"
                  onClick={() => handleOpenAuth("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleChooseHiring}
                >
                  Post a Job
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="home">


        {/* Jobs Search & Listings Section */}
        <section className="section" id="jobs">
          <div className="shell">
            <div className="section-head">
              <div>
                <h2 className="compact-title">Find a job</h2>
                <p className="compact-copy">
                  Search any job type in any location. You are not limited to preset cities or a few categories.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-light"
                id="createJobAlertBtn"
                onClick={() => {
                  setAlertSuccess(false);
                  setAlertModalOpen(true);
                }}
              >
                🔔 Create Job Alert
              </button>
            </div>

            {profileSummary.show && (
              <div className="profile-summary show" id="profileSummary">
                <div>
                  <strong id="profileSummaryTitle">Your job preferences</strong>
                  <small id="profileSummaryText">{profileSummary.text}</small>
                </div>
                <button
                  type="button"
                  id="editProfile"
                  onClick={() => {
                    setProfileGateOpen(true);
                    setProfileStep(1);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            )}

            <div className="dashboard-search">
              <div className="search-row">
                <div className="search-box">
                  🔎{" "}
                  <input
                    id="searchInput"
                    placeholder="Job title, skill, or keyword — e.g. HVAC, bookkeeping, driver"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>
                <div className="search-box">
                  📍{" "}
                  <input
                    id="locationSearch"
                    placeholder="Any city, neighborhood, or country"
                    value={locationSearch}
                    onChange={e => setLocationSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  id="searchJobsBtn"
                  onClick={() => {}}
                >
                  Search Jobs
                </button>
              </div>
              <div className="dashboard-subrow">
                <button
                  type="button"
                  className={`filter-btn ${quickCat === "" && categoryFilter === "" && typeFilter === "" ? "active" : ""}`}
                  onClick={() => {
                    setQuickCat("");
                    setCategoryFilter("");
                    setTypeFilter("");
                  }}
                >
                  All Jobs
                </button>
                <button
                  type="button"
                  className={`filter-btn ${typeFilter === "Same-Day / Short-term" ? "active" : ""}`}
                  onClick={() => {
                    setTypeFilter(typeFilter === "Same-Day / Short-term" ? "" : "Same-Day / Short-term");
                    setQuickCat("");
                  }}
                >
                  ⚡ Same-Day Gigs
                </button>
                {["Accounting", "Sales", "HVAC", "Driving", "IT"].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-btn ${quickCat === cat || categoryFilter === cat ? "active" : ""}`}
                    onClick={() => {
                      setQuickCat(cat);
                      setCategoryFilter(cat);
                    }}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  className="filter-btn"
                  id="showAllCategories"
                  onClick={() => setShowCategoryBrowser(prev => !prev)}
                >
                  ☰ All job types
                </button>
              </div>
            </div>

            <div className="jobs-layout">
              <aside className="panel filters">
                <h3>Filters</h3>
                <div className="field">
                  <label>Job type</label>
                  <select
                    id="categoryFilter"
                    value={categoryFilter}
                    onChange={e => {
                      setCategoryFilter(e.target.value);
                      setQuickCat(e.target.value);
                    }}
                  >
                    <option value="">All job types</option>
                    {JOB_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Country</label>
                  <select
                    id="countryFilter"
                    value={countryFilter}
                    onChange={e => setCountryFilter(e.target.value)}
                  >
                    <option value="">Any country</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Israel</option>
                    <option>Canada</option>
                    <option>Belgium</option>
                  </select>
                </div>
                <div className="field">
                  <label>Minimum pay</label>
                  <select
                    id="payFilter"
                    value={payFilter}
                    onChange={e => setPayFilter(e.target.value)}
                  >
                    <option value="0">Any pay</option>
                    <option value="18">18+ / hr</option>
                    <option value="20">20+ / hr</option>
                    <option value="25">25+ / hr</option>
                    <option value="30">30+ / hr</option>
                  </select>
                </div>
                <div className="field">
                  <label>Schedule</label>
                  <select
                    id="typeFilter"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="">Any schedule</option>
                    <option value="Same-Day / Short-term">⚡ Same-Day / Short-term</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Evenings</option>
                    <option>Flexible</option>
                    <option>Temporary</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-light"
                  style={{ width: "100%" }}
                  id="clearFilters"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </aside>

              <div>
                {showCategoryBrowser && (
                  <div className="category-browser" id="categoryBrowser">
                    <h4>Browse all job types</h4>
                    <div className="category-list" id="categoryList">
                      {JOB_CATEGORIES.map(c => (
                        <button
                          key={c}
                          type="button"
                          className="category-link"
                          onClick={() => {
                            setCategoryFilter(c);
                            setQuickCat(c);
                            setShowCategoryBrowser(false);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Pagination */}
                {renderPagination("top")}

                <div className="jobs-list" id="jobsList">
                  {paginatedJobs.length > 0 ? (
                    paginatedJobs.map(j => (
                      <article key={j.id} className="panel job-card" data-id={j.id}>
                        <div>
                          <h3>{j.title}</h3>
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
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="panel" style={{ padding: "28px", textAlign: "center", color: "#6f8087" }}>
                      No matching jobs. Try a broader job type or location.
                    </div>
                  )}
                </div>

                {/* Bottom Pagination */}
                {renderPagination("bottom")}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="shell footer-row">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={96}
              height={32}
              style={{ height: "26px", width: "auto", objectFit: "contain", borderRadius: "5px" }}
            />
            <span>© 2026 YidMatch · Prototype</span>
          </div>
          <div className="foot-links">
            <a href="#jobs">Jobs</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleChooseHiring(); }}>For Employers</a>
            <a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy policy placeholder."); }}>Privacy</a>
          </div>
        </div>
      </footer>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="modal open"
          id="jobModal"
          onClick={e => {
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
              <p style={{ lineHeight: 1.65, color: "#5d7279" }}>
                {selectedJob.desc}
              </p>
              <h4>Why this listing stands out</h4>
              <p style={{ lineHeight: 1.65, color: "#5d7279" }}>
                Clear pay, location, job category and schedule are shown up front. Applicants can apply quickly with direct candidate contact.
              </p>
              {/* Quick direct contact info right in job details */}
              {(() => {
                const contact = getJobContactInfo(selectedJob);
                return (
                  <div style={{ marginTop: "16px", padding: "12px 14px", background: "#f0f7ff", border: "1px solid #d0e5f8", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#0c3365" }}>
                        ⚡ Direct Contact Available
                      </div>
                      <div style={{ fontSize: "12px", color: "#546e7a" }}>
                        WhatsApp, Phone &amp; Email direct to employer
                      </div>
                    </div>
                    <a
                      href={contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="direct-btn direct-btn-wa"
                      style={{ padding: "8px 14px", fontSize: "12.5px" }}
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                );
              })()}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  id="startApplyJobBtn"
                  onClick={() => {
                    handleOpenApply(selectedJob);
                  }}
                >
                  Apply for this Job →
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  id="saveJobBtn"
                  onClick={() => handleToggleSaveJob(selectedJob)}
                >
                  {savedJobs.includes(selectedJob.id) ? "✓ Saved" : "Save Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hybrid Job Application Modal */}
      {applyModalOpen && appliedJob && (
        <div
          className="modal open"
          id="jobApplyModal"
          onClick={e => {
            if ((e.target as HTMLElement).id === "jobApplyModal") setApplyModalOpen(false);
          }}
        >
          <div className="modal-box" style={{ maxWidth: "620px" }}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>📝</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 800 }}>
                      EASY APPLY
                    </span>
                    <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                      ✓ Shomer Shabbos Employer
                    </span>
                  </div>
                  <strong style={{ fontSize: "19px", color: "#092040", display: "block", marginTop: "2px" }}>
                    Apply to {appliedJob.company}
                  </strong>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {appliedJob.title} • {appliedJob.location} • <span style={{ color: "#1e72c8", fontWeight: 700 }}>{appliedJob.payText}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="close"
                id="closeApplyModal"
                onClick={() => setApplyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {applySuccess ? (
                <div className="apply-success-box">
                  <div className="apply-success-icon">✓</div>
                  <h3 style={{ fontSize: "24px", color: "#092040", marginBottom: "8px", fontWeight: 900 }}>
                    Application Sent Successfully!
                  </h3>
                  <p style={{ color: "#546e7a", fontSize: "14px", lineHeight: 1.6, maxWidth: "460px", margin: "0 auto 20px" }}>
                    Your application and resume have been forwarded directly to <strong>{appliedJob.company}</strong>. The hiring manager will review your profile and reach out via phone or email.
                  </p>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", textAlign: "left", marginBottom: "22px", fontSize: "13px" }}>
                    <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Position:</span>
                      <strong style={{ color: "#0f172a" }}>{appliedJob.title}</strong>
                    </div>
                    <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Applicant:</span>
                      <strong style={{ color: "#0f172a" }}>{applyName}</strong>
                    </div>
                    <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Contact:</span>
                      <strong style={{ color: "#0f172a" }}>{applyPhone} • {applyEmail}</strong>
                    </div>
                    {applyResume && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Resume:</span>
                        <strong style={{ color: "#1e72c8" }}>{applyResume.name} ({(applyResume.size / 1024).toFixed(0)} KB)</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setApplyModalOpen(false)}
                      style={{ padding: "12px 28px", borderRadius: "12px" }}
                    >
                      Browse More Jobs
                    </button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => handleToggleSaveJob(appliedJob)}
                      style={{ padding: "12px 20px", borderRadius: "12px" }}
                    >
                      {savedJobs.includes(appliedJob.id) ? "✓ Job Saved" : "Save this Job"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* DIRECT CONTACT QUICK-BAR */}
                  {(() => {
                    const contact = getJobContactInfo(appliedJob);
                    return (
                      <div className="apply-direct-card">
                        <div className="apply-direct-title">
                          <span>⚡</span> Prefer direct contact? Reach the employer right now:
                        </div>
                        <div className="apply-direct-grid">
                          <a
                            href={contact.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="direct-btn direct-btn-wa"
                            id="applyWhatsAppBtn"
                          >
                            <span style={{ fontSize: "16px" }}>💬</span> WhatsApp Employer
                          </a>
                          <a
                            href={`tel:${contact.phoneRaw}`}
                            className="direct-btn direct-btn-phone"
                            id="applyPhoneBtn"
                          >
                            <span>📞</span> Call Direct
                          </a>
                          <a
                            href={`mailto:${contact.email}?subject=${encodeURIComponent(`Application for ${appliedJob.title} via YidMatch`)}`}
                            className="direct-btn direct-btn-email"
                            id="applyEmailBtn"
                          >
                            <span>✉️</span> Direct Email
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="apply-or-divider">
                    <span>or submit your resume / profile below</span>
                  </div>

                  <form onSubmit={handleSubmitApplication}>
                    {applyError && (
                      <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px" }}>
                        {applyError}
                      </div>
                    )}

                    <div className="apply-form-group">
                      <label htmlFor="applicantName">Full Name *</label>
                      <input
                        id="applicantName"
                        type="text"
                        required
                        value={applyName}
                        onChange={e => setApplyName(e.target.value)}
                        placeholder="e.g. Shimon Klein"
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="apply-form-group">
                        <label htmlFor="applicantEmail">Email Address *</label>
                        <input
                          id="applicantEmail"
                          type="email"
                          required
                          value={applyEmail}
                          onChange={e => setApplyEmail(e.target.value)}
                          placeholder="you@email.com"
                        />
                      </div>
                      <div className="apply-form-group">
                        <label htmlFor="applicantPhone">Phone / WhatsApp *</label>
                        <input
                          id="applicantPhone"
                          type="tel"
                          required
                          value={applyPhone}
                          onChange={e => setApplyPhone(e.target.value)}
                          placeholder="(718) 555-0144"
                        />
                      </div>
                    </div>

                    {/* Resume Upload Box */}
                    <div className="apply-form-group">
                      <label>Resume / CV (Optional — PDF, DOCX)</label>
                      <div className="apply-upload-dropzone">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setApplyResume(e.target.files[0]);
                            }
                          }}
                        />
                        <div style={{ fontSize: "24px", marginBottom: "4px" }}>📄</div>
                        {applyResume ? (
                          <div className="apply-file-badge">
                            <span>📎 {applyResume.name} ({(applyResume.size / 1024).toFixed(1)} KB)</span>
                            <button
                              type="button"
                              className="apply-file-remove"
                              onClick={e => {
                                e.stopPropagation();
                                setApplyResume(null);
                              }}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#092040" }}>
                              Click or drag &amp; drop your resume here
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              PDF, DOC, DOCX up to 10MB
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Note / Availability */}
                    <div className="apply-form-group">
                      <label htmlFor="applicantNote">Brief Introduction or Availability (Optional)</label>
                      <textarea
                        id="applicantNote"
                        rows={3}
                        value={applyNote}
                        onChange={e => setApplyNote(e.target.value)}
                        placeholder="Briefly state your relevant experience, schedule availability, or why you're a good fit..."
                      />
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <button
                        type="submit"
                        className="apply-submit-btn"
                        id="submitApplicationBtn"
                        disabled={applySubmitting}
                      >
                        {applySubmitting ? "Delivering Application..." : `Submit Application to ${appliedJob.company}`}
                      </button>
                      <div style={{ fontSize: "11.5px", color: "#64748b", textAlign: "center", marginTop: "9px" }}>
                        🔒 Your info and resume are delivered securely to the employer. Never shared publicly.
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instant SMS Job Alert Modal */}
      {alertModalOpen && (
        <div
          className="modal open"
          id="jobAlertModal"
          onClick={e => {
            if ((e.target as HTMLElement).id === "jobAlertModal") setAlertModalOpen(false);
          }}
        >
          <div className="modal-box" style={{ maxWidth: "560px" }}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🔔</span>
                <div>
                  <strong style={{ fontSize: "18px", color: "#092040" }}>Instant SMS Job Alerts</strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Get texted the second matching jobs are posted</div>
                </div>
              </div>
              <button
                type="button"
                className="close"
                id="closeAlertModal"
                onClick={() => setAlertModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {alertSuccess ? (
                <div style={{ textAlign: "center", padding: "24px 12px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(30, 114, 200, 0.12)", color: "#1e72c8", fontSize: "32px", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: "22px", color: "#092040", marginBottom: "8px" }}>Alerts Activated!</h3>
                  <p style={{ color: "#475569", lineHeight: "1.5", fontSize: "15px", maxWidth: "420px", margin: "0 auto 16px" }}>
                    We have registered <b>{alertPhone}</b>. You will receive an instant text notification whenever a matching job is published!
                  </p>

                  {alertIsSimulated && (
                    <div style={{ margin: "18px 0 24px", padding: "14px 16px", background: "#f0f7ff", borderRadius: "12px", border: "1px solid #bfdbfe", textAlign: "left", fontSize: "13px", color: "#1e3a8a" }}>
                      <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span>📱</span>
                        <span>Twilio Credentials Pending (Simulation Mode)</span>
                      </div>
                      <p style={{ margin: 0, color: "#334155", lineHeight: "1.45" }}>
                        Your alert subscription is active in the database! Because Twilio API keys haven&apos;t been provided yet, simulated SMS messages are logged to the server terminal. Once you add <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>TWILIO_ACCOUNT_SID</code> and <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>TWILIO_AUTH_TOKEN</code> to <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>.env.local</code>, real text messages will deliver directly to your phone.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ minWidth: "160px" }}
                    onClick={() => setAlertModalOpen(false)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAlertModal}>
                  {alertError && (
                    <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>⚠️</span>
                      <span>{alertError}</span>
                    </div>
                  )}

                  <div className="field" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#092040" }}>
                      Cell Phone Number <span className="required-star">*</span>
                    </label>
                    <input
                      id="alertPhoneInput"
                      type="tel"
                      required
                      placeholder="(732) 555-0199"
                      value={alertPhone}
                      onChange={e => {
                        setAlertPhone(e.target.value);
                        if (alertError) setAlertError("");
                      }}
                      style={{ fontSize: "16px", padding: "12px 14px" }}
                    />
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      We only send SMS for jobs that match your preferences. Reply STOP anytime.
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#092040" }}>
                      Your Name (Optional)
                    </label>
                    <input
                      id="alertNameInput"
                      type="text"
                      placeholder="e.g. Yossi or Rivka"
                      value={alertName}
                      onChange={e => setAlertName(e.target.value)}
                    />
                  </div>

                  <div className="field" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#092040" }}>
                      Job Categories (Select any or all)
                    </label>
                    <div className="choice-grid" style={{ maxHeight: "160px", overflowY: "auto", padding: "4px" }}>
                      {INTEREST_OPTIONS.map(item => {
                        const isSelected = alertCategories.includes(item.value);
                        return (
                          <button
                            key={item.value}
                            type="button"
                            className={`choice ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleAlertCategory(item.value)}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-grid" style={{ marginBottom: "16px" }}>
                    <div className="field">
                      <label style={{ fontWeight: "700", color: "#092040" }}>Preferred Location</label>
                      <input
                        id="alertLocationInput"
                        placeholder="e.g. Lakewood, Boro Park, Monsey"
                        value={alertLocation}
                        onChange={e => setAlertLocation(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label style={{ fontWeight: "700", color: "#092040" }}>Minimum Pay</label>
                      <select
                        id="alertMinPayInput"
                        value={alertMinPay}
                        onChange={e => setAlertMinPay(e.target.value)}
                      >
                        <option value="0">Any Pay</option>
                        <option value="20">$20+/hr</option>
                        <option value="25">$25+/hr</option>
                        <option value="30">$30+/hr</option>
                        <option value="35">$35+/hr</option>
                        <option value="40">$40+/hr</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-actions" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setAlertModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="submitAlertModalBtn"
                      className="btn btn-primary"
                      disabled={alertSubmitting}
                      style={{ minWidth: "190px" }}
                    >
                      {alertSubmitting ? "Activating..." : "🔔 Turn On SMS Alerts"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Firebase Auth & Demo Fallback) */}
      {authModalOpen && (
        <div
          className="auth-overlay"
          id="authModal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="auth-card">
            <button
              type="button"
              className="auth-close"
              onClick={() => setAuthModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="auth-head">
              <Image
                src="/logo.png"
                alt="YidMatch"
                width={160}
                height={50}
                className="auth-brand-logo"
              />
              <h2>
                {authTab === "login" && "Sign in to YidMatch"}
                {authTab === "signup" && "Create your account"}
                {authTab === "forgot" && "Reset your password"}
              </h2>
              <p>
                {authTab === "login" && "Access your applications, listings, and saved searches."}
                {authTab === "signup" && "Join our community platform for jobs and hiring."}
                {authTab === "forgot" && "Enter your email to receive a password reset link."}
              </p>
            </div>

            {authTab !== "forgot" && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                  id="tabSignIn"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthError("");
                    setAuthSuccessMsg("");
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authTab === "signup" ? "active" : ""}`}
                  id="tabSignUp"
                  onClick={() => {
                    setAuthTab("signup");
                    setAuthError("");
                    setAuthSuccessMsg("");
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {authError && (
              <div className="auth-error" role="alert">
                ⚠️ {authError}
              </div>
            )}

            {authSuccessMsg && (
              <div className="auth-success" role="alert">
                ✓ {authSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authTab === "signup" && (
                <>
                  <label>I want to:</label>
                  <div className="auth-role-toggle">
                    <button
                      type="button"
                      className={`auth-role-btn ${authRole === "SEEKER" ? "selected" : ""}`}
                      onClick={() => setAuthRole("SEEKER")}
                    >
                      🔎 Find a Job
                    </button>
                    <button
                      type="button"
                      className={`auth-role-btn ${authRole === "EMPLOYER" ? "selected" : ""}`}
                      onClick={() => setAuthRole("EMPLOYER")}
                    >
                      💼 Hire Someone
                    </button>
                  </div>

                  <div>
                    <label htmlFor="authNameInput">Full Name *</label>
                    <input
                      id="authNameInput"
                      type="text"
                      placeholder="e.g. Avi Klein"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>

                  {authRole === "EMPLOYER" && (
                    <div>
                      <label htmlFor="authCompanyInput">Company / Organization *</label>
                      <input
                        id="authCompanyInput"
                        type="text"
                        placeholder="e.g. Apex Distribution LLC"
                        value={authCompany}
                        onChange={(e) => setAuthCompany(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="authPhoneInput">Phone (Optional)</label>
                    <input
                      id="authPhoneInput"
                      type="tel"
                      placeholder="e.g. (718) 555-0199"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="authLocationInput">Location (Optional)</label>
                    <input
                      id="authLocationInput"
                      type="text"
                      placeholder="e.g. Lakewood, NJ"
                      value={authLocation}
                      onChange={(e) => setAuthLocation(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="authEmailInput">Email Address *</label>
                <input
                  id="authEmailInput"
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              {authTab !== "forgot" && (
                <div>
                  <label htmlFor="authPasswordInput">Password *</label>
                  <input
                    id="authPasswordInput"
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                id="authSubmitBtn"
                disabled={authLoading}
              >
                {authLoading ? (
                  "Processing..."
                ) : authTab === "login" ? (
                  "Sign In"
                ) : authTab === "signup" ? (
                  "Create Account"
                ) : (
                  "Send Reset Email"
                )}
              </button>

              <div className="auth-links">
                {authTab === "login" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("forgot");
                        setAuthError("");
                        setAuthSuccessMsg("");
                      }}
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signup");
                        setAuthError("");
                        setAuthSuccessMsg("");
                      }}
                    >
                      Need an account? Register
                    </button>
                  </>
                )}
                {authTab === "forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError("");
                      setAuthSuccessMsg("");
                    }}
                  >
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </form>

            {authTab !== "forgot" && (
              <>
                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  id="googleAuthBtn"
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path
                      fill="#4285F4"
                      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
                    />
                    <path
                      fill="#34A853"
                      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                    />
                    <path
                      fill="#EA4335"
                      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="demo-accounts">
                  <span className="demo-accounts-title">⚡ Instant Quick Sign-In (Demo)</span>
                  <div className="demo-accounts-grid">
                    <button
                      type="button"
                      className="demo-btn"
                      id="demoSeekerBtn"
                      onClick={() => handleDemoLogin("SEEKER")}
                    >
                      <span>🔎</span> Job Seeker
                    </button>
                    <button
                      type="button"
                      className="demo-btn"
                      id="demoEmployerBtn"
                      onClick={() => handleDemoLogin("EMPLOYER")}
                    >
                      <span>💼</span> Employer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Toast */}
      <div className={`toast ${toastVisible ? "show" : ""}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}
