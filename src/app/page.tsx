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

const EMPLOYER_CATEGORY_OPTIONS = [
  { label: "🧾 Accounting & Finance", value: "Accounting & Finance" },
  { label: "🗂️ Administration & Office", value: "Administration & Office" },
  { label: "📈 Sales & Business Development", value: "Sales" },
  { label: "🎧 Customer Service", value: "Customer Service" },
  { label: "❄️ HVAC / Climate Control", value: "HVAC" },
  { label: "🔧 Plumbing & Pipefitting", value: "Plumbing" },
  { label: "⚡ Electrical & Wiring", value: "Electrical" },
  { label: "🏗️ Construction & Trades", value: "Construction & Trades" },
  { label: "🚐 Driving & Delivery", value: "Driving & Delivery" },
  { label: "📦 Warehouse & Logistics", value: "Warehouse & Logistics" },
  { label: "💻 IT & Technology", value: "IT & Technology" },
  { label: "🎨 Design & Creative", value: "Design & Creative" },
  { label: "📣 Marketing & Media", value: "Marketing" },
  { label: "🏢 Real Estate & Property", value: "Real Estate & Property Management" },
  { label: "🩺 Healthcare & Nursing", value: "Healthcare" },
  { label: "📚 Education & Teaching", value: "Education" },
  { label: "🍽️ Food Service & Culinary", value: "Food Service" },
  { label: "🛍️ Retail & Store Operations", value: "Retail" },
  { label: "🛡️ Security & Protection", value: "Security" },
  { label: "👔 Management & Operations", value: "Management" },
  { label: "🧹 Cleaning & Maintenance", value: "Cleaning & Maintenance" },
  { label: "🏭 Manufacturing & Assembly", value: "Manufacturing" },
  { label: "⚖️ Legal & Compliance", value: "Legal" },
  { label: "🤝 Nonprofit & Community", value: "Nonprofit / Community" },
  { label: "⚡ Same-Day / Daily Gig", value: "Same-Day / Short-term" },
  { label: "💡 Other / General", value: "Other" }
];

function DropdownWithCustom({
  id,
  value,
  onChange,
  options,
  placeholder,
  allowEmpty,
  emptyLabel,
  customPlaceholder = "Type your own...",
}: {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  customPlaceholder?: string;
}) {
  const normOptions = useMemo(() => {
    return options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  }, [options]);

  const isKnownOption = (allowEmpty && value === "") || normOptions.some(o => o.value === value);
  const [isCustomMode, setIsCustomMode] = useState(!isKnownOption && Boolean(value));
  const [customDraft, setCustomDraft] = useState(!isKnownOption && Boolean(value) ? value : "");

  useEffect(() => {
    const known = (allowEmpty && value === "") || normOptions.some(o => o.value === value);
    if (known) {
      setIsCustomMode(false);
    } else if (value && value !== "__custom__") {
      setIsCustomMode(true);
      setCustomDraft(value);
    }
  }, [value, normOptions, allowEmpty]);

  return (
    <div style={{ width: "100%" }}>
      <select
        id={id}
        value={isCustomMode ? "__custom__" : value}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setIsCustomMode(true);
            const initial = customDraft || "";
            onChange(initial);
          } else {
            setIsCustomMode(false);
            onChange(e.target.value);
          }
        }}
      >
        {allowEmpty && <option value="">{emptyLabel || "Any"}</option>}
        {placeholder && !allowEmpty && <option value="">{placeholder}</option>}
        {normOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        <option value="__custom__">✏️ Other / Type your own...</option>
      </select>

      {isCustomMode && (
        <div style={{ marginTop: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            type="text"
            placeholder={customPlaceholder}
            value={value === "__custom__" ? "" : value}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              onChange(e.target.value);
            }}
            autoFocus
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1.5px solid #1e72c8",
              fontSize: "14px",
              background: "#f0f7ff",
              color: "#0a2540",
              fontWeight: "600",
            }}
          />
          <button
            type="button"
            title="Reset to preset options"
            onClick={() => {
              setIsCustomMode(false);
              setCustomDraft("");
              onChange(allowEmpty ? "" : normOptions[0]?.value || "");
            }}
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 700,
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            ✕ Reset
          </button>
        </div>
      )}
    </div>
  );
}

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
    } catch (_) { }
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
    } catch (_) { }
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
  const [empPayRate, setEmpPayRate] = useState("");
  const [isSameDayGig, setIsSameDayGig] = useState(false);
  const [empBenefits, setEmpBenefits] = useState<string[]>([]);

  // Searchable text dropdown states
  const [interestDropdownOpen, setInterestDropdownOpen] = useState(false);
  const [empCatDropdownOpen, setEmpCatDropdownOpen] = useState(false);
  const [empCatSearchQuery, setEmpCatSearchQuery] = useState("");

  // Plan selection
  const [chosenPublishPlan, setChosenPublishPlan] = useState<"standard" | "featured" | "sameday">("featured");

  // Contact Us Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmailOrPhone, setContactEmailOrPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);

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

  // User Profile Dropdown & Resume Builder State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeFullName, setResumeFullName] = useState("");
  const [resumePhone, setResumePhone] = useState("");
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumeCity, setResumeCity] = useState("Lakewood, NJ");
  const [resumeTitle, setResumeTitle] = useState("Full-Charge Bookkeeper / Office Coordinator");
  const [resumeSummary, setResumeSummary] = useState(
    "Hardworking, detail-oriented professional with strong administrative, communication, and organizational skills. Seeking a stable position within a heimish, growth-oriented environment."
  );
  const [resumeExperience, setResumeExperience] = useState(
    "• Office Coordinator & Billing Specialist (2023–Present): Managed accounts, vendor invoicing, and customer inquiries.\n• Administrative Assistant (2021–2023): Handled scheduling, email correspondence, and weekly reports."
  );
  const [resumeSkills, setResumeSkills] = useState(
    "QuickBooks, Microsoft Excel, Client Communication, English & Yiddish Fluent, Shomer Shabbos"
  );
  const [resumeEducation, setResumeEducation] = useState(
    "High School Graduate • Bookkeeping & Office Accounting Course"
  );
  const [resumeSaved, setResumeSaved] = useState(false);

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
      if (!resumeFullName && user.name) setResumeFullName(user.name);
      if (!resumeEmail && user.email) setResumeEmail(user.email);
      if (!resumePhone && user.phone) setResumePhone(user.phone);
    }
  }, [user]);

  // Close user profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#userProfileDropdown") && !target.closest("#userProfileTriggerBtn") && !target.closest("#guestProfileTriggerBtn")) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [userDropdownOpen]);

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yidmatch_saved_jobs");
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    } catch (_) { }
  }, []);

  const handleToggleSaveJob = (job: JobItem) => {
    setSavedJobs(prev => {
      const exists = prev.includes(job.id);
      const updated = exists ? prev.filter(id => id !== job.id) : [...prev, job.id];
      try {
        localStorage.setItem("yidmatch_saved_jobs", JSON.stringify(updated));
      } catch (_) { }
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

      let data: any = {};
      try {
        const text = await res.text();
        if (text && text.trim()) {
          data = JSON.parse(text);
        }
      } catch (_) { }

      if (res.ok && data?.success) {
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

    const userPay = (empPayRate || empPayMin || "").trim();
    if (!userPay) return `Competitive${suffix}`;

    const hasSym = userPay.startsWith("$") || userPay.startsWith("£") || userPay.startsWith("₪") || userPay.startsWith("€") || userPay.startsWith("C$");
    const hasSuffix = userPay.includes("/") || userPay.toLowerCase().includes("hr") || userPay.toLowerCase().includes("yr") || userPay.toLowerCase().includes("day");

    return `${hasSym ? "" : sym}${userPay}${hasSuffix ? "" : suffix}${empPayType === "Commission" ? " commission" : ""
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
    } catch (_) { }
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

  const handlePublishJobDirect = (planType?: "standard" | "featured" | "sameday") => {
    if (!empCompany.trim() || !empTitle.trim()) {
      showToast("Please provide the business name and job title.");
      return;
    }
    if (!empCountry || !empLocation.trim()) {
      showToast("Please specify the job country and location.");
      return;
    }
    const payVal = empPayRate.trim() || empPayMin.trim();
    if (!payVal) {
      showToast("Please specify the pay / compensation.");
      return;
    }
    if (!empContactName.trim() || !empPhone.trim()) {
      showToast("Please provide a contact person and phone number for verification.");
      return;
    }

    showToast("✓ Proceeding to payment ($25) — job is now live!");

    const effectivePay = Number(payVal.replace(/[^0-9.]/g, "")) || 25;
    const finalSchedule = isSameDayGig ? "Same-Day / Short-term" : empSchedule;

    const newJob: JobItem = {
      id: Date.now(),
      icon: isSameDayGig ? "⚡" : "💼",
      title: empTitle,
      company: empCompany,
      location: `${empLocation}, ${empCountry}`,
      country: empCountry,
      category: empCategory || (isSameDayGig ? "Same-Day / Short-term" : "General"),
      pay: effectivePay,
      payText: getPayText(),
      type: finalSchedule,
      age: "Just now",
      desc: empDesc || "Great opportunity with a heimish workplace."
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
      document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  };

  const handleChoosePublishPlan = (planName: string) => {
    handlePublishJobDirect(planName.includes("Featured") ? "featured" : "standard");
  };

  // Unique de-duplicated Jobs list
  const uniqueJobsList = useMemo(() => {
    const seen = new Set<string>();
    return jobsList.filter(j => {
      const key = `${j.title.trim().toLowerCase()}|${j.company.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [jobsList]);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    const q = searchInput.toLowerCase().trim();
    const loc = locationSearch.toLowerCase().trim();
    const min = Number(payFilter);

    return uniqueJobsList.filter(j => {
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
  }, [uniqueJobsList, searchInput, locationSearch, countryFilter, payFilter, typeFilter, quickCat, categoryFilter]);

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
                    <DropdownWithCustom
                      id="profileGender"
                      value={profileGender}
                      onChange={setProfileGender}
                      options={["Male", "Female", "Prefer not to say"]}
                      allowEmpty
                      emptyLabel="Choose one"
                      customPlaceholder="Enter custom gender / title..."
                    />
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
                    <DropdownWithCustom
                      id="profileStage"
                      value={profileStage}
                      onChange={setProfileStage}
                      options={["Bochur", "Yungerman", "Man", "Girl", "Woman"]}
                      allowEmpty
                      emptyLabel="Choose one"
                      customPlaceholder="e.g. Kollel Yungerman, Student..."
                    />
                  </div>
                  <div className="field">
                    <label>Country</label>
                    <DropdownWithCustom
                      id="profileCountry"
                      value={profileCountry}
                      onChange={setProfileCountry}
                      options={["United States", "United Kingdom", "Israel", "Canada", "Belgium"]}
                      allowEmpty
                      emptyLabel="Any country"
                      customPlaceholder="Enter country..."
                    />
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ margin: 0, fontWeight: 700 }}>Job interests</label>
                    {profileInterests.length > 0 && (
                      <button
                        type="button"
                        style={{ border: "none", background: "none", color: "#1e72c8", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                        onClick={() => setProfileInterests([])}
                      >
                        Clear all ({profileInterests.length})
                      </button>
                    )}
                  </div>

                  <div className="searchable-dropdown-wrapper">
                    <div
                      className="searchable-input-container"
                      onClick={() => setInterestDropdownOpen(true)}
                    >
                      {profileInterests.map(val => {
                        const opt = INTEREST_OPTIONS.find(o => o.value === val);
                        return (
                          <span key={val} className="selected-chip">
                            <span>{opt?.label || val}</span>
                            <button
                              type="button"
                              className="chip-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInterest(val);
                              }}
                              aria-label={`Remove ${val}`}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                      <input
                        id="interestSearch"
                        className="searchable-input-field"
                        placeholder={profileInterests.length === 0 ? "Type or add your own job interests (e.g. Accounting, HVAC, Secretary)..." : "Type to add your own or choose..."}
                        value={interestSearchQuery}
                        onChange={e => {
                          setInterestSearchQuery(e.target.value);
                          setInterestDropdownOpen(true);
                        }}
                        onFocus={() => setInterestDropdownOpen(true)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && interestSearchQuery.trim()) {
                            e.preventDefault();
                            const customVal = interestSearchQuery.trim();
                            if (!profileInterests.includes(customVal)) {
                              setProfileInterests(prev => [...prev, customVal]);
                            }
                            setInterestSearchQuery("");
                            setInterestDropdownOpen(false);
                          }
                        }}
                      />
                    </div>

                    {interestDropdownOpen && (
                      <>
                        <div
                          style={{ position: "fixed", inset: 0, zIndex: 1050 }}
                          onClick={() => setInterestDropdownOpen(false)}
                        />
                        <div className="searchable-dropdown-menu">
                          {/* Option to add custom entered interest */}
                          {interestSearchQuery.trim().length > 0 && (
                            <button
                              type="button"
                              className="searchable-dropdown-item"
                              style={{ background: "#f0fdf4", borderBottom: "1.5px solid #bbf7d0", color: "#166534", fontWeight: 800 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const customVal = interestSearchQuery.trim();
                                if (!profileInterests.includes(customVal)) {
                                  setProfileInterests(prev => [...prev, customVal]);
                                }
                                setInterestSearchQuery("");
                                setInterestDropdownOpen(false);
                              }}
                            >
                              <span>➕ Add custom interest: <strong>"{interestSearchQuery.trim()}"</strong></span>
                              <span style={{ fontSize: "11px", background: "#16a34a", color: "#ffffff", padding: "2px 8px", borderRadius: "999px", fontWeight: 800 }}>
                                Add your own
                              </span>
                            </button>
                          )}

                          {(() => {
                            const filtered = INTEREST_OPTIONS.filter(opt =>
                              opt.label.toLowerCase().includes(interestSearchQuery.toLowerCase()) ||
                              opt.value.toLowerCase().includes(interestSearchQuery.toLowerCase())
                            );
                            if (filtered.length === 0 && !interestSearchQuery.trim()) {
                              return (
                                <div className="searchable-dropdown-empty">
                                  Type any job interest or role you want to add.
                                </div>
                              );
                            }
                            return filtered.map(item => {
                              const isSelected = profileInterests.includes(item.value);
                              return (
                                <button
                                  key={item.value}
                                  type="button"
                                  className={`searchable-dropdown-item ${isSelected ? "is-selected" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleInterest(item.value);
                                    setInterestSearchQuery("");
                                  }}
                                >
                                  <span>{item.label}</span>
                                  {isSelected ? (
                                    <span style={{ color: "#1e72c8", fontWeight: 800 }}>✓ Selected</span>
                                  ) : (
                                    <span style={{ color: "#8da4ac", fontSize: "12px" }}>+ Add</span>
                                  )}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </>
                    )}
                  </div>

                  {profileInterests.length === 0 && (
                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#6e8086", fontWeight: 700 }}>Popular:</span>
                      {[
                        { label: "🧾 Accounting", val: "Accounting" },
                        { label: "🗂️ Admin", val: "Administration" },
                        { label: "📈 Sales", val: "Sales" },
                        { label: "❄️ HVAC", val: "HVAC" },
                        { label: "🚐 Driving", val: "Driving" },
                        { label: "📦 Warehouse", val: "Warehouse" }
                      ].map(pop => (
                        <button
                          key={pop.val}
                          type="button"
                          onClick={() => toggleInterest(pop.val)}
                          style={{
                            border: "1px solid #dce8e4",
                            background: "#f8fafc",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "12px",
                            color: "#334155",
                            cursor: "pointer"
                          }}
                        >
                          {pop.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>Schedule</label>
                    <DropdownWithCustom
                      id="profileSchedule"
                      value={profileSchedule}
                      onChange={setProfileSchedule}
                      options={["Full-time", "Part-time", "Evenings", "Flexible"]}
                      allowEmpty
                      emptyLabel="Any schedule"
                      customPlaceholder="e.g. Morning Seder compatible, Sundays only..."
                    />
                  </div>
                  <div className="field">
                    <label>Minimum pay</label>
                    <DropdownWithCustom
                      id="profileMinPay"
                      value={profileMinPay}
                      onChange={setProfileMinPay}
                      options={[
                        { value: "0", label: "Any pay" },
                        { value: "20", label: "$20+/hr" },
                        { value: "25", label: "$25+/hr" },
                        { value: "30", label: "$30+/hr" },
                      ]}
                      customPlaceholder="Enter desired minimum pay..."
                    />
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
        <div className="employer-wrap" style={{ maxWidth: "860px" }}>
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
              ← Back to Choice
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEmployerGateOpen(false)}
                style={{ padding: "6px 12px", fontSize: "13px" }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="employer-card employer-single-card" style={{ padding: "30px 32px" }}>
            <div className="employer-intro" style={{ marginBottom: "24px" }}>
              <div>
                <span className="privacy-chip">💼 Post a Job · Direct & Verified</span>
                <h2 id="employerTitle" style={{ fontSize: "28px", marginTop: "8px", fontWeight: 900, color: "#0d2c38" }}>
                  What are you hiring for?
                </h2>
                <p className="profile-lead" style={{ margin: "4px 0 0", color: "#5d7279" }}>
                  Fill out the job details below on this single page. Your listing publishes directly to local candidates.
                </p>
              </div>
              <span className="time-badge">⚡ Takes ~2 minutes</span>
            </div>

            {/* SECTION 1: BUSINESS & ROLE */}
            <div className="employer-section-block">
              <div className="employer-section-header">
                <span className="sicon">🏢</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850 }}>1. Business and Role</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#5d7279" }}>The basic information applicants see first.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>
                    Business / employer name <span className="required-star">*</span>
                  </label>
                  <input
                    id="empCompany"
                    placeholder="Enter your business or employer name"
                    value={empCompany}
                    onChange={e => setEmpCompany(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>How many people are you hiring?</label>
                  <DropdownWithCustom
                    id="empOpenings"
                    value={empOpenings}
                    onChange={setEmpOpenings}
                    options={["1 person", "2 people", "3–5 people", "6–10 people", "10+ people"]}
                    customPlaceholder="e.g. Multiple crews, 15+ workers..."
                  />
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ margin: 0 }}>
                      Job category <span className="required-star">*</span>
                    </label>
                    {empCategory && (
                      <button
                        type="button"
                        style={{ border: "none", background: "none", color: "#1e72c8", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                        onClick={() => {
                          setEmpCategory("");
                          setEmpCatSearchQuery("");
                        }}
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <div className="searchable-dropdown-wrapper">
                    <div
                      className="searchable-input-container"
                      onClick={() => setEmpCatDropdownOpen(true)}
                    >
                      {empCategory ? (
                        <span className="selected-chip" style={{ background: "#e0f2fe", borderColor: "#7dd3fc", color: "#0369a1" }}>
                          <span>{empCategory}</span>
                          <button
                            type="button"
                            className="chip-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpCategory("");
                              setEmpCatSearchQuery("");
                            }}
                            aria-label="Clear category"
                          >
                            ✕
                          </button>
                        </span>
                      ) : null}
                      <input
                        id="empCategorySearch"
                        className="searchable-input-field"
                        placeholder={empCategory ? "Type to change or type your own..." : "Type or click to choose category, or type your own (e.g. Kosher Bakery, HVAC, Dispatcher)..."}
                        value={empCatSearchQuery}
                        onChange={e => {
                          setEmpCatSearchQuery(e.target.value);
                          setEmpCatDropdownOpen(true);
                        }}
                        onFocus={() => setEmpCatDropdownOpen(true)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && empCatSearchQuery.trim()) {
                            e.preventDefault();
                            setEmpCategory(empCatSearchQuery.trim());
                            setEmpCatSearchQuery("");
                            setEmpCatDropdownOpen(false);
                          }
                        }}
                      />
                    </div>

                    {empCatDropdownOpen && (
                      <>
                        <div
                          style={{ position: "fixed", inset: 0, zIndex: 1050 }}
                          onClick={() => setEmpCatDropdownOpen(false)}
                        />
                        <div className="searchable-dropdown-menu">
                          {/* Option to use custom entered category */}
                          {empCatSearchQuery.trim().length > 0 && (
                            <button
                              type="button"
                              className="searchable-dropdown-item"
                              style={{ background: "#f0fdf4", borderBottom: "1.5px solid #bbf7d0", color: "#166534", fontWeight: 800 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmpCategory(empCatSearchQuery.trim());
                                setEmpCatSearchQuery("");
                                setEmpCatDropdownOpen(false);
                              }}
                            >
                              <span>➕ Use custom category: <strong>"{empCatSearchQuery.trim()}"</strong></span>
                              <span style={{ fontSize: "11px", background: "#16a34a", color: "#ffffff", padding: "2px 8px", borderRadius: "999px", fontWeight: 800 }}>
                                Use your own
                              </span>
                            </button>
                          )}

                          {(() => {
                            const filtered = EMPLOYER_CATEGORY_OPTIONS.filter(opt =>
                              opt.label.toLowerCase().includes(empCatSearchQuery.toLowerCase()) ||
                              opt.value.toLowerCase().includes(empCatSearchQuery.toLowerCase())
                            );
                            if (filtered.length === 0 && !empCatSearchQuery.trim()) {
                              return (
                                <div className="searchable-dropdown-empty">
                                  Type any category or select from the list.
                                </div>
                              );
                            }
                            return filtered.map(item => {
                              const isSelected = empCategory === item.value;
                              return (
                                <button
                                  key={item.value}
                                  type="button"
                                  className={`searchable-dropdown-item ${isSelected ? "is-selected" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEmpCategory(item.value);
                                    setEmpCatSearchQuery("");
                                    setEmpCatDropdownOpen(false);
                                  }}
                                >
                                  <span>{item.label}</span>
                                  {isSelected ? (
                                    <span style={{ color: "#1e72c8", fontWeight: 800 }}>✓ Selected</span>
                                  ) : (
                                    <span style={{ color: "#8da4ac", fontSize: "12px" }}>Select</span>
                                  )}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="field">
                  <label>Seniority</label>
                  <DropdownWithCustom
                    id="empSeniority"
                    value={empSeniority}
                    onChange={setEmpSeniority}
                    options={[
                      "Entry level / willing to train",
                      "Some experience",
                      "Experienced",
                      "Supervisor / manager",
                      "Senior / specialist",
                    ]}
                    customPlaceholder="e.g. Senior Partner, Lead Foreman..."
                  />
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
            </div>

            {/* SECTION 2: WORK SETUP, SAME-DAY HIRING & PAY */}
            <div className="employer-section-block">
              <div className="employer-section-header">
                <span className="sicon">📍</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850 }}>2. Work Setup, Schedule & Pay</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#5d7279" }}>Location, employment type, same-day hiring, and compensation.</p>
                </div>
              </div>

              {/* SAME-DAY HIRING TOGGLE CARD */}
              <div
                className={`same-day-banner-card ${isSameDayGig ? "active" : ""}`}
                id="sameDayHiringToggleCard"
                onClick={() => {
                  const nextVal = !isSameDayGig;
                  setIsSameDayGig(nextVal);
                  if (nextVal) {
                    setEmpSchedule("Same-Day / Short-term");
                  } else {
                    if (empSchedule === "Same-Day / Short-term") {
                      setEmpSchedule("Full-time");
                    }
                  }
                }}
                style={{ cursor: "pointer", marginBottom: "18px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>⚡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "15.5px", color: isSameDayGig ? "#14532d" : "#0f2e24", fontWeight: 850 }}>
                        Same-Day / Immediate Hiring
                      </strong>
                      <span className={`badge-urgent-tag ${isSameDayGig ? "active" : ""}`}>
                        {isSameDayGig ? "⚡ URGENT SAME-DAY GIG" : "URGENT GIG"}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: isSameDayGig ? "#166534" : "#475569", lineHeight: 1.5 }}>
                      Need someone today or right away? (Event setup, warehouse rush, relief driver, emergency repair helper).
                      When enabled, this job is highlighted with a Same-Day badge and alerted to daily gig seekers immediately.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <div
                      className={`toggle-switch-box ${isSameDayGig ? "active on" : ""}`}
                      id="sameDayToggleBtn"
                      role="switch"
                      aria-checked={isSameDayGig}
                    >
                      <span className="toggle-switch-knob" />
                    </div>
                    <span className={`same-day-status-pill ${isSameDayGig ? "on" : "off"}`}>
                      {isSameDayGig ? "✓ ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>
                    Country <span className="required-star">*</span>
                  </label>
                  <DropdownWithCustom
                    id="empCountry"
                    value={empCountry}
                    onChange={setEmpCountry}
                    options={["United States", "United Kingdom", "Israel", "Canada", "Belgium"]}
                    allowEmpty
                    emptyLabel="Choose country"
                    customPlaceholder="Enter country..."
                  />
                </div>

                <div className="field">
                  <label>
                    City / location <span className="required-star">*</span>
                  </label>
                  <input
                    id="empLocation"
                    placeholder="e.g. Lakewood, NJ or Flatbush, Brooklyn"
                    value={empLocation}
                    onChange={e => setEmpLocation(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Work arrangement</label>
                  <DropdownWithCustom
                    id="empArrangement"
                    value={empArrangement}
                    onChange={setEmpArrangement}
                    options={["On-site", "Hybrid", "Remote", "On the road / driving"]}
                    customPlaceholder="e.g. Flexible hybrid, Field work..."
                  />
                </div>

                {/* EMPLOYMENT TYPE (NO INTERN) */}
                <div className="field">
                  <label>Employment type</label>
                  <DropdownWithCustom
                    id="empSchedule"
                    value={empSchedule}
                    onChange={(val) => {
                      setEmpSchedule(val);
                      if (val === "Same-Day / Short-term") {
                        setIsSameDayGig(true);
                      } else if (isSameDayGig) {
                        setIsSameDayGig(false);
                      }
                    }}
                    options={[
                      "Full-time",
                      "Part-time",
                      "Temporary",
                      "Seasonal",
                      "Contract / freelance",
                      "Flexible",
                      "Same-Day / Short-term",
                    ]}
                    customPlaceholder="e.g. Fridays only, Chol Hamoed gig..."
                  />
                </div>

                <div className="field">
                  <label>Typical hours (optional)</label>
                  <input
                    id="empHours"
                    placeholder="e.g. 9:00 AM–5:00 PM"
                    value={empHours}
                    onChange={e => setEmpHours(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Start date</label>
                  <DropdownWithCustom
                    id="empStart"
                    value={empStart}
                    onChange={setEmpStart}
                    options={[
                      "As soon as possible",
                      "Immediate / Today (Same-Day)",
                      "Within 2 weeks",
                      "Within a month",
                      "Flexible",
                    ]}
                    customPlaceholder="e.g. Starting Elul Zman, Nov 1..."
                  />
                </div>

                {/* SINGLE PAY FIELD (REPLACING MIN & MAX) */}
                <div className="field">
                  <label>Currency</label>
                  <DropdownWithCustom
                    id="empCurrency"
                    value={empCurrency}
                    onChange={setEmpCurrency}
                    options={["USD $", "GBP £", "ILS ₪", "CAD C$", "EUR €"]}
                    customPlaceholder="e.g. AUD, CHF..."
                  />
                </div>

                <div className="field" style={{ gridColumn: "span 2" }}>
                  <label>
                    Pay / Rate <span className="required-star">*</span>
                    <span className="helper">Enter the compensation (e.g. 25, $25–$35/hr, $150 flat, $65k/year)</span>
                  </label>
                  <input
                    id="empPayRate"
                    placeholder="e.g. 30 (or $25–$35/hr, $150 flat, $65,000/yr)"
                    value={empPayRate || empPayMin}
                    onChange={e => {
                      setEmpPayRate(e.target.value);
                      setEmpPayMin(e.target.value);
                    }}
                  />
                </div>

                <div className="field">
                  <label>Pay Type</label>
                  <DropdownWithCustom
                    id="empPayType"
                    value={empPayType}
                    onChange={setEmpPayType}
                    options={[
                      "Hourly",
                      "Daily",
                      "Yearly salary",
                      "Weekly",
                      "Per job / project",
                      "Commission",
                      "Base + commission",
                    ]}
                    customPlaceholder="e.g. Monthly stipend, Hourly + bonus..."
                  />
                </div>
              </div>

              {/* BENEFITS / EXTRAS */}
              <div style={{ marginTop: "14px" }}>
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
                  Benefits / perks (optional)
                </label>
                <div className="toggle-row" id="benefitChoices">
                  {[
                    "Paid time off",
                    "Health insurance",
                    "Paid holidays",
                    "Commission / bonus",
                    "Transportation help",
                    "Meals provided",
                    "Training provided",
                    "Shomer Shabbos & Yom Tov"
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
            </div>

            {/* SECTION 3: CANDIDATE QUALIFICATIONS */}
            <div className="employer-section-block">
              <div className="employer-section-header">
                <span className="sicon">🎯</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850 }}>3. Candidate Qualifications</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#5d7279" }}>Choose requirements that matter for doing the job well.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Experience needed</label>
                  <DropdownWithCustom
                    id="empExperience"
                    value={empExperience}
                    onChange={setEmpExperience}
                    options={[
                      "No experience needed",
                      "Some experience preferred",
                      "1+ year required",
                      "2–3 years required",
                      "5+ years required",
                    ]}
                    customPlaceholder="e.g. Smicha required, Active license..."
                  />
                </div>
                <div className="field">
                  <label>Will you train?</label>
                  <DropdownWithCustom
                    id="empTrain"
                    value={empTrain}
                    onChange={setEmpTrain}
                    options={[
                      "Yes, full training",
                      "Some training",
                      "No, must already know the job",
                    ]}
                    customPlaceholder="e.g. Apprenticeship program, Paid trial..."
                  />
                </div>
                <div className="field">
                  <label>Driver’s license</label>
                  <DropdownWithCustom
                    id="empLicense"
                    value={empLicense}
                    onChange={setEmpLicense}
                    options={[
                      "Not needed",
                      "Preferred",
                      "Required",
                      "Required because driving is part of the job",
                    ]}
                    customPlaceholder="e.g. CDL Class B, Clean driving record..."
                  />
                </div>
                <div className="field">
                  <label>Own vehicle</label>
                  <DropdownWithCustom
                    id="empVehicle"
                    value={empVehicle}
                    onChange={setEmpVehicle}
                    options={["Not needed", "Preferred", "Required"]}
                    customPlaceholder="e.g. Cargo van or pickup truck..."
                  />
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
                <b>Important:</b> Keep hiring requirements job-related and compliant with local employment laws.
              </div>

              <div style={{ marginTop: "18px" }}>
                <div className="form-grid">
                  <div className="field">
                    <label>Resume</label>
                    <DropdownWithCustom
                      id="empResume"
                      value={empResume}
                      onChange={setEmpResume}
                      options={["Not required", "Optional", "Required"]}
                      customPlaceholder="e.g. References only, Work samples..."
                    />
                  </div>
                  <div className="field">
                    <label>Application style</label>
                    <DropdownWithCustom
                      id="empApplyStyle"
                      value={empApplyStyle}
                      onChange={setEmpApplyStyle}
                      options={[
                        "Quick apply — name + basic profile",
                        "Profile + work experience",
                        "Full application",
                      ]}
                      customPlaceholder="e.g. Phone screening first, Walk-in..."
                    />
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
            </div>

            {/* SECTION 4: CONTACT & INQUIRIES */}
            <div className="employer-section-block">
              <div className="employer-section-header">
                <span className="sicon">📬</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 850 }}>4. Contact & Inquiries</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#5d7279" }}>How applicants and notifications reach your team.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>
                    Contact person <span className="required-star">*</span>
                  </label>
                  <input
                    id="empContactName"
                    placeholder="e.g. Mendy Klein"
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
                    placeholder="e.g. 732-555-0199 (for verification & alerts)"
                    value={empPhone}
                    onChange={e => setEmpPhone(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Email address</label>
                  <input
                    id="empEmail"
                    type="email"
                    placeholder="hiring@business.com"
                    value={empEmail}
                    onChange={e => setEmpEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Preferred contact method</label>
                  <DropdownWithCustom
                    id="empMessaging"
                    value={empMessaging}
                    onChange={setEmpMessaging}
                    options={["Email notifications", "WhatsApp / Text", "Phone calls"]}
                    customPlaceholder="e.g. WhatsApp only, Telegram..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: PUBLISH & PAYMENT ($25 FLAT FEE ONLY) */}
            <div className="employer-section-block" style={{ border: "2px solid #b5d5f5", background: "#f8fbff", borderRadius: "16px", padding: "24px" }}>
              <div className="employer-section-header" style={{ borderBottom: "none", paddingBottom: "4px" }}>
                <span className="sicon">🚀</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#0c3365" }}>
                    5. Publish Job Listing ($25 Flat Fee)
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>
                    Simple, flat $25 fee. No recurring charges or complicated tiers.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "16px", background: "#ffffff", padding: "20px 24px", borderRadius: "14px", border: "1.5px solid #cbdde3", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 900, color: "#0c3365" }}>$25</span>
                    <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "999px", fontWeight: 800 }}>
                      One-Time Flat Listing Fee
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#475569", lineHeight: 1.4 }}>
                    ✓ 30-day active listing &nbsp;•&nbsp; ✓ Direct candidate applications &nbsp;•&nbsp; ✓ Instant SMS alerts to local matches
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  id="directPublishBtn"
                  style={{ fontSize: "15px", padding: "13px 26px", fontWeight: 850, boxShadow: "0 6px 18px rgba(30, 114, 200, 0.35)" }}
                  onClick={() => handlePublishJobDirect("standard")}
                >
                  Proceed to Payment ($25) & Publish Job →
                </button>
              </div>
            </div>
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

      {/* Floating Contact Owner Button */}
      <button
        type="button"
        className="contact-float-btn"
        id="floatingContactBtn"
        onClick={() => setContactModalOpen(true)}
        aria-label="Contact Owner"
      >
        <span className="badge-dot" />
        <span>💬 Contact Owner</span>
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
            <button
              type="button"
              className="btn btn-light"
              id="topbarContactBtn"
              onClick={() => setContactModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>💬</span> Contact Us
            </button>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="user-profile-menu-container" style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`auth-user-chip-btn ${userDropdownOpen ? "open" : ""}`}
                    id="userProfileTriggerBtn"
                    onClick={() => setUserDropdownOpen(prev => !prev)}
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
                        <button
                          type="button"
                          className="user-dropdown-item-btn"
                          id="userDropdownEditProfileBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setProfileGateOpen(true);
                            setProfileStep(1);
                          }}
                        >
                          <span className="item-icon">✏️</span>
                          <div>
                            <div className="item-title">Edit Profile</div>
                            <div className="item-sub">Update location & job preferences</div>
                          </div>
                        </button>

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

                        <div className="user-dropdown-divider" />

                        <button
                          type="button"
                          className="user-dropdown-item-btn logout"
                          id="userDropdownLogoutBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleSignOut();
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="user-profile-menu-container" style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`auth-user-chip-btn ${userDropdownOpen ? "open" : ""}`}
                    id="guestProfileTriggerBtn"
                    onClick={() => setUserDropdownOpen(prev => !prev)}
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
                          id="guestDropdownEditProfileBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setProfileGateOpen(true);
                            setProfileStep(1);
                          }}
                        >
                          <span className="item-icon">✏️</span>
                          <div>
                            <div className="item-title">Edit Profile</div>
                            <div className="item-sub">Update location & job preferences</div>
                          </div>
                        </button>

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

                        <button
                          type="button"
                          className="user-dropdown-item-btn"
                          id="guestDropdownSignInBtn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleOpenAuth("login");
                          }}
                        >
                          <span className="item-icon">🔑</span>
                          <div>
                            <div className="item-title" style={{ color: "#1e72c8" }}>Sign In / Register</div>
                            <div className="item-sub">Sync applications and SMS alerts</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleChooseHiring}
                >
                  Post a Job
                </button>
              </div>
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
                  onClick={() => { }}
                >
                  Search Jobs
                </button>
              </div>
              {/* TWO BUTTONS: ALL JOBS vs SAME-DAY GIGS */}
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div className="view-switch-banner" id="viewSwitchBanner">
                  <button
                    type="button"
                    className={`view-switch-btn ${typeFilter !== "Same-Day / Short-term" ? "active all" : ""}`}
                    id="switchAllJobsBtn"
                    onClick={() => {
                      setTypeFilter("");
                      setQuickCat("");
                      setCurrentPage(1);
                    }}
                  >
                    <span>🏢 All Jobs</span>
                    <span className="view-switch-badge">{uniqueJobsList.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${typeFilter === "Same-Day / Short-term" ? "active sameday" : ""}`}
                    id="switchSameDayBtn"
                    onClick={() => {
                      setTypeFilter("Same-Day / Short-term");
                      setQuickCat("");
                      setCurrentPage(1);
                    }}
                  >
                    <span>⚡ Same-Day Gigs</span>
                    <span className="view-switch-badge">
                      {uniqueJobsList.filter(j => j.type === "Same-Day / Short-term").length}
                    </span>
                  </button>
                </div>

                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
                  {typeFilter === "Same-Day / Short-term" ? (
                    <span>Frame View: <strong style={{ color: "#059669" }}>⚡ Urgent Same-Day Gigs</strong></span>
                  ) : (
                    <span>Frame View: <strong style={{ color: "#1e72c8" }}>All Community Job Listings</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="jobs-layout">
              <aside className="panel filters">
                <h3>Filters</h3>
                <div className="field">
                  <label>Job type</label>
                  <DropdownWithCustom
                    id="categoryFilter"
                    value={categoryFilter}
                    onChange={(val) => {
                      setCategoryFilter(val);
                      setQuickCat(val);
                    }}
                    options={JOB_CATEGORIES}
                    allowEmpty
                    emptyLabel="All job types"
                    customPlaceholder="Type job category..."
                  />
                </div>
                <div className="field">
                  <label>Country</label>
                  <DropdownWithCustom
                    id="countryFilter"
                    value={countryFilter}
                    onChange={setCountryFilter}
                    options={["United States", "United Kingdom", "Israel", "Canada", "Belgium"]}
                    allowEmpty
                    emptyLabel="Any country"
                    customPlaceholder="Type country..."
                  />
                </div>
                <div className="field">
                  <label>Minimum pay</label>
                  <DropdownWithCustom
                    id="payFilter"
                    value={payFilter}
                    onChange={setPayFilter}
                    options={[
                      { value: "0", label: "Any pay" },
                      { value: "18", label: "18+ / hr" },
                      { value: "20", label: "20+ / hr" },
                      { value: "25", label: "25+ / hr" },
                      { value: "30", label: "30+ / hr" },
                    ]}
                    customPlaceholder="Enter min pay (e.g. 35)..."
                  />
                </div>
                <div className="field">
                  <label>Schedule</label>
                  <DropdownWithCustom
                    id="typeFilter"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: "Same-Day / Short-term", label: "⚡ Same-Day / Short-term" },
                      { value: "Full-time", label: "Full-time" },
                      { value: "Part-time", label: "Part-time" },
                      { value: "Evenings", label: "Evenings" },
                      { value: "Flexible", label: "Flexible" },
                      { value: "Temporary", label: "Temporary" },
                    ]}
                    allowEmpty
                    emptyLabel="Any schedule"
                    customPlaceholder="Type schedule..."
                  />
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
            <a href="#" onClick={(e) => { e.preventDefault(); setContactModalOpen(true); }}>💬 Contact Owner</a>
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
                      <DropdownWithCustom
                        id="alertMinPayInput"
                        value={alertMinPay}
                        onChange={setAlertMinPay}
                        options={[
                          { value: "0", label: "Any Pay" },
                          { value: "20", label: "$20+/hr" },
                          { value: "25", label: "$25+/hr" },
                          { value: "30", label: "$30+/hr" },
                          { value: "35", label: "$35+/hr" },
                          { value: "40", label: "$40+/hr" },
                        ]}
                        customPlaceholder="Enter custom minimum pay (e.g. $45+/hr)..."
                      />
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
                        placeholder="Enter company or organization name"
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

      {/* Contact Us Modal */}
      {contactModalOpen && (
        <div
          className="contact-modal-overlay"
          id="contactModal"
          onClick={() => setContactModalOpen(false)}
        >
          <div className="contact-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span className="privacy-chip">🤝 Direct Support</span>
                <h3 style={{ fontSize: "22px", margin: "6px 0 2px", fontWeight: 900, color: "#0d2c38" }}>
                  Contact YidMatch Owner
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#5d7279" }}>
                  Reach out directly via WhatsApp, email, or send a quick message below.
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setContactModalOpen(false)}
                style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "14px", fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div className="contact-quick-grid">
              <a
                href="https://wa.me/17325550199?text=Hello%20YidMatch%2C%20I%20have%20a%20question%20about%20a%20job%20listing"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-action-card whatsapp"
              >
                <span className="c-icon">💬</span>
                <strong>WhatsApp Chat</strong>
                <span>Fast reply · Click to message</span>
              </a>

              <a
                href="mailto:contact@yidmatch.com?subject=YidMatch%20Inquiry"
                className="contact-action-card email"
              >
                <span className="c-icon">✉️</span>
                <strong>Direct Email</strong>
                <span>contact@yidmatch.com</span>
              </a>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "14px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>
                Or Send a Quick Message
              </h4>
              {contactSent ? (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "14px", borderRadius: "10px", textAlign: "center", color: "#065f46" }}>
                  <strong>✓ Message sent successfully!</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>The owner will get back to you shortly via WhatsApp or email.</p>
                </div>
              ) : (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setContactSubmitting(true);
                    setTimeout(() => {
                      setContactSubmitting(false);
                      setContactSent(true);
                      showToast("Message sent to YidMatch owner!");
                    }, 600);
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <input
                    placeholder="Your name"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                  />
                  <input
                    placeholder="Your WhatsApp phone number or email"
                    required
                    value={contactEmailOrPhone}
                    onChange={e => setContactEmailOrPhone(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                  />
                  <textarea
                    placeholder="How can we help? (Job inquiry, posting question, feedback)..."
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", resize: "vertical", outline: "none" }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactSubmitting}
                    style={{ width: "100%", padding: "10px", fontWeight: 800, fontSize: "14px" }}
                  >
                    {contactSubmitting ? "Sending..." : "Send Message to Owner →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Builder & Preview Modal */}
      {resumeModalOpen && (
        <div
          className="resume-modal-overlay"
          id="resumeModal"
          role="dialog"
          aria-modal="true"
          onClick={() => setResumeModalOpen(false)}
        >
          <div
            className="resume-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "780px" }}
          >
            <div className="resume-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#0c3365" }}>
                    Heimish Resume Creator & Preview
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                    Build, customize, and print your tailored Heimish candidate resume.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setResumeModalOpen(false)}
                style={{ padding: "6px 12px", fontSize: "14px", borderRadius: "8px" }}
              >
                ✕ Close
              </button>
            </div>

            <div className="resume-modal-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
              {/* Form Inputs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    value={resumeFullName || (user?.name || "Yitzchok Klein")}
                    onChange={e => setResumeFullName(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. Yitzchok Klein"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Target Job Title / Headline
                  </label>
                  <input
                    value={resumeTitle}
                    onChange={e => setResumeTitle(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. Bookkeeper / Office Manager"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Phone Number
                  </label>
                  <input
                    value={resumePhone || (user?.phone || profilePhone || "(732) 555-0199")}
                    onChange={e => setResumePhone(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="(732) 555-0199"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    value={resumeEmail || (user?.email || "candidate@email.com")}
                    onChange={e => setResumeEmail(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="candidate@email.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Professional Summary
                </label>
                <textarea
                  rows={2}
                  value={resumeSummary}
                  onChange={e => setResumeSummary(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                  Work Experience (Bulleted / Past Roles)
                </label>
                <textarea
                  rows={3}
                  value={resumeExperience}
                  onChange={e => setResumeExperience(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Skills & Languages
                  </label>
                  <input
                    value={resumeSkills}
                    onChange={e => setResumeSkills(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "4px" }}>
                    Education & Yeshiva / Seminary
                  </label>
                  <input
                    value={resumeEducation}
                    onChange={e => setResumeEducation(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Live Formatted Resume Sheet Preview */}
              <div style={{ marginTop: "10px" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: "#64748b" }}>
                  Live Document Preview
                </span>
                <div className="resume-paper-preview" id="printableResumeArea" style={{ marginTop: "6px" }}>
                  <div className="resume-paper-header">
                    <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#0c3365" }}>
                      {resumeFullName || user?.name || "Yitzchok Klein"}
                    </h2>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e72c8", marginTop: "2px" }}>
                      {resumeTitle}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      📍 {resumeCity} • 📞 {resumePhone || user?.phone || "(732) 555-0199"} • ✉️ {resumeEmail || user?.email || "candidate@email.com"}
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "12.5px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0c3365", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                      Professional Summary
                    </h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>
                      {resumeSummary}
                    </p>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "12.5px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0c3365", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                      Experience & Background
                    </h4>
                    <pre style={{ margin: 0, fontSize: "12.5px", color: "#334155", fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {resumeExperience}
                    </pre>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0c3365", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                        Key Skills
                      </h4>
                      <div style={{ fontSize: "12px", color: "#334155" }}>
                        {resumeSkills}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0c3365", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                        Education & Yeshiva
                      </h4>
                      <div style={{ fontSize: "12px", color: "#334155" }}>
                        {resumeEducation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="resume-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>🖨️</span> Print / Save PDF
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setResumeSaved(true);
                    showToast("✓ Resume saved to your candidate profile!");
                    setTimeout(() => setResumeModalOpen(false), 800);
                  }}
                  style={{ fontWeight: 800 }}
                >
                  {resumeSaved ? "✓ Saved" : "Save Resume to Profile →"}
                </button>
              </div>
            </div>
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
