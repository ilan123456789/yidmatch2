import fs from "fs";
import path from "path";
import { Job, DailyJob, JobApplication, UserProfile, JobAlert } from "@/types";
import { SEED_JOBS, SEED_DAILY_JOBS } from "./seed-data";

interface DatabaseSchema {
  users: UserProfile[];
  jobs: Job[];
  dailyJobs: DailyJob[];
  applications: JobApplication[];
  jobAlerts: JobAlert[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "yidmatch_db.json");

// In-memory store for Cloudflare Workers / Edge isolates where disk writes are disallowed
let memoryDb: DatabaseSchema | null = null;

function getSeedDatabase(): DatabaseSchema {
  return {
    users: [
      {
        uid: "emp-demo",
        email: "employer@yidmatch.com",
        name: "Chaim Berkowitz",
        role: "EMPLOYER",
        companyName: "Apex Distribution LLC",
        phone: "(732) 555-0199",
        location: "Lakewood, NJ",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "seeker-demo",
        email: "seeker@yidmatch.com",
        name: "Shimon Klein",
        role: "SEEKER",
        phone: "(718) 555-0144",
        location: "Boro Park, NY",
        createdAt: new Date().toISOString(),
      },
    ],
    jobs: [...SEED_JOBS],
    dailyJobs: [...SEED_DAILY_JOBS],
    applications: [
      {
        id: "app-1",
        jobId: "job-1",
        jobTitle: "Full-Charge Bookkeeper / Controller",
        companyName: "Apex Distribution LLC",
        seekerId: "seeker-demo",
        seekerName: "Shimon Klein",
        seekerEmail: "seeker@yidmatch.com",
        seekerPhone: "(718) 555-0144",
        resumeUrl: "/sample-resume.pdf",
        resumeFileName: "Shimon_Klein_Resume.pdf",
        coverNote: "Experienced with QuickBooks Enterprise and multi-entity wholesale distribution. Looking forward to speaking!",
        status: "REVIEWED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
    jobAlerts: [
      {
        id: "alert-1",
        phone: "(732) 555-0199",
        name: "Dovid B.",
        categories: ["HVAC", "Plumbing", "Construction & Trades"],
        locations: ["Lakewood", "Monsey"],
        neighborhood: "Lakewood, NJ",
        minPay: 25,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-2",
        phone: "(718) 555-0144",
        name: "Mendy K.",
        categories: ["Accounting & Finance", "Administration & Office"],
        locations: ["Boro Park", "Brooklyn", "Flatbush"],
        neighborhood: "Boro Park, NY",
        minPay: 22,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

// Ensure data directory and initial seed file exist
function getLocalDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (typeof fs !== "undefined" && fs.existsSync && fs.readFileSync) {
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, "utf-8");
        if (content && content.trim()) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && Array.isArray(parsed.jobs)) {
              memoryDb = parsed;
              if (!memoryDb!.jobAlerts) {
                memoryDb!.jobAlerts = getSeedDatabase().jobAlerts;
              }
              return memoryDb!;
            }
          } catch (e) {
            console.warn("yidmatch_db.json corrupted or incomplete, resetting to seed data:", e);
          }
        }
      }

      if (fs.mkdirSync && fs.writeFileSync) {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const initialData = getSeedDatabase();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
        memoryDb = initialData;
        return memoryDb;
      }
    }
  } catch {
    // Filesystem not writable or running in Cloudflare V8 isolate
  }

  memoryDb = getSeedDatabase();
  return memoryDb;
}

function saveLocalDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    if (typeof fs !== "undefined" && fs.writeFileSync) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch {
    // Gracefully persist in-memory in edge environments
  }
}

/* ==================== JOBS ==================== */

export async function getJobs(): Promise<Job[]> {
  const db = getLocalDb();
  return db.jobs.filter((j) => j.status === "ACTIVE");
}

export async function getAllEmployerJobs(employerId: string): Promise<Job[]> {
  const db = getLocalDb();
  return db.jobs.filter((j) => j.employerId === employerId);
}

export async function getJobById(id: string): Promise<Job | null> {
  const db = getLocalDb();
  return db.jobs.find((j) => j.id === id) || null;
}

export async function createJob(job: Job): Promise<Job> {
  const db = getLocalDb();
  db.jobs.unshift(job);
  saveLocalDb(db);
  return job;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  const db = getLocalDb();
  const idx = db.jobs.findIndex((j) => j.id === id);
  if (idx !== -1) {
    db.jobs[idx] = { ...db.jobs[idx], ...updates };
    saveLocalDb(db);
    return db.jobs[idx];
  }
  return null;
}

/* ==================== DAILY JOBS ==================== */

export async function getDailyJobs(): Promise<DailyJob[]> {
  const db = getLocalDb();
  return db.dailyJobs.filter((dj) => dj.status === "ACTIVE");
}

export async function createDailyJob(job: DailyJob): Promise<DailyJob> {
  const db = getLocalDb();
  db.dailyJobs.unshift(job);
  saveLocalDb(db);
  return job;
}

/* ==================== APPLICATIONS ==================== */

export async function getApplications(filter?: { jobId?: string; seekerId?: string; employerId?: string }): Promise<JobApplication[]> {
  const db = getLocalDb();
  let results = db.applications;
  if (filter?.jobId) {
    results = results.filter((a) => a.jobId === filter.jobId);
  }
  if (filter?.seekerId) {
    results = results.filter((a) => a.seekerId === filter.seekerId);
  }
  return results;
}

export async function createApplication(app: JobApplication): Promise<JobApplication> {
  const db = getLocalDb();
  db.applications.unshift(app);
  saveLocalDb(db);
  return app;
}

export async function updateApplicationStatus(id: string, status: JobApplication["status"]): Promise<JobApplication | null> {
  const db = getLocalDb();
  const idx = db.applications.findIndex((a) => a.id === id);
  if (idx !== -1) {
    db.applications[idx].status = status;
    saveLocalDb(db);
    return db.applications[idx];
  }
  return null;
}

/* ==================== USERS ==================== */

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const db = getLocalDb();
  return db.users.find((u) => u.uid === uid) || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = getLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  const db = getLocalDb();
  const idx = db.users.findIndex((u) => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    db.users.push(user);
  }
  saveLocalDb(db);
  return user;
}

/* ==================== JOB ALERTS ==================== */

export async function getJobAlerts(): Promise<JobAlert[]> {
  const db = getLocalDb();
  return (db.jobAlerts || []).filter((a) => a.active);
}

export async function createJobAlert(alertData: Omit<JobAlert, "id" | "createdAt" | "active"> & { active?: boolean }): Promise<JobAlert> {
  const id = "alert-" + Math.random().toString(36).substring(2, 10);
  const newAlert: JobAlert = {
    id,
    phone: alertData.phone,
    name: alertData.name || "",
    categories: alertData.categories || [],
    locations: alertData.locations || (alertData.neighborhood ? [alertData.neighborhood] : []),
    neighborhood: alertData.neighborhood || "",
    minPay: alertData.minPay,
    active: alertData.active !== undefined ? alertData.active : true,
    createdAt: new Date().toISOString(),
  };

  const db = getLocalDb();
  if (!db.jobAlerts) db.jobAlerts = [];
  
  // If phone already subscribed, update preferences or add new
  const cleanNewPhone = newAlert.phone.replace(/\D/g, "");
  const existingIdx = db.jobAlerts.findIndex(
    (a) => a.phone.replace(/\D/g, "") === cleanNewPhone
  );

  if (existingIdx !== -1) {
    db.jobAlerts[existingIdx] = {
      ...db.jobAlerts[existingIdx],
      ...newAlert,
      id: db.jobAlerts[existingIdx].id,
    };
    saveLocalDb(db);
    return db.jobAlerts[existingIdx];
  } else {
    db.jobAlerts.unshift(newAlert);
    saveLocalDb(db);
    return newAlert;
  }
}

export async function findMatchingAlerts(job: {
  title: string;
  category?: string;
  location?: string;
  neighborhood?: string;
  pay?: number;
  salaryMin?: number;
}): Promise<JobAlert[]> {
  const alerts = await getJobAlerts();
  const jobCategory = (job.category || "").toLowerCase();
  const jobTitle = (job.title || "").toLowerCase();
  const jobLoc = `${job.location || ""} ${job.neighborhood || ""}`.toLowerCase();
  const jobPay = job.pay || job.salaryMin || 0;

  return alerts.filter((alert) => {
    if (!alert.active) return false;

    // 1. Min pay check
    if (alert.minPay && alert.minPay > 0 && jobPay > 0 && jobPay < alert.minPay) {
      return false;
    }

    // 2. Category / Title keyword check
    if (alert.categories && alert.categories.length > 0) {
      const hasCatMatch = alert.categories.some((c) => {
        const cat = c.toLowerCase().trim();
        if (!cat || cat === "all" || cat === "all categories" || cat === "any") return true;
        return (
          jobCategory.includes(cat) ||
          jobTitle.includes(cat) ||
          cat.split(" ").some((word) => word.length > 3 && (jobTitle.includes(word) || jobCategory.includes(word)))
        );
      });
      if (!hasCatMatch) {
        return false;
      }
    }

    // 3. Location check
    if (alert.locations && alert.locations.length > 0) {
      const hasLocMatch = alert.locations.some((l) => {
        const loc = l.toLowerCase().trim();
        if (!loc || loc === "all" || loc === "any" || loc === "any location" || loc === "any country") return true;
        return jobLoc.includes(loc) || loc.includes(jobLoc);
      });
      if (!hasLocMatch) {
        return false;
      }
    }

    return true;
  });
}

