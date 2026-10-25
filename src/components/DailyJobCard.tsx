"use client";

import React, { useState } from "react";
import { DailyJob } from "@/types";
import { 
  Zap, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DailyJobCardProps {
  job: DailyJob;
}

export const DailyJobCard: React.FC<DailyJobCardProps> = ({ job }) => {
  const [showContactModal, setShowContactModal] = useState(false);

  const getUrgencyBadge = (urgency: string, dateNeeded: string) => {
    if (urgency === "URGENT" || dateNeeded === "Tonight" || dateNeeded === "Immediate") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
          <Zap className="w-3 h-3 fill-current" />
          <span>URGENT - {dateNeeded.toUpperCase()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
        <Clock className="w-3 h-3" />
        <span>NEEDED {dateNeeded.toUpperCase()}</span>
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl border-2 border-amber-300 hover:border-amber-500 p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
        <div>
          {/* Top urgency & category */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {getUrgencyBadge(job.urgencyLevel, job.dateNeeded)}
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {job.category}
            </span>
          </div>

          {/* Job Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 mb-2">
            {job.title}
          </h3>

          {/* Location & Pay banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 mb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-900 font-medium flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-sm font-extrabold">{job.payAmount}</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {job.payType}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
            {job.description}
          </p>
        </div>

        {/* Action Button: Connect Now */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 bg-brand-gold hover:bg-amber-600 text-slate-950 hover:text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-lg shadow-sm transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Connect & Claim Gig</span>
          </button>
        </div>
      </div>

      {/* Direct Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 mb-1">
                  DAILY GIG • {job.dateNeeded.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Compensation:</span>
                <span className="font-bold text-emerald-700">{job.payAmount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Contact Person:</span>
                <span className="font-semibold text-slate-900">{job.contactName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Phone / Text:</span>
                <span className="font-mono font-bold text-brand-blue">{job.contactPhone}</span>
              </div>
            </div>

            <div className="space-y-3">
              {job.contactWhatsapp && (
                <a
                  href={`https://wa.me/${job.contactWhatsapp.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(job.contactName)},%20I%20am%20messaging%20about%20your%20YID%20MATCH%20gig:%20${encodeURIComponent(job.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>
              )}

              <a
                href={`tel:${job.contactPhone.replace(/\D/g, "")}`}
                className="w-full flex items-center justify-center space-x-2 bg-brand-navy hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg shadow-sm transition text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Directly: {job.contactPhone}</span>
              </a>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 text-center"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
