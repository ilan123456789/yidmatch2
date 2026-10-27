import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getApplications, createApplication, updateApplicationStatus, getJobById } from "@/lib/db";
import { JobApplication } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId") || undefined;
    const seekerId = searchParams.get("seekerId") || undefined;

    const applications = await getApplications({ jobId, seekerId });
    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let jobId = "";
    let seekerId = "";
    let seekerName = "";
    let seekerEmail = "";
    let seekerPhone = "";
    let coverNote = "";
    let resumeFile: File | null = null;
    let passedJobTitle = "";
    let passedCompanyName = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      jobId = (formData.get("jobId") as string) || "";
      seekerId = (formData.get("seekerId") as string) || "";
      seekerName = (formData.get("seekerName") as string) || "";
      seekerEmail = (formData.get("seekerEmail") as string) || "";
      seekerPhone = (formData.get("seekerPhone") as string) || "";
      coverNote = (formData.get("coverNote") as string) || "";
      resumeFile = formData.get("resume") as File | null;
      passedJobTitle = (formData.get("jobTitle") as string) || "";
      passedCompanyName = (formData.get("companyName") as string) || "";
    } else {
      const body = await req.json().catch(() => ({}));
      jobId = body.jobId ? String(body.jobId) : "";
      seekerId = body.seekerId ? String(body.seekerId) : "";
      seekerName = body.seekerName || "";
      seekerEmail = body.seekerEmail || "";
      seekerPhone = body.seekerPhone || "";
      coverNote = body.coverNote || "";
      passedJobTitle = body.jobTitle || "";
      passedCompanyName = body.companyName || "";
    }

    if (!jobId || !seekerName || !seekerEmail) {
      return NextResponse.json({ error: "Job ID, Name, and Email are required" }, { status: 400 });
    }

    const job = await getJobById(jobId);
    if (!job && !passedJobTitle) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const finalJobTitle = job?.title || passedJobTitle || "Community Job";
    const finalCompanyName = job?.company || passedCompanyName || "Hiring Employer";

    let resumeUrl = "/sample-resume.pdf";
    let resumeFileName = "Candidate_Resume.pdf";

    if (resumeFile && resumeFile.size > 0) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
        if (typeof fs !== "undefined" && fs.existsSync && fs.mkdirSync && fs.writeFileSync) {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const bytes = await resumeFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const safeName = `${Date.now()}_${resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const filePath = path.join(uploadDir, safeName);
          fs.writeFileSync(filePath, buffer);

          resumeUrl = `/uploads/resumes/${safeName}`;
          resumeFileName = resumeFile.name;
        } else {
          resumeUrl = "/sample-resume.pdf";
          resumeFileName = resumeFile.name;
        }
      } catch {
        resumeUrl = "/sample-resume.pdf";
        resumeFileName = resumeFile.name;
      }
    }

    const newApplication: JobApplication = {
      id: "app-" + Math.random().toString(36).substring(2, 10),
      jobId,
      jobTitle: finalJobTitle,
      companyName: finalCompanyName,
      seekerId: seekerId || "seeker-anon",
      seekerName,
      seekerEmail,
      seekerPhone: seekerPhone || "",
      resumeUrl,
      resumeFileName,
      coverNote,
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
    };

    await createApplication(newApplication);

    return NextResponse.json({ success: true, application: newApplication });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updated = await updateApplicationStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
