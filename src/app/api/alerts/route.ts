import { NextResponse } from "next/server";
import { createJobAlert, getJobAlerts } from "@/lib/db";
import { normalizeEmail, isValidEmail } from "@/lib/email/emailjs";

export async function GET() {
  try {
    const alerts = await getJobAlerts();
    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts: alerts.map((a) => ({
        id: a.id,
        email: a.email,
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
    const { email, phone, name, categories, locations, neighborhood, minPay } = body;

    const emailCandidate = email || (typeof phone === "string" && phone.includes("@") ? phone : "");
    if (!emailCandidate || !isValidEmail(emailCandidate)) {
      return NextResponse.json({ error: "A valid email address is required for job alerts" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(emailCandidate);

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
      email: normalizedEmail,
      phone: phone && typeof phone === "string" ? phone.trim() : undefined,
      name: name?.trim() || "",
      categories: cleanedCategories,
      locations: cleanedLocations,
      neighborhood: neighborhood || (cleanedLocations[0] || ""),
      minPay: parsedMinPay,
      active: true,
    });

    return NextResponse.json({
      success: true,
      alert,
      message: "Job alert activated successfully! You will receive email alerts when matching jobs are posted.",
    });
  } catch (err: any) {
    console.error("[YidMatch Alerts POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to register job alert" }, { status: 500 });
  }
}
