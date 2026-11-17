import fs from "fs";
import path from "path";
import { Job, DailyJob, JobApplication, UserProfile, JobAlert } from "@/types";
import { normalizePhoneNumber } from "@/lib/sms/twilio";
import { normalizeEmail, isValidEmail } from "@/lib/email/emailjs";

interface DatabaseSchema {
  users: UserProfile[];
  jobs: Job[];
  dailyJobs: DailyJob[];
  applications: JobApplication[];
  jobAlerts: JobAlert[];
}

const FIRESTORE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "yidmatch1";

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  accounting: ["account", "bookkeep", "quickbooks", "payroll", "controller", "finance", "cpa", "tax", "billing", "ap", "ar", "audit"],
  administration: ["admin", "office", "secretary", "reception", "coordinator", "clerk", "assistant", "data entry", "operations", "front desk"],
  sales: ["sales", "closer", "business development", "account executive", "b2b", "commission", "rep", "outbound", "telemarketing"],
  "customer service": ["customer service", "support", "dispatcher", "call center", "client", "help desk", "phone", "representative"],
  hvac: ["hvac", "air condition", "mini-split", "minisplit", "heating", "cooling", "ac tech", "refrigeration", "duct", "climate"],
  plumbing: ["plumb", "pipe", "drain", "water heater", "boiler", "fixture"],
  electrical: ["electric", "wiring", "panel", "lighting", "low voltage", "alarm", "tech"],
  construction: ["construction", "carpenter", "handyman", "installer", "framing", "drywall", "renovation", "remodel", "contractor", "helper", "trade", "labor"],
  driving: ["driver", "driving", "delivery", "route", "chauffeur", "van", "truck", "cdl", "courier", "transport", "car"],
  warehouse: ["warehouse", "shipping", "receiving", "inventory", "picker", "packer", "packing", "forklift", "pallet", "logistics", "fulfillment", "stock"],
  it: ["it", "tech", "computer", "network", "software", "developer", "web", "programmer", "engineer", "cyber", "system", "helpdesk"],
  design: ["design", "graphic", "creative", "video", "photo", "editor", "illustrator", "layout", "branding", "ui", "ux"],
  marketing: ["marketing", "social media", "ads", "advertising", "seo", "content", "copywriter", "pr", "campaign", "brand"],
  "real estate": ["real estate", "property", "leasing", "tenant", "building", "super", "management", "mortgage", "title", "broker"],
  healthcare: ["health", "medical", "nurse", "nursing", "clinic", "dental", "therapy", "therapist", "caregiver", "home care", "emt", "pharmacy", "aba"],
  education: ["education", "teacher", "teaching", "rebbe", "morah", "school", "tutor", "yeshiva", "seminary", "daycare", "preschool", "principal"],
  "food service": ["food", "kitchen", "cook", "chef", "baker", "bakery", "catering", "waiter", "waitstaff", "simcha", "pizza", "restaurant", "kosher", "counter"],
  retail: ["retail", "store", "cashier", "associate", "shop", "merchandise", "showroom", "counter"],
  security: ["security", "guard", "patrol", "safety", "monitor"],
  management: ["manager", "management", "director", "supervisor", "lead", "executive", "vp", "head", "chief", "operations"],
};

// Similar/Related Category Clusters - when a job is posted in a similar field, subscribers also receive alerts
const RELATED_CATEGORIES: Record<string, string[]> = {
  administration: ["accounting", "customer service", "management", "sales", "office", "general"],
  accounting: ["administration", "finance", "management", "office", "general"],
  "customer service": ["administration", "sales", "dispatch", "office", "general"],
  sales: ["customer service", "marketing", "administration", "general"],
  management: ["administration", "operations", "accounting", "general"],
  hvac: ["plumbing", "electrical", "construction", "general"],
  plumbing: ["hvac", "construction", "general"],
  electrical: ["hvac", "construction", "it", "general"],
  construction: ["plumbing", "electrical", "hvac", "handyman", "general"],
  driving: ["warehouse", "delivery", "logistics", "general"],
  warehouse: ["driving", "logistics", "operations", "general"],
  it: ["electrical", "design", "general"],
  design: ["marketing", "it", "general"],
  marketing: ["sales", "design", "general"],
  retail: ["customer service", "food service", "general"],
  "food service": ["retail", "general"],
  healthcare: ["general"],
  education: ["general"],
};

function getDataPaths() {
  try {
    const cwd = typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : ".";
    const dataDir = path.join(cwd, ".data");
    const dataFile = path.join(dataDir, "yidmatch_db.json");
    return { dataDir, dataFile };
  } catch {
    return { dataDir: ".data", dataFile: ".data/yidmatch_db.json" };
  }
}

// In-memory store for Cloudflare Workers / Edge isolates where disk writes are disallowed
let memoryDb: DatabaseSchema | null = null;

function getSeedDatabase(): DatabaseSchema {
  return {
    users: [],
    jobs: [],
    dailyJobs: [],
    applications: [],
    jobAlerts: [],
  };
}

// Ensure data directory and initial seed file exist
function getLocalDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  const { dataDir, dataFile } = getDataPaths();

  try {
    if (typeof fs !== "undefined" && fs.existsSync && fs.readFileSync) {
      if (fs.existsSync(dataFile)) {
        const content = fs.readFileSync(dataFile, "utf-8");
        if (content && content.trim()) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && Array.isArray(parsed.jobs)) {
              memoryDb = parsed;
              if (!memoryDb!.jobAlerts) {
                memoryDb!.jobAlerts = [];
              }
              return memoryDb!;
            }
          } catch (e) {
            console.warn("yidmatch_db.json corrupted or incomplete, resetting to seed data:", e);
          }
        }
      }

      if (fs.mkdirSync && fs.writeFileSync) {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const initialData = getSeedDatabase();
        fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2), "utf-8");
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
  const { dataDir, dataFile } = getDataPaths();
  try {
    if (typeof fs !== "undefined" && fs.writeFileSync) {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch {
    // Gracefully persist in-memory in edge environments
  }
}

/* ==================== FIRESTORE REST HELPERS ==================== */

async function upsertFirestoreAlert(alert: JobAlert): Promise<void> {
  try {
    const normEmail = normalizeEmail(alert.email);
    if (!normEmail) return;
    const docId = `alert_${normEmail.replace(/[^a-z0-9]/g, "_")}`;
    const body = {
      fields: {
        id: { stringValue: alert.id },
        email: { stringValue: normEmail },
        phone: { stringValue: alert.phone ? normalizePhoneNumber(alert.phone) : "" },
        name: { stringValue: alert.name || "" },
        neighborhood: { stringValue: alert.neighborhood || "" },
        categories: {
          arrayValue: {
            values: (alert.categories || []).map((c) => ({ stringValue: String(c) })),
          },
        },
        locations: {
          arrayValue: {
            values: (alert.locations || []).map((l) => ({ stringValue: String(l) })),
          },
        },
        minPay: { integerValue: String(alert.minPay || 0) },
        active: { booleanValue: alert.active !== false },
        createdAt: { stringValue: alert.createdAt || new Date().toISOString() },
      },
    };

    await fetch(`${FIRESTORE_BASE_URL}/job_alerts/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("[Firestore REST] Could not upsert job_alert:", err);
  }
}

async function fetchFirestoreAlerts(): Promise<JobAlert[]> {
  try {
    const res = await fetch(`${FIRESTORE_BASE_URL}/job_alerts?pageSize=200`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.documents)) return [];

    return data.documents
      .map((doc: any): JobAlert | null => {
        const f = doc.fields || {};
        const email = normalizeEmail(f.email?.stringValue || f.to_email?.stringValue || "");
        const phone = f.phone?.stringValue || "";
        if (!email && !phone) return null;
        const resolvedEmail = email || `${phone.replace(/\D/g, "")}@phone.yidmatch.local`;
        const categories = Array.isArray(f.categories?.arrayValue?.values)
          ? f.categories.arrayValue.values.map((v: any) => v.stringValue).filter(Boolean)
          : [];
        const locations = Array.isArray(f.locations?.arrayValue?.values)
          ? f.locations.arrayValue.values.map((v: any) => v.stringValue).filter(Boolean)
          : f.location?.stringValue
          ? [f.location.stringValue]
          : [];
        const minPayNum = Number(f.minPay?.integerValue || f.minPay?.doubleValue || 0);
        return {
          id: f.id?.stringValue || doc.name?.split("/").pop() || "alert",
          email: resolvedEmail,
          phone: phone ? normalizePhoneNumber(phone) : undefined,
          name: f.name?.stringValue || "",
          categories,
          locations,
          neighborhood: f.neighborhood?.stringValue || locations[0] || "",
          minPay: minPayNum > 0 ? minPayNum : undefined,
          active: f.active?.booleanValue !== false,
          createdAt: f.createdAt?.stringValue || new Date().toISOString(),
        };
      })
      .filter((a: JobAlert | null): a is JobAlert => Boolean(a && a.active));
  } catch (err) {
    console.warn("[Firestore REST] Could not fetch job_alerts:", err);
    return [];
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
  const existsIdx = db.jobs.findIndex((j) => j.id === job.id);
  if (existsIdx !== -1) {
    db.jobs[existsIdx] = { ...db.jobs[existsIdx], ...job };
  } else {
    db.jobs.unshift(job);
  }
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

  // If this user is a SEEKER with an email address, ensure they have an active JobAlert synced
  if (user.role === "SEEKER" && user.email && isValidEmail(user.email) && user.emailAlerts !== false) {
    await createJobAlert({
      email: normalizeEmail(user.email),
      phone: user.phone ? normalizePhoneNumber(user.phone) : undefined,
      name: user.name,
      categories: user.interests || user.categories || [],
      locations: user.location ? [user.location] : [],
      neighborhood: user.location || "",
      minPay: user.minPay,
      active: true,
    });
  }

  return user;
}

/* ==================== JOB ALERTS ==================== */

export async function getJobAlerts(): Promise<JobAlert[]> {
  const db = getLocalDb();
  const firestoreAlerts = await fetchFirestoreAlerts();

  const mergedByEmail = new Map<string, JobAlert>();

  // 1. Add SEEKER users with emails from local DB as baseline subscribers
  for (const user of db.users || []) {
    if (user.role === "SEEKER" && user.email && isValidEmail(user.email) && user.emailAlerts !== false) {
      const normEmail = normalizeEmail(user.email);
      mergedByEmail.set(normEmail, {
        id: `usr-alert-${user.uid}`,
        email: normEmail,
        phone: user.phone ? normalizePhoneNumber(user.phone) : undefined,
        name: user.name || "",
        categories: user.interests || user.categories || [],
        locations: user.location ? [user.location] : [],
        neighborhood: user.location || "",
        minPay: user.minPay,
        active: true,
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  }

  // 2. Overlay Firestore job_alerts (more specific interest/category preferences)
  for (const fa of firestoreAlerts) {
    if (!fa.active) continue;
    const normEmail = normalizeEmail(fa.email);
    if (!normEmail) continue;
    const existing = mergedByEmail.get(normEmail);
    mergedByEmail.set(normEmail, {
      ...existing,
      ...fa,
      email: normEmail,
      categories: fa.categories && fa.categories.length > 0 ? fa.categories : existing?.categories || [],
      locations: fa.locations && fa.locations.length > 0 ? fa.locations : existing?.locations || [],
    });
  }

  // 3. Overlay local db.jobAlerts (most recent in-process updates)
  for (const la of db.jobAlerts || []) {
    if (!la.active) continue;
    const normEmail = normalizeEmail(la.email);
    if (!normEmail) continue;
    const existing = mergedByEmail.get(normEmail);
    mergedByEmail.set(normEmail, {
      ...existing,
      ...la,
      email: normEmail,
      categories: la.categories && la.categories.length > 0 ? la.categories : existing?.categories || [],
      locations: la.locations && la.locations.length > 0 ? la.locations : existing?.locations || [],
    });
  }

  return Array.from(mergedByEmail.values()).filter((a) => a.active);
}

export async function createJobAlert(
  alertData: Omit<JobAlert, "id" | "createdAt" | "active"> & { active?: boolean }
): Promise<JobAlert> {
  const id = "alert-" + Math.random().toString(36).substring(2, 10);
  const normalizedEmail = normalizeEmail(alertData.email);
  const newAlert: JobAlert = {
    id,
    email: normalizedEmail,
    phone: alertData.phone ? normalizePhoneNumber(alertData.phone) : undefined,
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

  const existingIdx = db.jobAlerts.findIndex((a) => normalizeEmail(a.email) === normalizedEmail);

  let savedAlert: JobAlert;
  if (existingIdx !== -1) {
    db.jobAlerts[existingIdx] = {
      ...db.jobAlerts[existingIdx],
      ...newAlert,
      id: db.jobAlerts[existingIdx].id,
      categories:
        newAlert.categories.length > 0 ? newAlert.categories : db.jobAlerts[existingIdx].categories || [],
      locations:
        newAlert.locations && newAlert.locations.length > 0
          ? newAlert.locations
          : db.jobAlerts[existingIdx].locations || [],
    };
    saveLocalDb(db);
    savedAlert = db.jobAlerts[existingIdx];
  } else {
    db.jobAlerts.unshift(newAlert);
    saveLocalDb(db);
    savedAlert = newAlert;
  }

  // Persist to Firebase Firestore so it is available across all edge workers & devices
  upsertFirestoreAlert(savedAlert).catch((err) =>
    console.warn("[createJobAlert] Failed to upsert to Firestore:", err)
  );

  return savedAlert;
}

function matchesCategoryInterest(subscriberCategories: string[], jobText: string, jobCategory: string): boolean {
  if (!subscriberCategories || subscriberCategories.length === 0) {
    return true;
  }

  const normalizedJobCategory = (jobCategory || "").toLowerCase().trim();
  const normalizedJobText = (jobText || "").toLowerCase().trim();

  // If the job category is general or other, match everyone
  if (
    !normalizedJobCategory ||
    normalizedJobCategory === "general" ||
    normalizedJobCategory === "other" ||
    normalizedJobCategory === "flexible"
  ) {
    return true;
  }

  // Find all category groups that this job belongs to (including via synonyms)
  const jobMatchedGroups = new Set<string>();
  for (const [groupKey, synonyms] of Object.entries(CATEGORY_KEYWORDS)) {
    if (
      normalizedJobCategory.includes(groupKey) ||
      groupKey.includes(normalizedJobCategory) ||
      synonyms.some((s) => normalizedJobCategory.includes(s) || normalizedJobText.includes(s))
    ) {
      jobMatchedGroups.add(groupKey);
    }
  }

  return subscriberCategories.some((rawCat) => {
    const cat = rawCat.toLowerCase().trim();
    if (!cat || cat === "all" || cat === "all categories" || cat === "any" || cat === "other" || cat === "general") {
      return true;
    }

    // 1. Direct or reverse substring match
    if (
      normalizedJobCategory.includes(cat) ||
      cat.includes(normalizedJobCategory) ||
      normalizedJobText.includes(cat)
    ) {
      return true;
    }

    // 2. Word token match (skip generic stop words)
    const stopWords = new Set(["work", "job", "jobs", "like", "want", "looking", "the", "and", "for", "with", "any"]);
    const words = cat.split(/[\s/&,-]+/).filter((w) => w.length >= 3 && !stopWords.has(w));
    if (words.some((w) => normalizedJobCategory.includes(w) || normalizedJobText.includes(w))) {
      return true;
    }

    // 3. Synonym & Group matching for subscriber
    const subscriberGroups = new Set<string>();
    for (const [groupKey, synonyms] of Object.entries(CATEGORY_KEYWORDS)) {
      if (
        cat.includes(groupKey) ||
        groupKey.includes(cat) ||
        synonyms.some((s) => cat.includes(s))
      ) {
        subscriberGroups.add(groupKey);
      }
    }

    // If subscriber and job share ANY category group
    for (const group of subscriberGroups) {
      if (jobMatchedGroups.has(group)) {
        return true;
      }
      // 4. SIMILAR CATEGORIES MATCH (Cross-category similarity)
      // When subscriber likes group A (e.g. administration), also send alerts for related categories (e.g. accounting, customer service)
      const related = RELATED_CATEGORIES[group] || [];
      for (const rel of related) {
        if (jobMatchedGroups.has(rel) || normalizedJobCategory.includes(rel) || normalizedJobText.includes(rel)) {
          return true;
        }
      }
    }

    // If job matched any group that is related to subscriber's group
    for (const jobGroup of jobMatchedGroups) {
      const relatedToJob = RELATED_CATEGORIES[jobGroup] || [];
      for (const rel of relatedToJob) {
        if (subscriberGroups.has(rel) || cat.includes(rel)) {
          return true;
        }
      }
    }

    return false;
  });
}

export async function findMatchingAlerts(job: {
  title: string;
  category?: string;
  location?: string;
  neighborhood?: string;
  description?: string;
  pay?: number;
  salaryMin?: number;
}): Promise<JobAlert[]> {
  const alerts = await getJobAlerts();
  const jobCategory = (job.category || "").toLowerCase();
  const jobTitle = (job.title || "").toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();
  const combinedJobText = `${jobTitle} ${jobCategory} ${jobDesc}`;
  const jobPay = Number(job.pay || job.salaryMin || 0);

  return alerts.filter((alert) => {
    if (!alert.active) return false;

    // 1. Min pay check (only when both are hourly or both are annual)
    if (alert.minPay && alert.minPay > 0 && jobPay > 0) {
      const bothHourly = alert.minPay < 500 && jobPay < 500;
      const bothYearly = alert.minPay >= 500 && jobPay >= 500;
      if ((bothHourly || bothYearly) && jobPay < alert.minPay) {
        return false;
      }
    }

    // 2. Category / Interest check
    if (alert.categories && alert.categories.length > 0) {
      if (!matchesCategoryInterest(alert.categories, combinedJobText, jobCategory)) {
        return false;
      }
    }

    return true;
  });
}
