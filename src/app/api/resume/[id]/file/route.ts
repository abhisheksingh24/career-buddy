import { guard } from "@/lib/api-guard";
import { contentDisposition } from "@/lib/content-disposition";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { uploadsRoot } from "@/lib/uploads";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Await params in Next.js 15
  const { id } = await params;

  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

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
    if (resume.portfolio.userId !== userId) {
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
    const filePath = join(uploadsRoot(), resume.fileUrl);

    try {
      const fileBuffer = await readFile(filePath);

      // Return file with proper headers (including CORS for react-pdf)
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": contentDisposition(resume.name),
          "Cache-Control": "private, max-age=3600",
          "Accept-Ranges": "bytes", // Enable range requests for PDF.js
        },
      });
    } catch (fileError) {
      logError("Failed to read file", fileError);
      return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }
  } catch (error) {
    logError("Failed to serve resume file", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
