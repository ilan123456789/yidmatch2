import { NextResponse } from "next/server";
import { updateJob, getJobById } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { sessionId, jobId, simulated } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let isPaid = false;

    if (simulated || !stripe) {
      // Demo / simulated checkout mode
      isPaid = true;
    } else if (sessionId) {
      // Verify with real Stripe API
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        isPaid = true;
      }
    }

    if (isPaid) {
      const updated = await updateJob(jobId, {
        status: "ACTIVE",
        paymentStatus: "PAID",
        paymentId: sessionId || "sim_pay_" + Date.now(),
      });
      return NextResponse.json({ success: true, job: updated });
    } else {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
