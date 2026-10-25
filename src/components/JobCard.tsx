import React from "react";
import Link from "next/link";
import { Job } from "@/types";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Calendar,
  Flame
} from "lucide-react";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // Calculate relative time
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 job-card-hover relative overflow-hidden group shadow-sm hover:border-brand-blue/50">
      {/* Featured ribbon if applicable */}
      {job.featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-blue to-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg flex items-center space-x-1 shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>Featured Match</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          {/* Title & Company */}
          <div>
            <Link 
              href={`/jobs/${job.id}`} 
              className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-brand-blue transition line-clamp-1"
            >
              {job.title}
            </Link>
            <div className="flex items-center space-x-2 text-slate-600 text-sm mt-1">
              <span className="font-semibold text-slate-800 flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>{job.location}</span>
              </span>
            </div>
          </div>

          {/* Quick Badges: Salary & Job Type */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {job.salaryDisplay && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
                <span>{job.salaryDisplay}</span>
              </span>
            )}

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Briefcase className="w-3 h-3 text-slate-500" />
              <span>{job.jobType}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-brand-blue border border-blue-100">
              <CheckCircle2 className="w-3 h-3 text-brand-blue" />
              <span>Easy Apply</span>
            </span>
          </div>

          {/* Description Snippet */}
          <p className="text-slate-600 text-sm line-clamp-2 pt-1 leading-relaxed">
            {job.description}
          </p>

          {/* Heimish Perks Pills */}
          {job.heimishPerks && job.heimishPerks.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {job.heimishPerks.slice(0, 3).map((perk, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{perk}</span>
                </span>
              ))}
              {job.heimishPerks.length > 3 && (
                <span className="text-[11px] text-slate-400 font-medium self-center">
                  +{job.heimishPerks.length - 3} more perks
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button & Time */}
        <div className="sm:self-center flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          <Link
            href={`/jobs/${job.id}`}
            className="w-full sm:w-auto text-center px-4 py-2 bg-brand-navy hover:bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            View Job
          </Link>
          <div className="flex items-center space-x-1 text-slate-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{getTimeAgo(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
