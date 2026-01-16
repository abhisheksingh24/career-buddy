import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Await params in Next.js 15
  const { id } = await params;

  // #region agent log
  const fs = await import("fs/promises");
  const logPath = "/Users/abhisheksingh/projects/career-buddy/.cursor/debug.log";
  await fs
    .appendFile(
      logPath,
      JSON.stringify({
        location: "api/resume/[id]/file/route.ts:GET",
        message: "File endpoint called",
        data: { resumeId: id },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "C",
      }) + "\n",
    )
    .catch(() => {});
  // #endregion
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // #region agent log
    await fs
      .appendFile(
        logPath,
        JSON.stringify({
          location: "api/resume/[id]/file/route.ts:GET",
          message: "Unauthorized access attempt",
          data: { resumeId: id },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "C",
        }) + "\n",
      )
      .catch(() => {});
    // #endregion
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch resume from database
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        portfolio: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Verify user owns the resume
    if (resume.portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if file exists
    if (!resume.fileUrl || resume.fileUrl.includes("::")) {
      // Placeholder fileUrl (text-only resume or old format)
      return NextResponse.json(
        { error: "PDF file not available for this resume" },
        { status: 404 },
      );
    }

    // Only serve PDF files
    if (resume.fileType !== "application/pdf") {
      return NextResponse.json({ error: "File type not supported for viewing" }, { status: 400 });
    }

    // Read file from storage
    const filePath = join(process.cwd(), "uploads", resume.fileUrl);
    // #region agent log
    const fs = await import("fs/promises");
    const logPath = "/Users/abhisheksingh/projects/career-buddy/.cursor/debug.log";
    await fs
      .appendFile(
        logPath,
        JSON.stringify({
          location: "api/resume/[id]/file/route.ts:readFile",
          message: "Attempting to read file",
          data: { filePath, fileUrl: resume.fileUrl, fileType: resume.fileType },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "C",
        }) + "\n",
      )
      .catch(() => {});
    // #endregion

    try {
      const fileBuffer = await readFile(filePath);
      // #region agent log
      await fs
        .appendFile(
          logPath,
          JSON.stringify({
            location: "api/resume/[id]/file/route.ts:readFile",
            message: "File read successful",
            data: { fileSize: fileBuffer.length },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }) + "\n",
        )
        .catch(() => {});
      // #endregion

      // Return file with proper headers (including CORS for react-pdf)
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${resume.name}"`,
          "Cache-Control": "private, max-age=3600",
          "Access-Control-Allow-Origin": "*", // Allow CORS for PDF.js
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type",
          "Accept-Ranges": "bytes", // Enable range requests for PDF.js
        },
      });
    } catch (fileError) {
      // #region agent log
      const fs = await import("fs/promises");
      const logPath = "/Users/abhisheksingh/projects/career-buddy/.cursor/debug.log";
      await fs
        .appendFile(
          logPath,
          JSON.stringify({
            location: "api/resume/[id]/file/route.ts:readFile",
            message: "File read error",
            data: {
              error: fileError instanceof Error ? fileError.message : String(fileError),
              filePath,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }) + "\n",
        )
        .catch(() => {});
      // #endregion
      console.error("Failed to read file:", fileError);
      return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to serve resume file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
