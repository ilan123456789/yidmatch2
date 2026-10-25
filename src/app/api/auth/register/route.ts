import { NextResponse } from "next/server";
import { saveUser, getUserByEmail } from "@/lib/db";
import { UserProfile } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, companyName, phone, location, uid } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const newUser: UserProfile = {
      uid: uid || "usr_" + Math.random().toString(36).substring(2, 10),
      email,
      name,
      role: role as "EMPLOYER" | "SEEKER",
      companyName: role === "EMPLOYER" ? companyName || "" : undefined,
      phone: phone || "",
      location: location || "",
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
