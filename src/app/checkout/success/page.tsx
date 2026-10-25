"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Layers, Eye, Loader2 } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const jobId = searchParams.get("job_id");
  const simulated = searchParams.get("simulated") === "true";

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      if (!jobId) {
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, jobId, simulated }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
          if (data.job?.title) {
            setJobTitle(data.job.title);
          }
        }
      } catch (err) {
        console.error("Verification failed", err);
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId, jobId, simulated]);

  if (verifying) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Verifying Payment with Stripe...</h2>
        <p className="text-xs text-slate-500">Activating your job listing on YID MATCH</p>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-rose-600">Payment Verification Issue</h2>
        <p className="text-xs text-slate-600">
          We could not verify this session. If you were charged, please contact support with session ID: {sessionId}
        </p>
        <Link href="/" className="inline-block px-4 py-2 bg-brand-navy text-white rounded-lg text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-16 px-4">
      <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Confirmed • $25.00 USD
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Mazel Tov! Your Job is Live!
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your listing for <strong>{jobTitle || "your position"}</strong> is now actively published and visible to Heimish job seekers.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Method:</span>
            <span className="font-semibold text-slate-800">Stripe Checkout</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Listing Duration:</span>
            <span className="font-semibold text-slate-800">30 Days Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Job Reference:</span>
            <span className="font-mono text-slate-800">{jobId}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {jobId && (
            <Link
              href={`/jobs/${jobId}`}
              className="flex-1 py-3 px-4 bg-brand-navy hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Live Listing</span>
            </Link>
          )}

          <Link
            href="/employer/dashboard"
            className="flex-1 py-3 px-4 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2"
          >
            <Layers className="w-4 h-4" />
            <span>Employer Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading checkout details...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
