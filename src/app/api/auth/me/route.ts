import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Missing uid parameter" }, { status: 400 });
  }

  const user = await getUserById(uid);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
