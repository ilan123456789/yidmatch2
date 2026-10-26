/**
 * YidMatch Twilio SMS Integration Service
 * 
 * Automatically sends SMS job alerts to job seekers when matching jobs are posted.
 * When TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are provided in environment variables,
 * messages are dispatched live via Twilio REST API.
 * When credentials are not yet set, messages run in simulated mode and log to the console,
 * seamlessly ready for real keys at any time.
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

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  const cleaned = rawPhone.trim().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  // Standard 10-digit US number e.g. 7325550199 -> +17325550199
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  // 11 digits starting with 1 e.g. 17325550199 -> +17325550199
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

export async function sendSms({ to, message }: SendSmsOptions): Promise<SendSmsResult> {
  const normalizedTo = normalizePhoneNumber(to);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  // Check if live Twilio credentials are configured
  const hasLiveCredentials = Boolean(
    accountSid &&
    authToken &&
    (fromNumber || messagingServiceSid) &&
    !accountSid.startsWith("AC_DEMO")
  );

  if (!hasLiveCredentials) {
    console.log(`\n============================================================`);
    console.log(`📱 [YidMatch SMS SIMULATION - AWAITING TWILIO KEYS]`);
    console.log(`To:       ${normalizedTo}`);
    console.log(`Status:   Simulated OK (Live SMS will send once keys are added)`);
    console.log(`Message:  ${message}`);
    console.log(`============================================================\n`);

    return {
      success: true,
      simulated: true,
      to: normalizedTo,
      sid: "sim_" + Math.random().toString(36).substring(2, 10),
    };
  }

  // Live Twilio REST API Call via standard fetch (Edge and Node safe)
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", normalizedTo);
    params.append("Body", message);

    if (messagingServiceSid) {
      params.append("MessagingServiceSid", messagingServiceSid);
    } else if (fromNumber) {
      params.append("From", fromNumber);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[YidMatch SMS Error] Twilio responded with error:", data);
      return {
        success: false,
        simulated: false,
        to: normalizedTo,
        error: data.message || `Twilio HTTP error ${response.status}`,
      };
    }

    console.log(`[YidMatch SMS Live] Successfully sent SMS to ${normalizedTo} (SID: ${data.sid})`);
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

/**
 * Format and send an instant job alert SMS
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
    id: string | number;
    title: string;
    company: string;
    location: string;
    payText?: string;
    salaryDisplay?: string;
    pay?: number;
  };
  baseUrl?: string;
}): Promise<SendSmsResult> {
  const greeting = recipientName ? `Hi ${recipientName}, ` : "";
  const payInfo = job.payText || job.salaryDisplay || (job.pay ? `$${job.pay}/hr` : "");
  const payString = payInfo ? ` · Pay: ${payInfo}` : "";
  const locString = job.location ? ` in ${job.location}` : "";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const link = `${cleanBase}/#jobs`;

  const message = `🔔 ${greeting}New Job Alert on YidMatch:\n"${job.title}" at ${job.company}${locString}${payString}.\n\nApply or view details: ${link}\n(Reply STOP to opt out)`;

  return sendSms({ to, message });
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
  const catString = categories.length > 0 ? categories.slice(0, 3).join(", ") : "all categories";
  const locString = location ? ` in ${location}` : "";

  const message = `✓ ${greeting}You are subscribed to instant YidMatch Job Alerts for ${catString}${locString}. We will text you the moment a matching job is posted!\n\nReply STOP anytime to cancel.`;

  return sendSms({ to, message });
}
