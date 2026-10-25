export type UserRole = "EMPLOYER" | "SEEKER";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  location?: string;
  createdAt: string;
}

export type JobType = "Full-Time" | "Part-Time" | "Remote" | "Hybrid" | "Contract";

export type SalaryPeriod = "Year" | "Hour" | "Month" | "Project";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  neighborhood: string; // e.g. "Lakewood, NJ", "Boro Park, NY", "Monsey, NY", "Williamsburg, NY", "Flatbush, NY", "Five Towns, NY", "Crown Heights, NY", "Passaic, NJ", "Remote"
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryPeriod;
  salaryDisplay?: string;
  description: string;
  requirements: string[];
  heimishPerks: string[]; // e.g. ["Shomer Shabbos", "Minyan On-Site", "Kosher Kitchen", "Early Friday Dismissal", "Separate Seating Option", "Heimish Atmosphere"]
  status: "ACTIVE" | "PENDING_PAYMENT" | "FILLED" | "EXPIRED";
  employerId: string;
  employerEmail: string;
  contactEmail?: string;
  paymentId?: string;
  paymentAmount?: number; // 25
  paymentStatus?: "PAID" | "PENDING" | "FREE_PROMO";
  createdAt: string;
  featured?: boolean;
}

export type DailyJobCategory = 
  | "Simcha & Catering" 
  | "Driver & Delivery" 
  | "Warehouse & Packing" 
  | "Moving & Handyman" 
  | "Office Rush / Temp" 
  | "Babysitting & Childcare"
  | "Other";

export interface DailyJob {
  id: string;
  title: string;
  category: DailyJobCategory;
  location: string;
  neighborhood: string;
  dateNeeded: "Today" | "Tonight" | "Tomorrow" | "Immediate";
  payAmount: string; // e.g. "$160 flat", "$25/hr"
  payType: "Flat Rate" | "Hourly";
  urgencyLevel: "URGENT" | "HIGH" | "NORMAL";
  contactPhone: string;
  contactWhatsapp?: string;
  contactName: string;
  description: string;
  employerId: string;
  status: "ACTIVE" | "FILLED";
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone: string;
  resumeUrl: string;
  resumeFileName: string;
  coverNote?: string;
  status: "SUBMITTED" | "REVIEWED" | "INTERVIEWING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}
