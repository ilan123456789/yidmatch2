"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobApplication } from "@/types";
import { 
  FileText, 
  Building2, 
  Clock, 
  ExternalLink, 
  ArrowRight, 
  Briefcase,
  CheckCircle2,
  Calendar
} from "lucide-react";

export default function SeekerApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeekerApplications() {
      setLoading(true);
      try {
        const seekerId = user?.uid || "seeker-demo";
        const res = await fetch(`/api/applications?seekerId=${seekerId}`);
        const data = await res.json();
        if (data.applications) {
          setApplications(data.applications);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadSeekerApplications();
  }, [user]);

  const getStatusBadge = (status: JobApplication["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Hired / Accepted</span>;
      case "INTERVIEWING":
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">Interviewing</span>;
      case "REVIEWED":
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Reviewed by Employer</span>;
      case "REJECTED":
        return <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Not Selected</span>;
      default:
        return <span className="bg-blue-100 text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full">Application Submitted</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-brand-blue border border-blue-100 mb-2">
            CANDIDATE TRACKER
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Job Applications
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track the status of your submitted resumes and hiring feedback.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 bg-brand-navy hover:bg-brand-blue text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse More Jobs</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white h-28 rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">You haven't applied to any jobs yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Browse our listings for Lakewood, Boro Park, Monsey, and remote opportunities and apply with your resume.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-blue text-white font-bold rounded-xl text-xs sm:text-sm shadow"
          >
            <span>Explore Open Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-blue/40 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{app.jobTitle}</h3>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.companyName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div>
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {app.coverNote && (
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-700">Cover note sent: </span>
                  "{app.coverNote}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Attached: {app.resumeFileName}</span>
                <Link
                  href={`/jobs/${app.jobId}`}
                  className="text-brand-blue font-bold hover:underline flex items-center space-x-1"
                >
                  <span>View Original Job</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
