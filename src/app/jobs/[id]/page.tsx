"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Job } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Upload,
  Send,
  FileCheck,
  Share2,
  AlertCircle
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applicantName, setApplicantName] = useState(user?.name || "");
  const [applicantEmail, setApplicantEmail] = useState(user?.email || "");
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(user.name);
      if (!applicantEmail) setApplicantEmail(user.email);
      if (!applicantPhone && user.phone) setApplicantPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        const data = await res.json();
        if (data.job) {
          setJob(data.job);
          setApplicationCount(data.applicationCount || 0);
        }
      } catch (err) {
        console.error("Error loading job", err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", job!.id);
      formData.append("seekerId", user?.uid || "seeker-anon");
      formData.append("seekerName", applicantName);
      formData.append("seekerEmail", applicantEmail);
      formData.append("seekerPhone", applicantPhone);
      formData.append("coverNote", coverNote);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setShowApplyModal(false);
          setApplySuccess(false);
          setResumeFile(null);
          setCoverNote("");
        }, 2000);
      } else {
        alert(resData.error || "Failed to submit application");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 h-96 animate-pulse"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-slate-500">This listing may have expired or been filled.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-brand-navy text-white rounded-lg">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user?.role === "EMPLOYER" && user?.uid === job.employerId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link href="/" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-100 mb-2">
                {job.neighborhood}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-slate-600 text-sm mt-2">
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-brand-blue" />
                  <span>{job.company}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{job.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {job.salaryDisplay && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600 -mr-1" />
                  <span>{job.salaryDisplay}</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>{job.jobType}</span>
              </div>
            </div>
          </div>

          {/* Heimish Workplace Perks */}
          {job.heimishPerks && job.heimishPerks.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Heimish Environment Perks</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {job.heimishPerks.map((perk, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-200 text-xs font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Candidate Requirements</h2>
              <ul className="space-y-2.5 text-slate-700 text-sm sm:text-base">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar Apply Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-brand-navy p-6 shadow-lg sticky top-28 space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Status
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                Now accepting resumes for immediate review
              </p>
            </div>

            {isOwner ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-brand-blue">
                  You are the Employer for this job listing.
                </p>
                <p className="text-xs text-slate-600">
                  Total applications received: <strong>{applicationCount}</strong>
                </p>
                <Link
                  href="/employer/dashboard"
                  className="block text-center py-2.5 bg-brand-navy hover:bg-brand-blue text-white rounded-xl text-xs font-bold transition"
                >
                  Manage Applicants in Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-brand-navy hover:bg-brand-blue text-white font-extrabold text-base py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now with Resume</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Resumes are delivered directly to the hiring employer.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold text-slate-900">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Employment Type:</span>
                <span className="font-semibold text-slate-900">{job.jobType}</span>
              </div>
              <div className="flex justify-between">
                <span>Compensation:</span>
                <span className="font-semibold text-emerald-700">{job.salaryDisplay || "Competitive"}</span>
              </div>
              <div className="flex justify-between">
                <span>Shomer Shabbos:</span>
                <span className="font-semibold text-slate-900">Yes • 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Easy Apply Modal with Resume Upload */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-brand-blue mb-1">
                  EASY APPLY
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Apply to {job.company}</h3>
                <p className="text-xs text-slate-500">{job.title}</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {applySuccess ? (
              <div className="text-center py-8 space-y-3">
                <FileCheck className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your resume has been forwarded directly to {job.company}. You can track this application in your portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue font-medium"
                    placeholder="e.g. Shimon Klein"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue font-medium"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue font-medium"
                      placeholder="(718) 555-0144"
                    />
                  </div>
                </div>

                {/* Resume Upload File Box */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Resume / CV (PDF or DOCX) *</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/50 relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-8 h-8 text-brand-blue mx-auto mb-1" />
                    {resumeFile ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{resumeFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB • Click to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Click to upload your resume file</p>
                        <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Note */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cover Note / Brief Introduction</label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly describe your background, availability, and why you are a good match for this role..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-brand-blue font-medium"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-brand-navy hover:bg-brand-blue text-white font-extrabold rounded-lg shadow transition disabled:opacity-50"
                  >
                    {submitting ? "Sending Resume..." : "Submit Application"}
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
