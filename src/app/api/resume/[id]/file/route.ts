import { authOptions } from "@/lib/auth";
import { contentDisposition } from "@/lib/content-disposition";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { uploadsRoot } from "@/lib/uploads";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { resolve, sep } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Await params in Next.js 15
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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
    const legacyPath = resume.fileUrl && !resume.fileUrl.includes("::") ? resume.fileUrl : null;
    if (!resume.fileData && !legacyPath) {
      // Text-only resume, or the old placeholder fileUrl
      return NextResponse.json(
        { error: "PDF file not available for this resume" },
        { status: 404 },
      );
    }

    // Only serve PDF files
    if (resume.fileType !== "application/pdf") {
      return NextResponse.json({ error: "File type not supported for viewing" }, { status: 400 });
    }

    try {
      // New uploads live in the database; older ones are on local disk.
      let fileBuffer: Uint8Array;
      if (resume.fileData) {
        fileBuffer = new Uint8Array(resume.fileData);
      } else {
        const root = resolve(uploadsRoot());
        const filePath = resolve(root, legacyPath as string);
        if (!filePath.startsWith(root + sep)) {
          return NextResponse.json({ error: "File not found on server" }, { status: 404 });
        }
        fileBuffer = new Uint8Array(await readFile(filePath));
      }

      // Return file with proper headers (including CORS for react-pdf)
      return new NextResponse(fileBuffer as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": contentDisposition(resume.name),
          "X-Content-Type-Options": "nosniff",
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
