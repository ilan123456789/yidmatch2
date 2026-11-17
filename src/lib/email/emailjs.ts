/**
 * YidMatch EmailJS Notification Service
 *
 * Dispatches automated job alert emails to job seekers when new matching listings are posted.
 * Powered by EmailJS REST API.
 */

export interface SendEmailAlertParams {
  to: string;
  recipientName?: string;
  job: {
    id: string;
    title: string;
    company?: string;
    location?: string;
    category?: string;
    jobType?: string;
    payText?: string;
    salaryDisplay?: string;
    pay?: number;
    description?: string;
  };
  baseUrl?: string;
}

export interface SendEmailResult {
  success: boolean;
  to: string;
  error?: string;
}

// In-memory deduplication cache to prevent duplicate emails for the same job within 60 seconds
const recentJobAlertDispatches = new Map<string, number>();

export function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

export async function sendJobAlertEmail(params: SendEmailAlertParams): Promise<SendEmailResult> {
  const normalizedTo = normalizeEmail(params.to);
  if (!isValidEmail(normalizedTo)) {
    return {
      success: false,
      to: params.to,
      error: `Invalid email address: ${params.to}`,
    };
  }

  // Deduplication check
  const cacheKey = `${normalizedTo}:${params.job.id}`;
  const now = Date.now();
  const lastSent = recentJobAlertDispatches.get(cacheKey);
  if (lastSent && now - lastSent < 60_000) {
    console.log(`[EmailJS] Skipping duplicate alert for ${normalizedTo} (job ${params.job.id})`);
    return {
      success: true,
      to: normalizedTo,
    };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID || "service_guu87dr";
  const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_vy0gd6c";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || "ZKOqnexAKIa9ZfRww";
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || "pWsCLTaCYUaphGQZmGPPS";

  const rawBaseUrl = params.baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://yidmatch1.gevaldigwebsites.ca";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  // Format first name
  let firstName = "Friend";
  if (params.recipientName && params.recipientName.trim()) {
    firstName = params.recipientName.trim().split(/\s+/)[0];
  }

  // Format salary
  const salaryText =
    params.job.salaryDisplay ||
    params.job.payText ||
    (params.job.pay ? `$${params.job.pay}/hr` : "Competitive");

  // Format job description snippet
  let description = params.job.description || "Exciting new opportunity posted on Yid Match.";
  if (description.length > 280) {
    description = description.slice(0, 277) + "...";
  }

  const cleanJobId = params.job.id.replace(/^job-job-/, "job-");
  const jobUrl = `${baseUrl}/#job-${cleanJobId}`;
  const preferencesUrl = `${baseUrl}/#job-alerts`;
  const unsubscribeUrl = `${baseUrl}/#unsubscribe`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      to_email: normalizedTo,
      email: normalizedTo,
      recipient_email: normalizedTo,
      to_name: params.recipientName || "Job Seeker",
      firstName,
      jobTitle: params.job.title,
      companyName: params.job.company || "Yid Match Employer",
      location: params.job.location || "Local",
      jobType: params.job.jobType || "Full-Time",
      salary: salaryText,
      jobDescription: description,
      jobUrl,
      preferencesUrl,
      unsubscribeUrl,
    },
  };

  try {
    const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) YidMatch/1.0",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      recentJobAlertDispatches.set(cacheKey, now);
      console.log(`[EmailJS] Alert email delivered to ${normalizedTo} for "${params.job.title}"`);
      return {
        success: true,
        to: normalizedTo,
      };
    }

    const errorBody = await res.text();
    console.warn(`[EmailJS] Failed to send email to ${normalizedTo} (Status ${res.status}): ${errorBody}`);
    return {
      success: false,
      to: normalizedTo,
      error: `EmailJS responded with ${res.status}: ${errorBody}`,
    };
  } catch (err: any) {
    console.error(`[EmailJS] Network error delivering to ${normalizedTo}:`, err);
    return {
      success: false,
      to: normalizedTo,
      error: err.message || "Network error sending email",
    };
  }
}

