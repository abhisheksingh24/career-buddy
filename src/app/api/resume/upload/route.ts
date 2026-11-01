import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { guard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { extractTextFromFile } from "@/lib/parse";
import { uploadsRoot } from "@/lib/uploads";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = await extractTextFromFile(file);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to parse file",
        details: error instanceof Error ? error.message : "Unknown parsing error",
      },
      { status: 415 },
    );
  }
  const { text, mimeType, originalName } = parsed;

  // Save file to storage
  let filePath: string | null = null;
  try {
    // Only save PDF and DOCX files (not text-only resumes)
    if (mimeType === "application/pdf" || mimeType.includes("wordprocessingml")) {
      const uploadsDir = join(uploadsRoot(), "resumes");
      await mkdir(uploadsDir, { recursive: true });

      // Create unique filename: userId_timestamp_originalName
      const timestamp = Date.now();
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${userId}_${timestamp}_${sanitizedName}`;
      filePath = join(uploadsDir, fileName);

      // Get file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file to disk
      await writeFile(filePath, buffer);

      // Store relative path in database (for easier migration to cloud storage later)
      filePath = `resumes/${fileName}`;
    }
  } catch (error) {
    logError("Failed to save file", error);
    // Continue without file storage - text extraction still works
  }

  // Get or create a default portfolio for the user
  let portfolio = await prisma.portfolio.findFirst({
    where: { userId, isDefault: true },
  });

  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: "Default Portfolio",
        isDefault: true,
      },
    });
  }

  // Get the next version number for this portfolio
  const lastResume = await prisma.resume.findFirst({
    where: { portfolioId: portfolio.id },
    orderBy: { version: "desc" },
  });
  const nextVersion = (lastResume?.version || 0) + 1;

  const resume = await prisma.resume.create({
    data: {
      portfolioId: portfolio.id,
      version: nextVersion,
      name: originalName,
      content: {}, // Empty JSON for now - can be populated later with structured data
      rawText: text,
      fileType: mimeType,
      fileUrl: filePath || `${userId}::${Date.now()}::${originalName}`, // Store file path or placeholder
    },
  });

  return NextResponse.json({
    id: resume.id,
    originalName,
    mimeType,
    length: text.length,
    fileUrl: resume.fileUrl,
  });
}
