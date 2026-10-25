# 🤝 YID MATCH (ייִד מאַטש)
### The Premier Heimish Jewish Job Board & Urgent Daily Gigs Platform

YID MATCH is a high-quality job marketplace tailored specifically for the Heimish / Orthodox Jewish community. It bridges the gap between trusted employers and qualified talent, featuring paid standard job listings ($25 via Stripe), direct resume application tracking, and an urgent "Daily Jobs / Same-Day Gigs" section.

---

## ✨ Features

- **Heimish Job Search & Filters**:
  - Filter by community: Lakewood, Boro Park, Monsey, Williamsburg, Flatbush, Five Towns, Crown Heights, Passaic, Remote.
  - Cultural & religious workplace perks: *Shomer Shabbos & Yom Tov*, *Minyan On-Site*, *Kosher Kitchen*, *Early Friday Dismissal*, *Separate Seating Option*.
- **⚡ Urgent Daily Jobs & Same-Day Gigs**:
  - Dedicated fast-action feed for same-day and urgent needs (Bar Mitzvah / Wedding waitstaff, drivers, warehouse rush packing, temporary office filing).
  - 1-click **WhatsApp** and direct phone connect.
  - Quick-post modal for employers to list urgent gigs in 60 seconds.
- **💳 $25 Standard Job Posting (Stripe Integration)**:
  - Employers fill out a comprehensive job listing.
  - Transparent $25.00 flat fee powered by **Stripe Checkout**.
  - Built-in instant test/simulated mode for local development before live Stripe keys are configured.
- **📄 Resume Uploads & Candidate Tracking**:
  - Job seekers apply with 1 click, uploading PDF/DOCX resumes and cover notes.
  - Employers can view applicants, download resumes, and update statuses (*Submitted* -> *Reviewed* -> *Interviewing* -> *Hired* -> *Declined*).
- **🔥 Google Firebase Backend**:
  - Cloud Firestore schema for `jobs`, `dailyJobs`, `applications`, and `users`.
  - Firebase Authentication ready.
  - Built-in local persistence fallback (`.data/yidmatch_db.json`) ensuring 100% functionality out of the box.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Test Accounts

YID MATCH includes pre-seeded demo accounts and a **1-click quick role switcher** in the top navigation bar:

- **Employer Account**:
  - Email: `employer@yidmatch.com`
  - Name: Chaim Berkowitz (Apex Distribution LLC, Lakewood, NJ)
- **Candidate / Job Seeker Account**:
  - Email: `seeker@yidmatch.com`
  - Name: Shimon Klein (Boro Park, NY)

---

## ⚙️ Google Firebase & Stripe Setup

Copy `.env.example` to `.env.local` and add your production credentials when ready:

```env
# Google Firebase (Firestore, Auth, Storage)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Stripe ($25 Job Postings)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

*(Note: If Stripe or Firebase keys are left blank, YID MATCH will automatically run with the built-in local persistence and simulated Stripe checkout, so you can test all flows without any setup!)*

---

## ☁️ Cloudflare Deployment (Workers / Git Integration)

This project uses **OpenNext for Cloudflare** (`@opennextjs/cloudflare`) configured via `wrangler.jsonc`.

When deploying from GitHub to Cloudflare:
- **Build Command:** `npm run build:worker` (or `npx @opennextjs/cloudflare build`)
- **Deploy Command / Output:** Automatically handled via `wrangler.jsonc` (`.open-next/worker.js` and `.open-next/assets`)
- **Compatibility Flags:** `nodejs_compat` (already specified in `wrangler.jsonc`)

To preview locally using the exact Cloudflare Workers runtime:
```bash
npm run preview
```

