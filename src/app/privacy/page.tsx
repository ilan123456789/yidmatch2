import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Lock, FileText, Bell, Eye, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | YID MATCH",
  description: "Privacy Policy for YID MATCH - Learn how we collect, use, and protect your personal and job seeker information.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Your Privacy Matters</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: <strong>{lastUpdated}</strong>
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            Welcome to <strong>YID MATCH</strong> (&ldquo;YidMatch&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to maintaining the trust and confidentiality of our community members, job seekers, and employers. This Privacy Policy describes how we collect, handle, store, and protect your information when you visit our website, apply for positions, post listings, or subscribe to instant job notifications.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-10 text-sm sm:text-base leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect information that you voluntarily provide when using our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Job Seekers & Candidates:</strong> Name, phone number, email address, general geographic location (e.g., Lakewood, Boro Park, Monsey), job categories of interest, preferred work schedule, minimum desired compensation, and resumes/cover letters submitted through application forms.
              </li>
              <li>
                <strong>Employers & Posters:</strong> Contact name, business/company name, contact email address, phone number for verification, job requirements, workplace accommodations (e.g., Shomer Shabbos, kosher kitchen), and payment confirmation details.
              </li>
              <li>
                <strong>SMS Job Alert Subscribers:</strong> Mobile phone number, selected employment categories, and location preferences used exclusively to dispatch matching job alert texts.
              </li>
              <li>
                <strong>Technical Information:</strong> Standard anonymized browser logs, device type, and session cookies strictly required for core website functionality, security, and authentication state.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">2</span>
              <span>How We Use Your Information</span>
            </h2>
            <p>We use the data collected strictly for legitimate platform purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">Delivering job applications and resumes directly to the hiring employer.</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">Sending instant SMS match alerts to subscribers when relevant openings are published.</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">Verifying the authenticity and legitimacy of employer listings and contact details.</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">Preventing spam, abuse, fraudulent activity, and unauthorized duplicate postings.</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">3</span>
              <span>SMS Messaging Policy (Twilio / A2P 10DLC)</span>
            </h2>
            <p>
              When you opt in to receive job alerts via text message:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>No Third-Party Sharing:</strong> We do <em>not</em> sell, rent, or share your phone number or SMS consent with third parties or affiliates for marketing or promotional purposes under any circumstances.
              </li>
              <li>
                <strong>Purpose of Messages:</strong> Text messages are transactional alerts sent solely to notify you of new job postings or same-day gigs matching your saved criteria.
              </li>
              <li>
                <strong>Message Frequency:</strong> Message frequency varies based on how many matching job listings are posted in your chosen categories.
              </li>
              <li>
                <strong>Opt-Out &amp; Help:</strong> You can cancel SMS alerts at any time by replying <strong>STOP</strong> to any message received. For support, reply <strong>HELP</strong> or contact us through the website. Standard message and data rates may apply.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">4</span>
              <span>Information Sharing &amp; Third-Party Services</span>
            </h2>
            <p>
              We only share your information with trusted infrastructure providers necessary to operate the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Hiring Employers:</strong> When you submit an application for a specific listing, your name, contact information, resume, and cover note are provided to that employer so they can review your candidacy.
              </li>
              <li>
                <strong>Payment Processors (Stripe):</strong> Job posting fee transactions are securely processed by Stripe. We do not store or process your complete credit card numbers on our servers.
              </li>
              <li>
                <strong>Cloud &amp; Telecommunication Providers:</strong> We utilize Google Firebase / Cloud Firestore for secure data storage and Twilio for dispatching authorized SMS notifications.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We will disclose information only if required to do so by applicable law, court order, or governmental regulation.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">5</span>
              <span>Data Retention &amp; Security</span>
            </h2>
            <p>
              We implement industry-standard encryption, SSL/TLS transmission protocols, and strict access controls to safeguard your data. Resumes, job listings, and subscriber preferences are retained only as long as necessary to fulfill the services requested or until you request their removal.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">6</span>
              <span>Your Rights &amp; Choices</span>
            </h2>
            <p>
              You have the right to inspect, update, or request the deletion of your personal information, saved profile preferences, or alert subscriptions at any time. Simply contact our support team or use the account settings menu on the site.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-brand-blue text-sm flex items-center justify-center font-extrabold">7</span>
              <span>Contact Us</span>
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us:
            </p>
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-slate-800 space-y-1 text-sm font-medium">
              <p><strong>YID MATCH Privacy &amp; Support</strong></p>
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
            <Link href="/terms" className="hover:text-white transition">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="text-white font-semibold">Privacy Policy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

