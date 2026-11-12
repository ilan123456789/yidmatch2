"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { formatJobAge, formatDbDate } from "@/lib/date-utils";

interface SameDayGig {
  id: number | string;
  icon: string;
  title: string;
  company: string;
  location: string;
  country: string;
  category: string;
  pay: number;
  payText: string;
  dateNeeded: "Today" | "Tonight" | "Tomorrow" | "Immediate";
  age: string;
  desc: string;
  phone?: string;
  whatsapp?: string;
  postedAt?: string;
  createdAt?: string;
}

const INITIAL_SAME_DAY_GIGS: SameDayGig[] = [];

export default function SameDayGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<SameDayGig[]>(INITIAL_SAME_DAY_GIGS);
  const [savedGigs, setSavedGigs] = useState<(number | string)[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [payFilter, setPayFilter] = useState("0");
  const [dateFilter, setDateFilter] = useState("All");

  // Modals state
  const [selectedGig, setSelectedGig] = useState<SameDayGig | null>(null);
  const [applyGig, setApplyGig] = useState<SameDayGig | null>(null);
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyNote, setApplyNote] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);

  // Post modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("Lakewood, NJ");
  const [newDateNeeded, setNewDateNeeded] = useState<"Today" | "Tonight" | "Tomorrow" | "Immediate">("Today");
  const [newPay, setNewPay] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2400);
  };

  // Load saved gigs and synchronize with API & Firebase Firestore
  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      const saved = localStorage.getItem("yidmatch_saved_sameday");
      if (saved) setSavedGigs(JSON.parse(saved));
    } catch (_) { }

    // 1. Fetch from server API so any user on any browser sees the gigs
    const loadGigsFromApi = async () => {
      try {
        const res = await fetch("/api/daily-jobs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.dailyJobs) && data.dailyJobs.length > 0) {
            const mapped: SameDayGig[] = data.dailyJobs.map((dj: any, idx: number) => ({
              id: dj.id || "dj-" + Date.now() + "-" + idx,
              icon: "⚡",
              title: dj.title,
              company: dj.contactName || dj.company || "Community Employer",
              location: dj.location || dj.neighborhood || "Lakewood, NJ",
              country: "United States",
              category: dj.category || "Urgent Same-Day",
              pay: Number(dj.payAmount) || 25,
              payText: dj.payType ? `$${dj.payAmount} · ${dj.payType}` : `$${dj.payAmount || 25}/hr`,
              dateNeeded: (dj.dateNeeded as any) || "Today",
              age: formatJobAge(dj.postedAt || dj.createdAt),
              desc: dj.description || dj.desc || "",
              phone: dj.contactPhone || "",
              whatsapp: dj.contactWhatsapp || (dj.contactPhone ? dj.contactPhone.replace(/\D/g, "") : "")
            }));
            setGigs(prev => {
              const seen = new Set(prev.map(p => `${p.title.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`));
              const toAdd = mapped.filter(m => !seen.has(`${m.title.trim().toLowerCase()}|${m.company.trim().toLowerCase()}`));
              return [...prev, ...toAdd];
            });
          }
        }
      } catch (e) {
        console.warn("Failed to load gigs from /api/daily-jobs", e);
      }
    };

    loadGigsFromApi();

    // 2. Real-time Firebase Firestore synchronization (client-side only)
    const initFirestoreGigsSync = async () => {
      if (typeof window === "undefined") return;
      try {
        const { getClientFirestore } = await import("@/lib/firebase/client");
        const firestore = await getClientFirestore();
        if (!firestore) return;
        const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");
        const q = query(collection(firestore, "same_day_gigs"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(
          q,
          (snap) => {
            if (!snap.empty) {
              const firestoreGigs: SameDayGig[] = snap.docs.map((doc) => {
                const d = doc.data();
                return {
                  id: doc.id,
                  icon: d.icon || "⚡",
                  title: d.title || "Urgent Gig",
                  company: d.company || "Community Employer",
                  location: d.location || "Lakewood, NJ",
                  country: d.country || "United States",
                  category: d.category || "Urgent Same-Day",
                  pay: Number(d.pay) || 25,
                  payText: d.payText || `$${d.pay || 25}/hr`,
                  dateNeeded: d.dateNeeded || "Today",
                  age: formatJobAge(d.postedAt || d.createdAt || d.timestamp),
                  desc: d.desc || "",
                  phone: d.phone || "",
                  whatsapp: d.whatsapp || ""
                };
              });
              setGigs(prev => {
                const seen = new Set(firestoreGigs.map(p => `${p.title.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`));
                const remaining = prev.filter(p => !seen.has(`${p.title.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`));
                return [...firestoreGigs, ...remaining];
              });
            }
          },
          (err) => {
            console.warn("Firestore same_day_gigs onSnapshot error:", err.message);
          }
        );
      } catch (e) {
        console.warn("Firestore gigs init sync error:", e);
      }
    };

    initFirestoreGigsSync();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleToggleSaveGig = (id: number | string, title: string) => {
    setSavedGigs(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(gId => gId !== id) : [...prev, id];
      try {
        localStorage.setItem("yidmatch_saved_sameday", JSON.stringify(updated));
      } catch (_) { }
      showToast(exists ? `Removed "${title}" from saved gigs.` : `Saved "${title}"!`);
      return updated;
    });
  };

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newPay.trim() || !newPhone.trim()) {
      showToast("Please fill in title, location, pay, and contact phone.");
      return;
    }
    const payNum = Number(newPay.replace(/[^0-9.]/g, "")) || 25;
    const now = new Date();
    const created: SameDayGig = {
      id: "gig-" + Date.now(),
      icon: "⚡",
      title: newTitle.trim(),
      company: newCompany.trim() || "Community Employer",
      location: newLocation.trim(),
      country: "United States",
      category: "Urgent Same-Day",
      pay: payNum,
      payText: newPay.includes("$") ? newPay.trim() : `$${newPay.trim()} · Same-day pay`,
      dateNeeded: newDateNeeded,
      age: formatJobAge(now),
      desc: newDesc.trim() || "Immediate work needed. Contact employer directly for start time and location.",
      phone: newPhone.trim(),
      whatsapp: newPhone.replace(/\D/g, ""),
      postedAt: formatDbDate(now),
      createdAt: now.toISOString(),
    };

    setGigs(prev => [created, ...prev]);

    // 1. Persist to API so it is saved across all browsers and devices (and triggers SMS alerts)
    fetch("/api/daily-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: created.id,
        title: created.title,
        category: created.category,
        location: created.location,
        neighborhood: created.location,
        dateNeeded: created.dateNeeded,
        payAmount: created.pay,
        payType: "Same-Day Pay",
        urgencyLevel: "URGENT",
        contactPhone: created.phone,
        contactWhatsapp: created.whatsapp,
        contactName: created.company,
        description: created.desc,
        employerId: user?.uid || "emp-" + Date.now(),
      }),
    })
      .then(r => r.json())
      .then(res => {
        if (res?.alertsSentCount > 0) {
          setTimeout(() => {
            showToast(`⚡ Sent SMS alerts to ${res.alertsSentCount} matching candidate${res.alertsSentCount > 1 ? "s" : ""}!`);
          }, 1200);
        }
      })
      .catch(err => console.warn("API save warning:", err));

    // 2. Persist to Firebase Firestore (Client-side)
    if (typeof window !== "undefined") {
      import("@/lib/firebase/client").then(async ({ getClientFirestore }) => {
        const firestore = await getClientFirestore();
        if (firestore) {
          const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
          addDoc(collection(firestore, "same_day_gigs"), {
            ...created,
            createdAt: now.toISOString(),
            postedAt: formatDbDate(now),
            timestamp: serverTimestamp(),
            employerId: user?.uid || "emp-" + Date.now(),
            status: "ACTIVE"
          }).catch(err => console.warn("Firestore gig save warning:", err.message));
        }
      }).catch(err => console.warn("Firestore gig load error:", err));
    }

    setPostModalOpen(false);
    setNewTitle("");
    setNewCompany("");
    setNewPay("");
    setNewPhone("");
    setNewDesc("");
    showToast("✓ Urgent same-day gig posted live! ($10)");
  };

  // Unique de-duplicated Gigs list
  const uniqueGigsList = useMemo(() => {
    const seen = new Set<string>();
    return gigs.filter(g => {
      const key = `${g.title.trim().toLowerCase()}|${g.company.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [gigs]);

  // Filtered Gigs
  const filteredGigs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const loc = locationFilter.toLowerCase().trim();
    const minPay = Number(payFilter);

    return uniqueGigsList.filter(g => {
      const matchesQ =
        !q ||
        (g.title + " " + g.company + " " + g.category + " " + g.desc).toLowerCase().includes(q);
      const matchesLoc = !loc || g.location.toLowerCase().includes(loc);
      const matchesPay = g.pay >= minPay;
      const matchesDate =
        dateFilter === "All" ||
        (dateFilter === "Cash" ? g.payText.toLowerCase().includes("cash") : g.dateNeeded === dateFilter);

      return matchesQ && matchesLoc && matchesPay && matchesDate;
    });
  }, [uniqueGigsList, searchQuery, locationFilter, payFilter, dateFilter]);

  return (
    <div className="layout">
      {/* Toast Notification */}
      <div className={`toast ${toastVisible ? "show" : ""}`} role="status">
        {toastMessage}
      </div>

      {/* Floating Back to Start Button */}
      <a
        href="/"
        className="back-to-start show"
        id="backToStartSameDay"
        style={{ textDecoration: "none" }}
      >
        <span className="back-text-full">← Choose Job Seeking / Hiring</span>
        <span className="back-text-short">← Choose Role</span>
      </a>

      {/* Floating Contact Owner button */}
      <button
        type="button"
        className="contact-float-btn"
        id="floatingContactBtn"
        onClick={() => setContactModalOpen(true)}
        aria-label="Contact Us"
      >
        <span className="badge-dot" />
        <span className="contact-text-full">💬 Contact Us</span>
        <span className="contact-text-short">💬 Contact</span>
      </button>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="shell nav" style={{ justifyContent: "center" }}>
          <a className="brand" href="/" aria-label="YidMatch Home">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={180}
              height={60}
              className="topbar-brand-logo"
              priority
            />
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="shell" style={{ paddingTop: "24px", paddingBottom: "70px" }}>

        {/* HERO / INTRO BANNER */}
        <div className="same-day-hero-banner">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(110, 231, 183, 0.4)", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 800, color: "#6ee7b7", marginBottom: "10px" }}>
            ⚡ URGENT SAME-DAY COMMUNITY GIGS
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#ffffff" }}>
            Same-Day Gigs & Immediate Cash Tasks
          </h1>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5, maxWidth: "680px" }}>
            Connect directly with verified local community members needing drivers, warehouse helpers, event staff, and fast tasks with same-day compensation.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="dashboard-search same-day-search-card">
          <div className="search-row">
            <div className="search-box">
              <span style={{ fontSize: "16px" }}>🔎</span>
              <input
                placeholder="Search gigs (e.g. waiter, driver, warehouse, cash)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-box">
              <span style={{ fontSize: "16px" }}>📍</span>
              <input
                placeholder="Any community or neighborhood..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { }}
              style={{ background: "#059669", fontWeight: 800 }}
            >
              Search Gigs
            </button>
          </div>

          {/* Quick Date / Urgency Filter Pills */}
          <div className="same-day-urgency-pills">
            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#64748b", flexShrink: 0 }}>When needed:</span>
            {[
              { label: "All Gigs", val: "All" },
              { label: "⚡ Today", val: "Today" },
              { label: "🌙 Tonight", val: "Tonight" },
              { label: "☀️ Tomorrow", val: "Tomorrow" },
              { label: "🚨 Immediate", val: "Immediate" },
              { label: "💵 Cash Pay", val: "Cash" },
            ].map(pill => (
              <button
                key={pill.val}
                type="button"
                onClick={() => setDateFilter(pill.val)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: dateFilter === pill.val ? "1.5px solid #059669" : "1px solid #cbd5e1",
                  background: dateFilter === pill.val ? "#ecfdf5" : "#fff",
                  color: dateFilter === pill.val ? "#065f46" : "#475569",
                  transition: "all 0.15s ease",
                  flexShrink: 0
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* GIGS LAYOUT: FILTERS SIDEBAR + GIG CARDS */}
        <div className="jobs-layout">
          {/* Filters Sidebar */}
          <aside className="panel filters same-day-filters-panel">
            <div className="same-day-filters-head">
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button
                type="button"
                className="btn btn-light"
                style={{ fontSize: "12px", padding: "4px 10px", height: "auto" }}
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("");
                  setPayFilter("0");
                  setDateFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
            <div className="same-day-filters-grid">
              <div className="field">
                <label>Location / Area</label>
                <select
                  id="locationFilter"
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                >
                  <option value="">All locations</option>
                  <option value="Brooklyn">Brooklyn, NY</option>
                  <option value="Lakewood">Lakewood, NJ</option>
                  <option value="Monsey">Monsey, NY</option>
                  <option value="Five Towns">Five Towns, NY</option>
                  <option value="Passaic">Passaic, NJ</option>
                  <option value="Crown Heights">Crown Heights, NY</option>
                  <option value="Williamsburg">Williamsburg, NY</option>
                  <option value="Boro Park">Boro Park, NY</option>
                </select>
              </div>
              <div className="field">
                <label>Preferred pay</label>
                <select
                  id="payFilter"
                  value={payFilter}
                  onChange={e => setPayFilter(e.target.value)}
                >
                  <option value="0">Any pay</option>
                  <option value="20">$20+ / hr</option>
                  <option value="25">$25+ / hr</option>
                  <option value="30">$30+ / hr</option>
                  <option value="35">$35+ / hr</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Gigs List */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                Showing <strong>{filteredGigs.length}</strong> urgent same-day gigs
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setPostModalOpen(true)}
                style={{ fontSize: "13px", fontWeight: 700, padding: "6px 14px" }}
              >
                + Post a Gig
              </button>
            </div>

            {filteredGigs.length === 0 ? (
              <div className="same-day-empty-card">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                    border: "1.5px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    margin: "0 auto 14px",
                    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.15)",
                  }}
                >
                  ⚡
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#092040", margin: "0 0 6px" }}>
                  No Active Gigs Right Now
                </h3>
                <p style={{ color: "#64748b", maxWidth: "520px", margin: "0 auto 18px", lineHeight: 1.5, fontSize: "13.5px" }}>
                  Same-day gigs and urgent tasks fill fast in local communities! If you need help today, post a gig to notify local workers immediately, or check back throughout the day.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setPostModalOpen(true)}
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                      fontSize: "14.5px",
                      padding: "11px 22px",
                      fontWeight: 800,
                      boxShadow: "0 8px 24px rgba(5, 150, 105, 0.35)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  >
                    ⚡ Post an Urgent Gig ($10)
                  </button>
                </div>

                {/* Popular Urgent Tasks Suggestion Grid */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px", textAlign: "left" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px", textAlign: "center" }}>
                    Common Urgent Requests · Click to Post in 30 Seconds:
                  </div>
                  <div className="same-day-suggestion-grid">
                    {[
                      { icon: "📦", title: "Warehouse / Pallet Helper", pay: "$30/hr · 4 hrs" },
                      { icon: "🚗", title: "Airport or Local Driver", pay: "$75 flat cash" },
                      { icon: "🍽️", title: "Simcha / Event Waiter", pay: "$35/hr · Tonight" },
                      { icon: "🔧", title: "Urgent Handyman / Setup", pay: "$40/hr · Immediate" },
                    ].map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setNewTitle(item.title);
                          setNewPay(item.pay);
                          setPostModalOpen(true);
                        }}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "14px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#059669";
                          e.currentTarget.style.background = "#ecfdf5";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.background = "#f8fafc";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{item.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#059669", fontWeight: 700 }}>
                            {item.pay}
                          </div>
                        </div>
                        <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 700 }}>+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="jobs-list">
                {filteredGigs.map(g => (
                  <article
                    key={g.id}
                    className="panel job-card"
                    style={{ borderLeft: "4px solid #059669" }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#092040" }}>
                          <span style={{ marginRight: "6px" }}>{g.icon}</span>
                          {g.title}
                        </h3>
                        <span style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>
                          ⚡ NEEDED {g.dateNeeded.toUpperCase()}
                        </span>
                      </div>
                      <div className="meta">
                        <span>{g.company}</span>
                        <span>•</span>
                        <span>📍 {g.location}</span>
                        <span className="tag">{g.category}</span>
                      </div>
                      <p style={{ color: "#546a7b", lineHeight: 1.5, margin: "10px 0 0", fontSize: "14px" }}>
                        {g.desc}
                      </p>
                    </div>

                    <div className="side">
                      <div className="salary" style={{ color: "#065f46", fontWeight: 850 }}>{g.payText}</div>
                      <div className="age">{g.age}</div>
                      <div className="job-card-actions">
                        <button
                          type="button"
                          className="btn btn-primary job-action-btn"
                          style={{ background: "#059669" }}
                          onClick={() => {
                            setApplyGig(g);
                            setApplySubmitted(false);
                          }}
                        >
                          Quick Apply
                        </button>
                        <button
                          type="button"
                          className="btn btn-light job-action-btn"
                          onClick={() => setSelectedGig(g)}
                        >
                          View Details
                        </button>
                        {g.whatsapp && (
                          <a
                            href={`https://wa.me/${g.whatsapp}?text=Hi%2C%20I%20am%20messaging%20about%20your%20YidMatch%20gig%3A%20${encodeURIComponent(g.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-light job-action-btn"
                            style={{ borderColor: "#22c55e", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          >
                            <span>💬 WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* BOTTOM NAVIGATION: CHOOSE JOB SEEKING / HIRING & RESUME BUILDER */}
        <div style={{ marginTop: "40px", marginBottom: "10px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/"
            className="btn btn-light"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 800,
              borderRadius: "999px",
              background: "#ffffff",
              border: "1.5px solid #0c3365",
              color: "#0c3365",
              boxShadow: "0 6px 20px rgba(12, 51, 101, 0.08)",
              textDecoration: "none"
            }}
          >
            ← Choose Job Seeking / Hiring
          </a>
          <a
            href="/?action=create-resume"
            className="btn btn-light"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 800,
              borderRadius: "999px",
              background: "#ffffff",
              border: "1.5px solid #1e72c8",
              color: "#1e72c8",
              boxShadow: "0 6px 20px rgba(30, 114, 200, 0.08)",
              textDecoration: "none"
            }}
          >
            📄 Make a Resume →
          </a>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={160}
              height={50}
              style={{ height: "auto", maxHeight: "42px", width: "auto" }}
            />
            <p>Every Yid Needs a Job & Gig — Trusted Community Employment Platform.</p>
          </div>
          <div className="foot-links">
            <a href="#" onClick={e => { e.preventDefault(); setPostModalOpen(true); }}>Post a Gig ($10)</a>
            <a href="#" onClick={e => { e.preventDefault(); setContactModalOpen(true); }}>Contact Us</a>
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* GIG DETAILS MODAL */}
      {selectedGig && (
        <div className="modal open" onClick={() => setSelectedGig(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-head">
              <div>
                <span className="privacy-chip">⚡ Same-Day Gig Details</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 800 }}>
                  {selectedGig.title}
                </h3>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
                  {selectedGig.company} · 📍 {selectedGig.location}
                </p>
              </div>
              <button type="button" className="close-btn" onClick={() => setSelectedGig(null)}>✕</button>
            </div>

            <div style={{ margin: "16px 0", padding: "14px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>COMPENSATION</span>
                  <div style={{ fontSize: "18px", fontWeight: 850, color: "#065f46" }}>{selectedGig.payText}</div>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>WHEN NEEDED</span>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#92400e" }}>Needed {selectedGig.dateNeeded}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800 }}>Description & Requirements</h4>
              <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.6, color: "#334155" }}>
                {selectedGig.desc}
              </p>
            </div>

            {selectedGig.phone && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px 14px", borderRadius: "10px", marginBottom: "18px" }}>
                <strong style={{ fontSize: "13.5px", color: "#065f46" }}>Direct Employer Contact:</strong>
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginTop: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#047857" }}>📞 {selectedGig.phone}</span>
                  {selectedGig.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedGig.whatsapp}?text=Hi%2C%20I%20am%20messaging%20about%20your%20YidMatch%20gig%3A%20${encodeURIComponent(selectedGig.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "13px", fontWeight: 700, color: "#166534", textDecoration: "underline" }}
                    >
                      Chat on WhatsApp →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: "12px", fontWeight: 800, background: "#059669" }}
                onClick={() => {
                  setApplyGig(selectedGig);
                  setApplySubmitted(false);
                  setSelectedGig(null);
                }}
              >
                Quick Apply for this Gig →
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setSelectedGig(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK APPLY MODAL */}
      {applyGig && (
        <div className="modal open" onClick={() => setApplyGig(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-head">
              <div>
                <span className="privacy-chip">⚡ Instant Apply</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "19px", fontWeight: 800 }}>
                  Apply for {applyGig.title}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  {applyGig.company} · 📍 {applyGig.location} · 💰 {applyGig.payText}
                </p>
              </div>
              <button type="button" className="close-btn" onClick={() => setApplyGig(null)}>✕</button>
            </div>

            {applyGig.phone && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "10px", margin: "14px 0" }}>
                <strong style={{ fontSize: "13.5px", color: "#065f46" }}>Direct Employer Contact:</strong>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#047857" }}>📞 {applyGig.phone}</span>
                  {applyGig.whatsapp && (
                    <a
                      href={`https://wa.me/${applyGig.whatsapp}?text=Hi%2C%20I%20am%20ready%20to%20work%20for%20${encodeURIComponent(applyGig.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "13px", fontWeight: 700, color: "#166534", textDecoration: "underline" }}
                    >
                      Chat on WhatsApp →
                    </a>
                  )}
                </div>
              </div>
            )}

            {applySubmitted ? (
              <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "10px", textAlign: "center", color: "#166534" }}>
                <strong>✓ Application Sent!</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px" }}>The employer has received your details and will call or text you directly.</p>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setApplySubmitted(true);
                  showToast("Application submitted to employer!");
                }}
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <div className="field">
                  <label>Your Name <span className="required-star">*</span></label>
                  <input
                    placeholder="e.g. Avi Klein"
                    required
                    value={applyName}
                    onChange={e => setApplyName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Your Phone / WhatsApp Number <span className="required-star">*</span></label>
                  <input
                    type="tel"
                    placeholder="e.g. (732) 555-0199"
                    required
                    value={applyPhone}
                    onChange={e => setApplyPhone(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Quick Note / Availability (Optional)</label>
                  <input
                    placeholder="e.g. I have a car, ready right now!"
                    value={applyNote}
                    onChange={e => setApplyNote(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", fontWeight: 800, background: "#059669" }}
                >
                  Send Application Directly →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POST SAME-DAY GIG MODAL */}
      {postModalOpen && (
        <div className="modal open" onClick={() => setPostModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-head" style={{ position: "sticky", top: 0, background: "#ffffff", zIndex: 10, paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <span className="privacy-chip">⚡ Post an Urgent Gig</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 800 }}>
                  Post a Same-Day Gig ($10)
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Goes live instantly on the same-day gigs board and alerts local workers.
                </p>
              </div>
              <button type="button" className="close-btn" onClick={() => setPostModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateGig} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
              <div className="field">
                <label>Gig Title <span className="required-star">*</span></label>
                <input
                  placeholder="e.g. Need 2 Movers Today at 2 PM / Bar Mitzvah Waiter"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Business / Family Name</label>
                  <input
                    placeholder="e.g. Klein Family / Ateres Hall"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>When Needed <span className="required-star">*</span></label>
                  <select
                    value={newDateNeeded}
                    onChange={e => setNewDateNeeded(e.target.value as any)}
                  >
                    <option value="Today">Today</option>
                    <option value="Tonight">Tonight</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Location / City <span className="required-star">*</span></label>
                  <input
                    placeholder="e.g. Lakewood, NJ"
                    required
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Pay Amount <span className="required-star">*</span></label>
                  <input
                    placeholder="e.g. $30/hr cash or $150 flat"
                    required
                    value={newPay}
                    onChange={e => setNewPay(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Your Phone Number (For applicants to call/WhatsApp) <span className="required-star">*</span></label>
                <input
                  type="tel"
                  placeholder="e.g. (732) 555-0199"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Gig Description & Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Describe the work, timing, what to wear or bring, and payment details..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", fontWeight: 800, fontSize: "15px", background: "#059669" }}
              >
                Post Live Same-Day Gig → $10
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT US MODAL */}
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
                  Reach out directly to the YidMatch team via WhatsApp or email.
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
                href="https://wa.me/17325550199?text=Hello%20YidMatch%2C%20I%20have%20a%20question%20about%20a%20same-day%20gig"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-action-card whatsapp"
              >
                <span className="c-icon">💬</span>
                <strong>WhatsApp Chat</strong>
                <span>Fast reply · Click to message</span>
              </a>

              <a
                href="mailto:contact@yidmatch.com?subject=YidMatch%20Same-Day%20Gig%20Inquiry"
                className="contact-action-card email"
              >
                <span className="c-icon">✉️</span>
                <strong>Direct Email</strong>
                <span>contact@yidmatch.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
