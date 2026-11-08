import { NextResponse } from "next/server";
import { getJobs, getAllEmployerJobs, createJob, findMatchingAlerts } from "@/lib/db";
import { createJobPostingCheckoutSession } from "@/lib/stripe";
import { sendJobAlertNotification } from "@/lib/sms/twilio";
import { formatDbDate } from "@/lib/date-utils";
import { Job } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employerId = searchParams.get("employerId");
    const neighborhood = searchParams.get("neighborhood");
    const jobType = searchParams.get("jobType");
    const perk = searchParams.get("perk");
    const search = searchParams.get("search")?.toLowerCase();

    let jobs: Job[] = [];

    if (employerId) {
      jobs = await getAllEmployerJobs(employerId);
    } else {
      jobs = await getJobs();
    }

    if (neighborhood && neighborhood !== "All Locations") {
      jobs = jobs.filter((j) => j.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
    }

    if (jobType && jobType !== "All Types") {
      jobs = jobs.filter((j) => j.jobType === jobType);
    }

    if (perk) {
      jobs = jobs.filter((j) => j.heimishPerks && j.heimishPerks.includes(perk));
    }

    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.company.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search) ||
          j.location.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      company,
      category,
      location,
      country,
      neighborhood,
      jobType,
      pay,
      payText,
      salaryMin,
      salaryMax,
      salaryType,
      salaryDisplay,
      description,
      requirements,
      heimishPerks,
      employerId,
      employerEmail,
      contactEmail,
      isSponsored,
    } = body;

    if (!title || !company || !location || !description || !employerId) {
      return NextResponse.json({ error: "Missing required job listing fields" }, { status: 400 });
    }

    const jobId = id || "job-" + Math.random().toString(36).substring(2, 10);
    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;

    const now = new Date();
    const numericPay = salaryMin ? Number(salaryMin) : pay ? Number(pay) : undefined;
    const displayPay =
      salaryDisplay ||
      payText ||
      (salaryMin && salaryMax ? `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}` : numericPay ? `$${numericPay}/hr` : "Competitive");

    const newJob: Job = {
      id: jobId,
      title,
      company,
      category: category || "General",
      location,
      country: country || "United States",
      neighborhood: neighborhood || location || "Lakewood, NJ",
      jobType: jobType || "Full-Time",
      pay: numericPay,
      payText: displayPay,
      salaryMin: numericPay,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryType: salaryType || "Year",
      salaryDisplay: displayPay,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements ? requirements.split("\n").filter(Boolean) : [],
      heimishPerks: Array.isArray(heimishPerks) ? heimishPerks : [],
      status: body.status || "ACTIVE",
      employerId,
      employerEmail: employerEmail || "",
      contactEmail: contactEmail || employerEmail || "",
      paymentAmount: isSponsored ? 45 : 35,
      paymentStatus: body.paymentStatus || "PAID",
      createdAt: now.toISOString(),
      postedAt: formatDbDate(now),
      isSponsored: Boolean(isSponsored),
      featured: Boolean(isSponsored),
    };

    await createJob(newJob);

    // Automatically send Twilio SMS notifications to all matching people with interest
    let alertsSentCount = 0;
    try {
      const matchingAlerts = await findMatchingAlerts({
        title: newJob.title,
        category: newJob.category,
        location: newJob.location,
        neighborhood: newJob.neighborhood,
        description: newJob.description,
        pay: newJob.pay,
        salaryMin: newJob.salaryMin,
      });

      for (const alert of matchingAlerts) {
        const smsRes = await sendJobAlertNotification({
          to: alert.phone,
          recipientName: alert.name,
          job: {
            id: newJob.id,
            title: newJob.title,
            company: newJob.company,
            location: newJob.location || newJob.neighborhood,
            category: newJob.category,
            payText: newJob.payText,
            salaryDisplay: newJob.salaryDisplay,
            pay: newJob.pay || newJob.salaryMin,
          },
          baseUrl,
        });
        if (smsRes.success) {
          alertsSentCount++;
        }
      }
    } catch (smsErr) {
      console.warn("[POST /api/jobs] SMS alert dispatch error:", smsErr);
    }

    // Create Stripe Checkout Session ($35.00 Regular or $45.00 Sponsored)
    const checkout = await createJobPostingCheckoutSession({
      jobId,
      jobTitle: title,
      employerEmail: employerEmail || "billing@yidmatch.com",
      baseUrl,
      isSponsored: Boolean(isSponsored),
    });

    return NextResponse.json({
      success: true,
      job: newJob,
      alertsSentCount,
      checkoutUrl: checkout.url,
      sessionId: checkout.sessionId,
      isSimulated: checkout.isSimulated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
