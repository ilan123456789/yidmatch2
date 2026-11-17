import { NextResponse } from "next/server";
import { findMatchingAlerts, getJobById } from "@/lib/db";
import { sendJobAlertEmail } from "@/lib/email/emailjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let job = body.job;

    // If only jobId is passed, look up the job
    if (!job && body.jobId) {
      job = await getJobById(body.jobId);
    }

    if (!job || !job.title) {
      return NextResponse.json({ error: "Valid job details are required for alert notifications" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `http://${origin}`;

    // Find all subscribers whose preferences/interests match this job
    const matchingAlerts = await findMatchingAlerts({
      title: job.title,
      category: job.category,
      location: job.location,
      neighborhood: job.neighborhood,
      description: job.description || job.desc,
      pay: job.pay,
      salaryMin: job.salaryMin,
    });

    console.log(`[YidMatch Email Dispatcher] Found ${matchingAlerts.length} matching alert subscriptions for job "${job.title}"`);

    const dispatchResults = [];
    let sentCount = 0;

    for (const alert of matchingAlerts) {
      if (!alert.email) continue;
      try {
        const res = await sendJobAlertEmail({
          to: alert.email,
          recipientName: alert.name,
          job: {
            id: job.id,
            title: job.title,
            company: job.company || "Employer on Yid Match",
            location: job.location || job.neighborhood || "Local",
            category: job.category,
            jobType: job.type || job.jobType || "Full-Time",
            payText: job.payText,
            salaryDisplay: job.salaryDisplay,
            pay: job.pay || job.salaryMin,
            description: job.description || job.desc,
          },
          baseUrl,
        });

        if (res.success) {
          sentCount++;
        }
        dispatchResults.push({
          email: alert.email,
          name: alert.name,
          success: res.success,
          error: res.error,
        });
      } catch (err: any) {
        console.error(`[YidMatch Email Alert] Failed sending to ${alert.email}:`, err);
        dispatchResults.push({
          email: alert.email,
          name: alert.name,
          success: false,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      matchedCount: matchingAlerts.length,
      sentCount,
      recipients: dispatchResults,
      message: `Triggered email alerts: ${sentCount} messages sent to matching job seekers.`,
    });
  } catch (err: any) {
    console.error("[YidMatch Alert Match Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to notify matching alerts" }, { status: 500 });
  }
}
