"use client";

import React, { useState, useEffect } from "react";
import { DailyJob, DailyJobCategory } from "@/types";
import { DailyJobCard } from "@/components/DailyJobCard";
import { NEIGHBORHOOD_OPTIONS } from "@/lib/seed-data";
import { useAuth } from "@/lib/auth-context";
import { 
  Zap, 
  PlusCircle, 
  Filter, 
  MapPin, 
  Clock, 
  Phone, 
  DollarSign, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const CATEGORIES: DailyJobCategory[] = [
  "Simcha & Catering",
  "Driver & Delivery",
  "Warehouse & Packing",
  "Moving & Handyman",
  "Office Rush / Temp",
  "Babysitting & Childcare",
  "Other"
];

export default function DailyJobsPage() {
  const { user } = useAuth();
  const [dailyJobs, setDailyJobs] = useState<DailyJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All Locations");
  const [selectedDay, setSelectedDay] = useState("All Days");

  // Post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Simcha & Catering" as DailyJobCategory,
    location: "",
    neighborhood: "Lakewood, NJ",
    dateNeeded: "Today" as "Today" | "Tonight" | "Tomorrow" | "Immediate",
    payAmount: "",
    payType: "Flat Rate" as "Flat Rate" | "Hourly",
    urgencyLevel: "URGENT" as "URGENT" | "HIGH" | "NORMAL",
    contactPhone: "",
    contactWhatsapp: "",
    contactName: "",
    description: "",
  });

  const loadDailyJobs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory !== "All Categories") q.set("category", selectedCategory);
      if (selectedNeighborhood !== "All Locations") q.set("neighborhood", selectedNeighborhood);
      if (selectedDay !== "All Days") q.set("dateNeeded", selectedDay);

      const res = await fetch(`/api/daily-jobs?${q.toString()}`);
      const data = await res.json();
      if (data.dailyJobs) setDailyJobs(data.dailyJobs);
    } catch (e) {
      console.error("Failed to load daily jobs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyJobs();
  }, [selectedCategory, selectedNeighborhood, selectedDay]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/daily-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employerId: user?.uid || "emp-guest",
        }),
      });
      const data = await res.json();
      if (res.ok && data.dailyJob) {
        setFormSuccess(true);
        setTimeout(() => {
          setShowPostModal(false);
          setFormSuccess(false);
          setFormData({
            title: "",
            category: "Simcha & Catering",
            location: "",
            neighborhood: "Lakewood, NJ",
            dateNeeded: "Today",
            payAmount: "",
            payType: "Flat Rate",
            urgencyLevel: "URGENT",
            contactPhone: "",
            contactWhatsapp: "",
            contactName: "",
            description: "",
          });
          loadDailyJobs();
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating daily job", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Intro */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-6 sm:p-10 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-slate-950 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Fast Turnaround • Immediate Pay</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Daily Jobs & Urgent Same-Day Gigs
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Need urgent help today for an event, transport, moving, or office rush? Or looking to pick up a fast-paying gig right now? Connect directly in minutes.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xl transition flex items-center space-x-2 shrink-0 border border-amber-300/40"
        >
          <PlusCircle className="w-5 h-5 text-amber-400" />
          <span>Post a Same-Day Gig</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Day selection */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {["All Days", "Today", "Tonight", "Tomorrow", "Immediate"].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedDay === day
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Neighborhood Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Location:</span>
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            {NEIGHBORHOOD_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Daily Jobs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse"></div>
          ))}
        </div>
      ) : dailyJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <Zap className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No daily jobs found for this filter</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Be the first to post a quick gig, or reset your filters to see listings across all Jewish communities.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedNeighborhood("All Locations");
              setSelectedDay("All Days");
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dailyJobs.map((job) => (
            <DailyJobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Post a Daily Gig Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 mb-1">
                  QUICK POST
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Post an Urgent Same-Day Gig</h3>
                <p className="text-xs text-slate-500">Fast listing for immediate community response</p>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">Daily Gig Published!</h4>
                <p className="text-xs text-slate-500">Your urgent listing is now live for job seekers.</p>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gig Title / Short Need *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Waiters for Bar Mitzvah Tonight"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as DailyJobCategory })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">When Needed? *</label>
                    <select
                      value={formData.dateNeeded}
                      onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none bg-white font-semibold text-amber-800"
                    >
                      <option value="Today">Today</option>
                      <option value="Tonight">Tonight</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Immediate">Immediate / Right Now</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pay Amount *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $180 flat cash or $25/hr"
                      value={formData.payAmount}
                      onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Neighborhood *</label>
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none bg-white"
                    >
                      {NEIGHBORHOOD_OPTIONS.filter((n) => n !== "All Locations").map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exact Address / Location Detail *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ateres Charna Hall, Monsey, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yossi (Manager)"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. (845) 555-0192"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value, contactWhatsapp: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description / Instructions *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Hours, attire (e.g. white shirt/black pants), tasks, when cash is paid..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-brand-gold hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow transition disabled:opacity-50"
                  >
                    {submitting ? "Publishing..." : "Publish Gig Now"}
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
