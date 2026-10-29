"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

interface SameDayGig {
  id: number;
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
}

const INITIAL_SAME_DAY_GIGS: SameDayGig[] = [
  {
    id: 101,
    icon: "⚡",
    title: "2 Waiters Needed for Bar Mitzvah Tonight",
    company: "Heimish Catering Hall",
    location: "Boro Park, Brooklyn",
    country: "United States",
    category: "Simcha & Catering",
    pay: 35,
    payText: "$35/hr · Cash at end of night",
    dateNeeded: "Tonight",
    age: "12m ago",
    desc: "Need 2 polite, reliable waiters for a Bar Mitzvah hall tonight. 5:30 PM - 11:30 PM. Immediate cash payment upon finish. White shirt & black pants required.",
    phone: "(718) 555-0144",
    whatsapp: "17185550144"
  },
  {
    id: 102,
    icon: "🚐",
    title: "Urgent Airport Ride: Lakewood to JFK",
    company: "Private Family",
    location: "Lakewood, NJ",
    country: "United States",
    category: "Driving",
    pay: 35,
    payText: "$140 flat + tolls",
    dateNeeded: "Today",
    age: "28m ago",
    desc: "Need an immediate driver with a clean minivan or SUV for 4 passengers + luggage to JFK airport today at 3:30 PM. Flight leaves at 8:00 PM.",
    phone: "(732) 555-0199",
    whatsapp: "17325550199"
  },
  {
    id: 103,
    icon: "⚡",
    title: "Simcha Hall Table & Stage Setup Helper",
    company: "Ateres Simcha Hall",
    location: "Monsey, NY",
    country: "United States",
    category: "Simcha & Catering",
    pay: 25,
    payText: "$25/hr · Today 4:00 PM",
    dateNeeded: "Today",
    age: "45m ago",
    desc: "Help dress tables, arrange chairs, and setup stage layout for an event this evening. Approx 4-5 hours of work starting 4:00 PM. Straightforward work.",
    phone: "(845) 555-0172",
    whatsapp: "18455550172"
  },
  {
    id: 104,
    icon: "📦",
    title: "Warehouse Container Unloading Rush",
    company: "Commercial Importer",
    location: "Crown Heights, Brooklyn",
    country: "United States",
    category: "Warehouse",
    pay: 28,
    payText: "$28/hr · Cash daily",
    dateNeeded: "Immediate",
    age: "1h ago",
    desc: "Looking for 3 strong helpers to unload incoming containers of housewares today starting at 1:00 PM. Friendly crew and same-day cash payment.",
    phone: "(718) 555-0188",
    whatsapp: "17185550188"
  },
  {
    id: 105,
    icon: "🥖",
    title: "Friday Challah Bakery Packaging Helper",
    company: "Williamsburg Bakery",
    location: "Williamsburg, Brooklyn",
    country: "United States",
    category: "Food Service",
    pay: 26,
    payText: "$26/hr · Cash Friday",
    dateNeeded: "Tomorrow",
    age: "2h ago",
    desc: "Help bag, label, and box fresh challahs and kokosh cakes for Friday distribution. Shifts from 6:00 AM to 12:00 PM tomorrow.",
    phone: "(718) 555-0131",
    whatsapp: "17185550131"
  },
  {
    id: 106,
    icon: "🚚",
    title: "Moving Helper — 3 Hours Local Transport",
    company: "Residential Moving",
    location: "Passaic, NJ",
    country: "United States",
    category: "Moving & Labor",
    pay: 30,
    payText: "$30/hr cash",
    dateNeeded: "Immediate",
    age: "3h ago",
    desc: "Need 1 helper to assist driver with loading and unloading 8 furniture pieces in Passaic. Expected duration: 2.5 to 3 hours. Cash upon completion.",
    phone: "(973) 555-0167",
    whatsapp: "19735550167"
  },
  {
    id: 107,
    icon: "🔊",
    title: "Simcha Sound & Mic Setup Assistant",
    company: "Audio Productions",
    location: "Five Towns, NY",
    country: "United States",
    category: "Simcha & Catering",
    pay: 30,
    payText: "$150 flat · Tonight 6:00 PM",
    dateNeeded: "Tonight",
    age: "3h ago",
    desc: "Assist sound engineer with carrying speaker stands, running cables, and testing wireless mics for an engagement party in Lawrence, NY.",
    phone: "(516) 555-0155",
    whatsapp: "15165550155"
  },
  {
    id: 108,
    icon: "📦",
    title: "Emergency Order Fulfillment & Packing",
    company: "Judaica Distribution",
    location: "Lakewood, NJ",
    country: "United States",
    category: "Warehouse",
    pay: 25,
    payText: "$25/hr · Today 2:00 PM",
    dateNeeded: "Today",
    age: "4h ago",
    desc: "Rush orders need to be packed and taped into USPS/UPS boxes today before 5:00 PM carrier pickup. Easy work in air-conditioned office warehouse.",
    phone: "(732) 555-0122",
    whatsapp: "17325550122"
  }
];

export default function SameDayGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<SameDayGig[]>(INITIAL_SAME_DAY_GIGS);
  const [savedGigs, setSavedGigs] = useState<number[]>([]);

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

  // Load saved gigs
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yidmatch_saved_sameday");
      if (saved) setSavedGigs(JSON.parse(saved));
      const localGigs = localStorage.getItem("yidmatch_custom_sameday");
      if (localGigs) {
        const parsed = JSON.parse(localGigs);
        setGigs([...parsed, ...INITIAL_SAME_DAY_GIGS]);
      }
    } catch (_) {}
  }, []);

  const handleToggleSaveGig = (id: number, title: string) => {
    setSavedGigs(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(gId => gId !== id) : [...prev, id];
      try {
        localStorage.setItem("yidmatch_saved_sameday", JSON.stringify(updated));
      } catch (_) {}
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
    const created: SameDayGig = {
      id: Date.now(),
      icon: "⚡",
      title: newTitle.trim(),
      company: newCompany.trim() || "Community Employer",
      location: newLocation.trim(),
      country: "United States",
      category: "Urgent Same-Day",
      pay: payNum,
      payText: newPay.includes("$") ? newPay.trim() : `$${newPay.trim()} · Same-day pay`,
      dateNeeded: newDateNeeded,
      age: "Just now",
      desc: newDesc.trim() || "Immediate work needed. Contact employer directly for start time and location.",
      phone: newPhone.trim(),
      whatsapp: newPhone.replace(/\D/g, "")
    };

    const updated = [created, ...gigs];
    setGigs(updated);
    try {
      localStorage.setItem("yidmatch_custom_sameday", JSON.stringify([created]));
    } catch (_) {}
    setPostModalOpen(false);
    setNewTitle("");
    setNewCompany("");
    setNewPay("");
    setNewPhone("");
    setNewDesc("");
    showToast("✓ Urgent same-day gig posted live!");
  };

  // Filtered Gigs
  const filteredGigs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const loc = locationFilter.toLowerCase().trim();
    const minPay = Number(payFilter);

    return gigs.filter(g => {
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
  }, [gigs, searchQuery, locationFilter, payFilter, dateFilter]);

  return (
    <div className="layout">
      {/* Toast Notification */}
      <div className={`toast ${toastVisible ? "show" : ""}`} role="status">
        {toastMessage}
      </div>

      {/* Floating Contact Owner button */}
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

      {/* TOPBAR */}
      <header className="topbar">
        <div className="shell nav">
          <a className="brand" href="/" aria-label="YidMatch Home">
            <Image
              src="/logo.png"
              alt="YidMatch"
              width={180}
              height={60}
              style={{ height: "auto", maxHeight: "48px", width: "auto" }}
              priority
            />
          </a>

          <div className="nav-links">
            <a className="navlink" href="/?view=jobs#jobs">
              🏢 All Community Jobs
            </a>
            <a className="navlink active" href="/same-day-gigs">
              ⚡ Same-Day Gigs
            </a>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setContactModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>💬</span> Contact Us
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPostModalOpen(true)}
              style={{ fontWeight: 800, background: "#059669" }}
            >
              + Post a Same-Day Gig ($25)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - NO HERO SECTION */}
      <main className="shell" style={{ paddingTop: "28px", paddingBottom: "70px" }}>
        {/* TWO DEDICATED PAGES SWITCHER */}
        <div style={{ margin: "0 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "16px" }}>
          <div className="view-switch-banner" id="viewSwitchBanner">
            <a
              href="/?view=jobs#jobs"
              className="view-switch-btn"
              id="switchAllJobsBtn"
              title="Navigate to All Community Jobs"
            >
              <span>🏢 All Community Jobs</span>
            </a>
            <span
              className="view-switch-btn active sameday"
              id="switchSameDayBtn"
            >
              <span>⚡ Same-Day Gigs</span>
              <span className="view-switch-badge" style={{ background: "#059669", color: "#fff" }}>
                Active Page
              </span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13.5px", color: "#475569", fontWeight: 700 }}>
              Current Page: <strong style={{ color: "#059669" }}>⚡ Dedicated Same-Day Gigs Board</strong>
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPostModalOpen(true)}
              style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 800, background: "#059669" }}
            >
              + Post a Gig ($25)
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="dashboard-search">
          <div className="search-row">
            <div className="search-box">
              🔎{" "}
              <input
                placeholder="Search gigs — e.g. waiter, airport driver, warehouse, moving, cash"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-box">
              📍{" "}
              <input
                placeholder="Any community or neighborhood..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {}}
              style={{ background: "#059669" }}
            >
              Search Gigs
            </button>
          </div>

          {/* Quick Date / Urgency Filter Pills */}
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#64748b" }}>When needed:</span>
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
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: dateFilter === pill.val ? "1.5px solid #059669" : "1px solid #cbd5e1",
                  background: dateFilter === pill.val ? "#ecfdf5" : "#fff",
                  color: dateFilter === pill.val ? "#065f46" : "#475569",
                  transition: "all 0.15s ease"
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
          <aside className="panel filters">
            <h3>Filters</h3>
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
              <label>Minimum pay</label>
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
            <button
              type="button"
              className="btn btn-light"
              style={{ width: "100%" }}
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("");
                setPayFilter("0");
                setDateFilter("All");
              }}
            >
              Clear Filters
            </button>
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
              <div className="empty-state">
                <span style={{ fontSize: "36px" }}>⚡</span>
                <h3>No same-day gigs found matching your filters</h3>
                <p>Try clearing your filters or search term to see all available gigs.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("");
                    setPayFilter("0");
                    setDateFilter("All");
                  }}
                  style={{ background: "#059669" }}
                >
                  Show All Gigs
                </button>
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
          <div className="footer-links">
            <a href="/?view=jobs#jobs">All Community Jobs</a>
            <a href="/same-day-gigs">⚡ Same-Day Gigs</a>
            <a href="#" onClick={e => { e.preventDefault(); setPostModalOpen(true); }}>Post a Gig ($25)</a>
            <a href="#" onClick={e => { e.preventDefault(); setContactModalOpen(true); }}>Contact Owner</a>
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
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="modal-head">
              <div>
                <span className="privacy-chip">⚡ Post an Urgent Gig</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 800 }}>
                  Post a Same-Day Gig ($25)
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                Post Live Same-Day Gig → $25
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
