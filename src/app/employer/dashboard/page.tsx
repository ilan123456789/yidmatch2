"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Job, JobApplication } from "@/types";
import { 
  Layers, 
  PlusCircle, 
  Users, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Building2, 
  MapPin, 
  DollarSign, 
  Mail, 
  Phone,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  // Load employer's jobs
  useEffect(() => {
    async function loadEmployerJobs() {
      setLoading(true);
      try {
        const empId = user?.uid || "emp-apex";
        const res = await fetch(`/api/jobs?employerId=${empId}`);
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
          setSelectedJob(data.jobs[0]);
        } else {
          // If no specific employer jobs found, load all active for demo
          const allRes = await fetch("/api/jobs");
          const allData = await allRes.json();
          if (allData.jobs) {
            setJobs(allData.jobs);
            setSelectedJob(allData.jobs[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployerJobs();
  }, [user]);

  // Load applications whenever selectedJob changes
  useEffect(() => {
    async function loadApps() {
      if (!selectedJob) return;
      setLoadingApps(true);
      try {
        const res = await fetch(`/api/applications?jobId=${selectedJob.id}`);
        const data = await res.json();
        if (data.applications) {
          setApplications(data.applications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingApps(false);
      }
    }

    loadApps();
  }, [selectedJob]);

  const updateStatus = async (appId: string, newStatus: JobApplication["status"]) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-brand-blue border border-blue-100 mb-2">
            EMPLOYER MANAGEMENT PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {user?.companyName || "Employer Dashboard"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your active $25 listings and review candidate resumes in real time.
          </p>
        </div>

        <Link
          href="/post-job"
          className="inline-flex items-center space-x-2 bg-brand-navy hover:bg-brand-blue text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Post Another Job ($25)</span>
        </Link>
      </div>

      {/* Main Grid: Left Jobs List, Right Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Postings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-blue" />
              <span>Your Listings ({jobs.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white h-24 rounded-xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
              <p className="text-xs text-slate-500">You haven't posted any jobs yet.</p>
              <Link href="/post-job" className="text-xs font-bold text-brand-blue hover:underline block">
                Post your first job for $25 →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-blue-50/60 border-brand-blue shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{job.title}</h3>
                        <p className="text-xs text-slate-500">{job.location} • {job.jobType}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        job.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">Paid: $25 (Stripe)</span>
                      <span className="font-semibold text-brand-blue flex items-center space-x-1">
                        <span>View Applicants</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Applicants for Selected Job */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>
                Applicants for: <span className="text-brand-blue">{selectedJob?.title || "Select a job"}</span>
              </span>
            </h2>
            {selectedJob && (
              <Link
                href={`/jobs/${selectedJob.id}`}
                target="_blank"
                className="text-xs text-slate-500 hover:text-brand-blue flex items-center space-x-1 font-medium"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {loadingApps ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 h-64 animate-pulse"></div>
          ) : applications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No applications received yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Candidates browsing YID MATCH will appear here as soon as they submit their resumes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{app.seekerName}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${app.seekerEmail}`} className="hover:text-brand-blue font-medium underline">
                            {app.seekerEmail}
                          </a>
                        </span>
                        {app.seekerPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`tel:${app.seekerPhone.replace(/\D/g, "")}`} className="hover:text-brand-blue font-medium">
                              {app.seekerPhone}
                            </a>
                          </span>
                        )}
                        <span>• Submitted {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-medium">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer ${
                          app.status === "SUBMITTED"
                            ? "bg-blue-50 text-brand-blue border-blue-200"
                            : app.status === "REVIEWED"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : app.status === "INTERVIEWING"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : app.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="INTERVIEWING">Interviewing</option>
                        <option value="ACCEPTED">Accepted / Hired</option>
                        <option value="REJECTED">Declined</option>
                      </select>
                    </div>
                  </div>

                  {/* Cover Note */}
                  {app.coverNote && (
                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 italic border border-slate-100">
                      "{app.coverNote}"
                    </div>
                  )}

                  {/* Resume Download Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                      <FileText className="w-4 h-4 text-brand-blue" />
                      <span>{app.resumeFileName || "Candidate_Resume.pdf"}</span>
                    </div>

                    <a
                      href={app.resumeUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-brand-blue text-white text-xs font-bold rounded-lg transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resume</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
