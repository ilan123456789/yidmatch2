import { NextResponse } from "next/server";
import { saveUser, getUserByEmail } from "@/lib/db";
import { UserProfile } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      role,
      companyName,
      phone,
      location,
      country,
      interests,
      categories,
      minPay,
      schedule,
      smsAlerts,
      uid,
    } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getUserByEmail(email);

    const newUser: UserProfile = {
      uid: uid || existing?.uid || "usr_" + Math.random().toString(36).substring(2, 10),
      email,
      name,
      role: role as "EMPLOYER" | "SEEKER",
      companyName: role === "EMPLOYER" ? companyName || existing?.companyName || "" : undefined,
      phone: phone || existing?.phone || "",
      location: location || existing?.location || "",
      country: country || existing?.country || "",
      interests: Array.isArray(interests)
        ? interests
        : Array.isArray(categories)
        ? categories
        : existing?.interests || [],
      categories: Array.isArray(categories)
        ? categories
        : Array.isArray(interests)
        ? interests
        : existing?.categories || [],
      minPay: minPay !== undefined ? Number(minPay) : existing?.minPay,
      schedule: schedule || existing?.schedule || "",
      smsAlerts: smsAlerts !== undefined ? Boolean(smsAlerts) : true,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    await saveUser(newUser);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
