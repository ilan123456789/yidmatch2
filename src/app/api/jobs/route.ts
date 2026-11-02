import { NextResponse } from "next/server";
import { getJobs, getAllEmployerJobs, createJob } from "@/lib/db";
import { createJobPostingCheckoutSession } from "@/lib/stripe";
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
      title,
      company,
      location,
      neighborhood,
      jobType,
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

    const jobId = "job-" + Math.random().toString(36).substring(2, 10);
    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;

    const now = new Date();
    const newJob: Job = {
      id: jobId,
      title,
      company,
      location,
      neighborhood: neighborhood || "Lakewood, NJ",
      jobType: jobType || "Full-Time",
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryType: salaryType || "Year",
      salaryDisplay: salaryDisplay || (salaryMin && salaryMax ? `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}` : "Competitive"),
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split("\n").filter(Boolean) : []),
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
      checkoutUrl: checkout.url,
      sessionId: checkout.sessionId,
      isSimulated: checkout.isSimulated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
