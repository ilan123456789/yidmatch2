import { NextResponse } from "next/server";
import { findMatchingAlerts, getJobById } from "@/lib/db";
import { sendJobAlertNotification } from "@/lib/sms/twilio";

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

    // Find all subscribers whose preferences match this job
    const matchingAlerts = await findMatchingAlerts({
      title: job.title,
      category: job.category,
      location: job.location,
      neighborhood: job.neighborhood,
      pay: job.pay,
      salaryMin: job.salaryMin,
    });

    console.log(`[YidMatch SMS Dispatcher] Found ${matchingAlerts.length} matching alert subscriptions for job "${job.title}"`);

    const dispatchResults = [];
    let sentCount = 0;

    for (const alert of matchingAlerts) {
      try {
        const res = await sendJobAlertNotification({
          to: alert.phone,
          recipientName: alert.name,
          job: {
            id: job.id,
            title: job.title,
            company: job.company || "Employer on YidMatch",
            location: job.location || job.neighborhood || "Local",
            payText: job.payText,
            salaryDisplay: job.salaryDisplay,
            pay: job.pay || job.salaryMin,
          },
          baseUrl,
        });

        if (res.success) {
          sentCount++;
        }
        dispatchResults.push({
          phone: alert.phone,
          name: alert.name,
          success: res.success,
          simulated: res.simulated,
          sid: res.sid,
        });
      } catch (err: any) {
        console.error(`[YidMatch SMS Alert] Failed sending to ${alert.phone}:`, err);
        dispatchResults.push({
          phone: alert.phone,
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
      message: `Triggered SMS alerts: ${sentCount} messages sent to matching job seekers.`,
    });
  } catch (err: any) {
    console.error("[YidMatch Alert Match Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to notify matching alerts" }, { status: 500 });
  }
}
