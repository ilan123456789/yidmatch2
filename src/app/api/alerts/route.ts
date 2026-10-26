import { NextResponse } from "next/server";
import { createJobAlert, getJobAlerts } from "@/lib/db";
import { sendWelcomeAlertNotification, normalizePhoneNumber } from "@/lib/sms/twilio";

export async function GET() {
  try {
    const alerts = await getJobAlerts();
    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts: alerts.map((a) => ({
        id: a.id,
        phone: a.phone,
        name: a.name,
        categories: a.categories,
        locations: a.locations,
        minPay: a.minPay,
        createdAt: a.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name, categories, locations, neighborhood, minPay, sendWelcomeSms = true } = body;

    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      return NextResponse.json({ error: "A valid phone number is required for SMS job alerts" }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "Please enter a valid phone number (at least 7 digits)" }, { status: 400 });
    }

    const cleanedCategories = Array.isArray(categories)
      ? categories.filter(Boolean)
      : typeof categories === "string" && categories.trim()
      ? [categories.trim()]
      : [];

    const cleanedLocations = Array.isArray(locations)
      ? locations.filter(Boolean)
      : typeof locations === "string" && locations.trim()
      ? [locations.trim()]
      : neighborhood
      ? [neighborhood]
      : [];

    const parsedMinPay = minPay && !isNaN(Number(minPay)) ? Number(minPay) : undefined;

    const alert = await createJobAlert({
      phone: normalizedPhone,
      name: name?.trim() || "",
      categories: cleanedCategories,
      locations: cleanedLocations,
      neighborhood: neighborhood || (cleanedLocations[0] || ""),
      minPay: parsedMinPay,
      active: true,
    });

    let welcomeResult = null;
    if (sendWelcomeSms) {
      try {
        welcomeResult = await sendWelcomeAlertNotification({
          to: normalizedPhone,
          name: name?.trim(),
          categories: cleanedCategories,
          location: cleanedLocations[0],
        });
      } catch (smsErr) {
        console.warn("[YidMatch Alerts] Welcome SMS delivery error:", smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      alert,
      welcomeSms: welcomeResult,
      message: "Job alert activated successfully! You will receive text alerts when matching jobs are posted.",
    });
  } catch (err: any) {
    console.error("[YidMatch Alerts POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to register job alert" }, { status: 500 });
  }
}
