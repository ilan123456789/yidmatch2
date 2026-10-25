import fs from "fs";
import path from "path";
import { Job, DailyJob, JobApplication, UserProfile } from "@/types";
import { SEED_JOBS, SEED_DAILY_JOBS } from "./seed-data";
import { getFirebaseAdmin } from "./firebase/admin";

interface DatabaseSchema {
  users: UserProfile[];
  jobs: Job[];
  dailyJobs: DailyJob[];
  applications: JobApplication[];
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
        memoryDb = JSON.parse(content);
        return memoryDb!;
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
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const snap = await admin.adminDb.collection("jobs").orderBy("createdAt", "desc").get();
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Job));
      }
    } catch (e) {
      console.warn("Firestore getJobs error, falling back to local store:", e);
    }
  }

  const db = getLocalDb();
  return db.jobs.filter((j) => j.status === "ACTIVE");
}

export async function getAllEmployerJobs(employerId: string): Promise<Job[]> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const snap = await admin.adminDb.collection("jobs").where("employerId", "==", employerId).get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Job));
    } catch (e) {
      console.warn("Firestore getAllEmployerJobs fallback:", e);
    }
  }

  const db = getLocalDb();
  return db.jobs.filter((j) => j.employerId === employerId);
}

export async function getJobById(id: string): Promise<Job | null> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const doc = await admin.adminDb.collection("jobs").doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Job;
      }
    } catch (e) {
      console.warn("Firestore getJobById fallback:", e);
    }
  }

  const db = getLocalDb();
  return db.jobs.find((j) => j.id === id) || null;
}

export async function createJob(job: Job): Promise<Job> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("jobs").doc(job.id).set(job);
    } catch (e) {
      console.warn("Firestore createJob fallback:", e);
    }
  }

  const db = getLocalDb();
  db.jobs.unshift(job);
  saveLocalDb(db);
  return job;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("jobs").doc(id).update(updates);
    } catch (e) {
      console.warn("Firestore updateJob fallback:", e);
    }
  }

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
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const snap = await admin.adminDb.collection("dailyJobs").where("status", "==", "ACTIVE").get();
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as DailyJob));
      }
    } catch (e) {
      console.warn("Firestore getDailyJobs fallback:", e);
    }
  }

  const db = getLocalDb();
  return db.dailyJobs.filter((dj) => dj.status === "ACTIVE");
}

export async function createDailyJob(job: DailyJob): Promise<DailyJob> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("dailyJobs").doc(job.id).set(job);
    } catch (e) {
      console.warn("Firestore createDailyJob fallback:", e);
    }
  }

  const db = getLocalDb();
  db.dailyJobs.unshift(job);
  saveLocalDb(db);
  return job;
}

/* ==================== APPLICATIONS ==================== */

export async function getApplications(filter?: { jobId?: string; seekerId?: string; employerId?: string }): Promise<JobApplication[]> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      let query: any = admin.adminDb.collection("applications");
      if (filter?.jobId) query = query.where("jobId", "==", filter.jobId);
      if (filter?.seekerId) query = query.where("seekerId", "==", filter.seekerId);
      const snap = await query.get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as JobApplication));
    } catch (e) {
      console.warn("Firestore getApplications fallback:", e);
    }
  }

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
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("applications").doc(app.id).set(app);
    } catch (e) {
      console.warn("Firestore createApplication fallback:", e);
    }
  }

  const db = getLocalDb();
  db.applications.unshift(app);
  saveLocalDb(db);
  return app;
}

export async function updateApplicationStatus(id: string, status: JobApplication["status"]): Promise<JobApplication | null> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("applications").doc(id).update({ status });
    } catch (e) {
      console.warn("Firestore updateApplicationStatus fallback:", e);
    }
  }

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
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const doc = await admin.adminDb.collection("users").doc(uid).get();
      if (doc.exists) {
        return { uid: doc.id, ...doc.data() } as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore getUserById fallback:", e);
    }
  }

  const db = getLocalDb();
  return db.users.find((u) => u.uid === uid) || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const snap = await admin.adminDb.collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
      if (!snap.empty) {
        return { uid: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore getUserByEmail fallback:", e);
    }
  }

  const db = getLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      await admin.adminDb.collection("users").doc(user.uid).set(user);
    } catch (e) {
      console.warn("Firestore saveUser fallback:", e);
    }
  }

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
