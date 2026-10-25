import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Heart, MapPin, Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-brand-navyLight mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative h-12 w-48">
              <Image 
                src="/logo.png" 
                alt="YID MATCH Logo" 
                fill 
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              YID MATCH is the dedicated employment and daily gig platform tailored for the Heimish Jewish community. Connecting trusted employers with dedicated talent.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Shomer Shabbos & Yom Tov Observant</span>
            </div>
          </div>

          {/* Heimish Communities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <span>Job Locations</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/?neighborhood=Lakewood,%20NJ" className="hover:text-white transition">Lakewood, NJ Jobs</Link></li>
              <li><Link href="/?neighborhood=Boro%20Park,%20NY" className="hover:text-white transition">Boro Park, Brooklyn</Link></li>
              <li><Link href="/?neighborhood=Monsey,%20NY" className="hover:text-white transition">Monsey & Rockland</Link></li>
              <li><Link href="/?neighborhood=Williamsburg,%20NY" className="hover:text-white transition">Williamsburg, NY</Link></li>
              <li><Link href="/?neighborhood=Five%20Towns,%20NY" className="hover:text-white transition">Five Towns & Queens</Link></li>
              <li><Link href="/?neighborhood=Crown%20Heights,%20NY" className="hover:text-white transition">Crown Heights, NY</Link></li>
              <li><Link href="/?neighborhood=Passaic,%20NJ" className="hover:text-white transition">Passaic & Clifton</Link></li>
            </ul>
          </div>

          {/* Daily Jobs & Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-brand-gold" />
              <span>Daily Urgent Gigs</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Bar Mitzvah & Wedding Waiters</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Drivers & Airport Runs</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Warehouse Rush Help</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Same-Day Moving & Setup</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Temp Office Data Entry</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-amber-300 transition">Post a Same-Day Gig</Link></li>
            </ul>
          </div>

          {/* Employers & Pricing */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              For Employers
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/post-job" className="text-brand-blue font-semibold hover:underline flex items-center space-x-1">
                  <span>Post a Standard Job - $25</span>
                </Link>
              </li>
              <li><Link href="/employer/dashboard" className="hover:text-white transition">Employer Dashboard</Link></li>
              <li><Link href="/daily-jobs" className="hover:text-white transition">Find Immediate Help</Link></li>
              <li><span className="text-slate-500">Stripe Secure Payments (Encrypted)</span></li>
              <li><span className="text-slate-500">Google Firebase Powered</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} YID MATCH. All rights reserved. Connecting with honesty and kavod.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built for Klal Yisroel</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
