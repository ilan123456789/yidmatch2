import { NextResponse } from "next/server";
import { getDailyJobs, createDailyJob } from "@/lib/db";
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
      id: "daily-" + Math.random().toString(36).substring(2, 10),
      title,
      category,
      location,
      neighborhood: neighborhood || "Lakewood, NJ",
      dateNeeded: dateNeeded || "Today",
      payAmount,
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

    return NextResponse.json({ success: true, dailyJob: newDailyJob });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post daily gig" }, { status: 500 });
  }
}
