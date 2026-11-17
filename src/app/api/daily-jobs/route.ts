import { NextResponse } from "next/server";
import { getDailyJobs, createDailyJob, findMatchingAlerts } from "@/lib/db";
import { sendJobAlertEmail } from "@/lib/email/emailjs";
import { DailyJob } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const neighborhood = searchParams.get("neighborhood");
    const dateNeeded = searchParams.get("dateNeeded");

    let dailyJobs = await getDailyJobs();

    if (category && category !== "All Categories") {
      dailyJobs = dailyJobs.filter((dj) => dj.category === category);
    }

    if (neighborhood && neighborhood !== "All Locations") {
      dailyJobs = dailyJobs.filter((dj) => dj.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
    }

    if (dateNeeded && dateNeeded !== "All Days") {
      dailyJobs = dailyJobs.filter((dj) => dj.dateNeeded === dateNeeded);
    }

    return NextResponse.json({ dailyJobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch daily jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      location,
      neighborhood,
      dateNeeded,
      payAmount,
      payType,
      urgencyLevel,
      contactPhone,
      contactWhatsapp,
      contactName,
      description,
      employerId,
    } = body;

    if (!title || !category || !location || !payAmount || !contactPhone || !description) {
      return NextResponse.json({ error: "Missing required fields for daily gig" }, { status: 400 });
    }

    const newDailyJob: DailyJob = {
      id: body.id || "daily-" + Math.random().toString(36).substring(2, 10),
      title,
      category,
      location,
      neighborhood: neighborhood || location || "Lakewood, NJ",
      dateNeeded: dateNeeded || "Today",
      payAmount: String(payAmount),
      payType: payType || "Flat Rate",
      urgencyLevel: urgencyLevel || "URGENT",
      contactPhone,
      contactWhatsapp: contactWhatsapp || contactPhone.replace(/\D/g, ""),
      contactName: contactName || "Hiring Manager",
      description,
      employerId: employerId || "emp-quick",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    await createDailyJob(newDailyJob);

    // Automatically send Email notifications to all matching people
    let alertsSentCount = 0;
    try {
      const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
      const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;
      const numericPay = Number(String(payAmount).replace(/[^0-9.]/g, "")) || undefined;

      const matchingAlerts = await findMatchingAlerts({
        title: newDailyJob.title,
        category: newDailyJob.category,
        location: newDailyJob.location,
        neighborhood: newDailyJob.neighborhood,
        description: newDailyJob.description,
        pay: numericPay,
      });

      for (const alert of matchingAlerts) {
        if (!alert.email) continue;
        const emailRes = await sendJobAlertEmail({
          to: alert.email,
          recipientName: alert.name,
          job: {
            id: newDailyJob.id,
            title: newDailyJob.title,
            company: newDailyJob.contactName,
            location: newDailyJob.location,
            category: newDailyJob.category,
            jobType: "Same-Day / Immediate",
            payText: String(payAmount).includes("$") ? String(payAmount) : `$${payAmount}`,
            pay: numericPay,
            description: newDailyJob.description,
          },
          baseUrl,
        });
        if (emailRes.success) {
          alertsSentCount++;
        }
      }
    } catch (alertErr) {
      console.warn("[POST /api/daily-jobs] Email alert dispatch error:", alertErr);
    }

    return NextResponse.json({
      success: true,
      dailyJob: newDailyJob,
      alertsSentCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post daily gig" }, { status: 500 });
  }
}
