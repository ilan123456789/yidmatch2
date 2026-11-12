import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Scale, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, DollarSign, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | YID MATCH",
  description: "Terms and Conditions of use for YID MATCH - Guidelines for employers, job seekers, listing policies, and payment terms.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "November 11, 2026";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Header bar */}
      <header className="bg-brand-navy border-b border-brand-navyLight sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative h-10 w-40 sm:h-12 sm:w-48">
              <Image
                src="/logo.png"
                alt="YID MATCH"
                fill
                className="object-contain object-left group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-200 bg-brand-navyLight hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-brand-blue" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1">
        {/* Title banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>User Agreement &amp; Platform Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: <strong>{lastUpdated}</strong>
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            Welcome to <strong>YID MATCH</strong> (&ldquo;YidMatch&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing, browsing, submitting job listings, or applying for jobs on our website and associated applications, you agree to comply with and be bound by the following Terms and Conditions (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use our services.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-10 text-sm sm:text-base leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">1</span>
              <span>Overview &amp; Purpose of Platform</span>
            </h2>
            <p>
              YID MATCH operates an online community job board and same-day gig connection platform connecting employers with job seekers in the Orthodox Jewish / Heimish community. YidMatch acts solely as a communication conduit and venue for job postings and direct applications. We do not participate directly in the employment relationship, hiring decisions, wage agreements, or interview processes.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">2</span>
              <span>Employer Listing Guidelines &amp; Responsibilities</span>
            </h2>
            <p>Employers listing positions or urgent gigs on YID MATCH agree to the following:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Accurate Information:</strong> All job titles, descriptions, pay ranges, locations, and hiring requirements must be genuine, truthful, and representative of real, currently available employment opportunities.
              </li>
              <li>
                <strong>Fair &amp; Respectful Practices:</strong> Listings must comply with all applicable employment laws and standards of community integrity (Kavod Habriyos).
              </li>
              <li>
                <strong>Prohibited Postings:</strong> You may not post multi-level marketing (MLM) schemes, pyramid models, fraudulent check cashing, illegal activities, or listings requiring candidates to make upfront monetary payments to apply.
              </li>
              <li>
                <strong>Right of Moderation:</strong> YID MATCH reserves the right, in its sole discretion, to reject, remove, or modify any job listing that violates our community standards, appears deceptive, or generates candidate complaints.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">3</span>
              <span>Posting Fees &amp; Payment Terms</span>
            </h2>
            <p>
              When an employer purchases a job listing or same-day gig:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Pricing:</strong> Listing prices (e.g., standard posting fee or urgent gig listing) are displayed prior to purchase and processed securely via our payment partner, Stripe.
              </li>
              <li>
                <strong>Listing Duration:</strong> Standard job listings remain actively published on the site for a period of thirty (30) consecutive days unless earlier removed or marked as filled by the poster.
              </li>
              <li>
                <strong>Refund Policy:</strong> Because job listings are published and matching SMS notifications are distributed immediately upon payment confirmation, posting fees are generally non-refundable once the post is live. If you experience technical issues, contact our support team.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">4</span>
              <span>Job Seeker Terms &amp; Applications</span>
            </h2>
            <p>
              Job seekers using YID MATCH agree to provide accurate and truthful details regarding their work authorization, professional experience, and qualifications. You acknowledge that submitting an application or resume does not guarantee an interview or offer of employment.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">5</span>
              <span>SMS Alert Notifications Program</span>
            </h2>
            <p>
              Users who choose to subscribe to SMS Job Alerts consent to receive automated text messages when positions matching their preferences are listed.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Opt-Out:</strong> You may cancel text alerts anytime by replying <strong>STOP</strong> to any SMS received from YidMatch.
              </li>
              <li>
                <strong>Carrier Rates:</strong> Message and data rates may apply depending on your cellular provider. Carriers are not liable for delayed or undelivered messages.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">6</span>
              <span>Limitation of Liability &amp; Disclaimers</span>
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                <strong>&ldquo;As-Is&rdquo; Service:</strong> YID MATCH is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied.
              </p>
              <p>
                <strong>No Employment Guarantee:</strong> We do not conduct criminal background checks or guarantee the credentials, honesty, identity, or conduct of employers or job seekers. Users are encouraged to exercise customary business diligence, verify references, and review terms directly.
              </p>
              <p>
                <strong>Liability Limit:</strong> Under no circumstances shall YID MATCH or its operators be liable for indirect, incidental, punitive, or consequential damages resulting from job postings, hiring decisions, workplace disputes, or platform downtime.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">7</span>
              <span>Changes to These Terms</span>
            </h2>
            <p>
              We reserve the right to revise these Terms at any time. When updates occur, the &ldquo;Last Updated&rdquo; date at the top of this page will be revised. Continued use of YID MATCH after changes are posted constitutes acceptance of the amended Terms.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-sm flex items-center justify-center font-extrabold">8</span>
              <span>Contact &amp; Inquiries</span>
            </h2>
            <p>
              If you have any questions or require assistance regarding our Terms and Conditions, please contact:
            </p>
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-slate-800 space-y-1 text-sm font-medium">
              <p><strong>YID MATCH Legal &amp; Support</strong></p>
              <p>Email: <a href="mailto:support@yidmatch.com" className="text-brand-blue underline font-bold">support@yidmatch.com</a></p>
              <p>Website: <Link href="/" className="text-brand-blue underline">yidmatch.com</Link></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy text-slate-400 border-t border-slate-800 py-6 text-xs text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} YID MATCH. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="text-white font-semibold">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
