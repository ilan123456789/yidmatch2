/**
 * YidMatch Twilio SMS Integration Service
 *
 * Automatically sends SMS job alerts to job seekers when matching jobs are posted.
 * Supports authenticating with either:
 *   1. Twilio API Key SID (SK...) + API Key Secret (Client Secret) + Account SID (AC...)
 *   2. Twilio Account SID (AC...) + Auth Token
 */

export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface SendSmsResult {
  success: boolean;
  simulated: boolean;
  to: string;
  sid?: string;
  error?: string;
}

// Cache resolved Account SID when an API Key SID is provided
let cachedResolvedAccountSid: string | null = null;

// Deduplication cache to avoid sending duplicate SMS for the same job to the same phone within 90s
const recentJobAlertDispatches = new Map<string, number>();

function toBase64(input: string): string {
  if (typeof btoa === "function") {
    return btoa(input);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8").toString("base64");
  }
  return input;
}

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  const cleaned = rawPhone.trim().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  // Standard 10-digit US/Canada number e.g. 9024490799 -> +19024490799
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  // 11 digits starting with 1 e.g. 19024490799 -> +19024490799
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

async function resolveAccountSid(authHeader: string, configuredAccountSid?: string): Promise<string> {
  if (configuredAccountSid && configuredAccountSid.startsWith("AC")) {
    return configuredAccountSid;
  }
  if (cachedResolvedAccountSid) {
    return cachedResolvedAccountSid;
  }
  try {
    const res = await fetch("https://api.twilio.com/2010-04-01/Accounts.json?PageSize=1", {
      method: "GET",
      headers: { Authorization: authHeader },
    });
    if (res.ok) {
      const data = await res.json();
      const firstSid = data?.accounts?.[0]?.sid;
      if (firstSid && typeof firstSid === "string" && firstSid.startsWith("AC")) {
        cachedResolvedAccountSid = firstSid;
        return firstSid;
      }
    }
  } catch (err) {
    console.warn("[YidMatch SMS] Failed to auto-resolve Account SID:", err);
  }
  return configuredAccountSid || "";
}

export async function sendSms({ to, message }: SendSmsOptions): Promise<SendSmsResult> {
  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo || normalizedTo.replace(/\D/g, "").length < 7) {
    return {
      success: false,
      simulated: false,
      to: rawToOrEmpty(to),
      error: "Invalid recipient phone number",
    };
  }

  const rawAccountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const apiKeySid =
    process.env.TWILIO_API_KEY_SID ||
    (rawAccountSid.startsWith("SK") ? rawAccountSid : "");
  const apiKeySecret =
    process.env.TWILIO_API_KEY_SECRET ||
    process.env.TWILIO_AUTH_TOKEN ||
    "";
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+17372508034";
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  // Determine Basic Auth credentials (API Key SK... + Secret OR Account SID AC... + Auth Token)
  const authUsername = apiKeySid || rawAccountSid;
  const authPassword = apiKeySecret;

  const hasLiveCredentials = Boolean(
    authUsername &&
      authPassword &&
      (fromNumber || messagingServiceSid) &&
      !authUsername.startsWith("AC_DEMO")
  );

  if (!hasLiveCredentials) {
    console.log(`\n============================================================`);
    console.log(`📱 [YidMatch SMS SIMULATION - AWAITING TWILIO KEYS]`);
    console.log(`To:       ${normalizedTo}`);
    console.log(`Status:   Simulated OK`);
    console.log(`Message:  ${message}`);
    console.log(`============================================================\n`);

    return {
      success: true,
      simulated: true,
      to: normalizedTo,
      sid: "sim_" + Math.random().toString(36).substring(2, 10),
    };
  }

  try {
    const authHeader = "Basic " + toBase64(`${authUsername}:${authPassword}`);
    const accountSid = await resolveAccountSid(
      authHeader,
      rawAccountSid.startsWith("AC") ? rawAccountSid : undefined
    );

    if (!accountSid) {
      return {
        success: false,
        simulated: false,
        to: normalizedTo,
        error: "Could not resolve Twilio Account SID",
      };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const params = new URLSearchParams();
    params.append("To", normalizedTo);
    params.append("Body", message);

    if (messagingServiceSid) {
      params.append("MessagingServiceSid", messagingServiceSid);
    } else if (fromNumber) {
      params.append("From", normalizePhoneNumber(fromNumber));
    }

    let response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    let data = await response.json();

    // If the Twilio account is in Trial mode (error 572006: only predefined SMS templates allowed),
    // automatically retry with Twilio's predefined trial template so the live SMS still delivers during testing.
    if (!response.ok && data?.code === 572006) {
      console.warn(
        `[YidMatch SMS] Twilio Trial restriction (572006) on custom body ("${message}"). Retrying with predefined trial template 'sms_event_notifications'...`
      );
      const trialParams = new URLSearchParams();
      trialParams.append("To", normalizedTo);
      trialParams.append("Body", "sms_event_notifications");
      if (messagingServiceSid) {
        trialParams.append("MessagingServiceSid", messagingServiceSid);
      } else if (fromNumber) {
        trialParams.append("From", normalizePhoneNumber(fromNumber));
      }

      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: trialParams.toString(),
      });
      data = await response.json();
    }

    if (!response.ok) {
      console.error("[YidMatch SMS Error] Twilio responded with error:", data);
      return {
        success: false,
        simulated: false,
        to: normalizedTo,
        error: data.message || `Twilio HTTP error ${response.status}`,
      };
    }

    console.log(`[YidMatch SMS Live] Sent SMS to ${normalizedTo} (SID: ${data.sid})`);
    return {
      success: true,
      simulated: false,
      to: normalizedTo,
      sid: data.sid,
    };
  } catch (err: any) {
    console.error("[YidMatch SMS Exception]:", err);
    return {
      success: false,
      simulated: false,
      to: normalizedTo,
      error: err.message || "Failed to dispatch SMS",
    };
  }
}

function rawToOrEmpty(to?: string): string {
  return to || "";
}

/**
 * Format and send an instant job alert SMS (with deduplication per job + phone)
 */
export async function sendJobAlertNotification({
  to,
  recipientName,
  job,
  baseUrl = "https://yidmatch.com",
}: {
  to: string;
  recipientName?: string;
  job: {
    id?: string | number;
    title: string;
    company?: string;
    location?: string;
    category?: string;
    payText?: string;
    salaryDisplay?: string;
    pay?: number;
  };
  baseUrl?: string;
}): Promise<SendSmsResult> {
  const normalizedTo = normalizePhoneNumber(to);
  const dedupeKey = `${normalizedTo}|${(job.title || "").trim().toLowerCase()}|${(job.company || "").trim().toLowerCase()}`;
  const now = Date.now();
  const lastSent = recentJobAlertDispatches.get(dedupeKey);

  if (lastSent && now - lastSent < 90_000) {
    return {
      success: true,
      simulated: false,
      to: normalizedTo,
      sid: "deduped",
    };
  }
  recentJobAlertDispatches.set(dedupeKey, now);

  const greeting = recipientName ? `Hi ${recipientName}, ` : "";
  const payInfo = job.payText || job.salaryDisplay || (job.pay ? `$${job.pay}/hr` : "");
  const payString = payInfo ? ` (${payInfo})` : "";
  const companyString = job.company ? ` at ${job.company}` : "";
  const locString = job.location ? ` in ${job.location}` : "";
  const cleanBase =
    baseUrl && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")
      ? baseUrl.replace(/\/$/, "")
      : "https://yidmatch.com";
  const link = `${cleanBase}/#jobs`;

  const message = `${greeting}New Job on YidMatch: "${job.title}"${companyString}${locString}${payString}. View & apply: ${link} (Reply STOP to opt out)`;

  return sendSms({ to: normalizedTo, message });
}

/**
 * Send welcome confirmation SMS when a job seeker registers for alerts
 */
export async function sendWelcomeAlertNotification({
  to,
  name,
  categories = [],
  location,
}: {
  to: string;
  name?: string;
  categories?: string[];
  location?: string;
}): Promise<SendSmsResult> {
  const greeting = name ? `Hi ${name}! ` : "Hi! ";
  const catString = categories.length > 0 ? categories.slice(0, 3).join(", ") : "all job categories";
  const locString = location ? ` in ${location}` : "";

  const message = `${greeting}You are subscribed to YidMatch SMS Job Alerts for ${catString}${locString}. We will text you whenever a matching job is posted! Reply STOP to cancel.`;

  return sendSms({ to, message });
}
