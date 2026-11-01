import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractText } from "@/lib/parse";
import {
  MAX_REQUEST_BYTES,
  MAX_UPLOAD_BYTES,
  MIME_BY_KIND,
  TOO_LARGE_MESSAGE,
  UNREADABLE_MESSAGE,
  UNSUPPORTED_MESSAGE,
  detectKind,
} from "@/lib/upload-validation";
import { getServerSession } from "next-auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reject oversized bodies before buffering them.
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: TOO_LARGE_MESSAGE }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: TOO_LARGE_MESSAGE }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name || "upload";
  const kind = detectKind(buffer, originalName);
  if (!kind) {
    return NextResponse.json({ error: UNSUPPORTED_MESSAGE }, { status: 415 });
  }
  const mimeType = MIME_BY_KIND[kind];

  let text: string;
  try {
    text = await extractText(buffer, kind);
  } catch {
    // Parser messages can echo file content; return a fixed message instead.
    return NextResponse.json({ error: UNREADABLE_MESSAGE }, { status: 422 });
  }

  // Get or create a default portfolio for the user
  let portfolio = await prisma.portfolio.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
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

  // Keep the original bytes (PDF/DOCX) in the database: no writable disk needed.
  const resume = await prisma.resume.create({
    data: {
      portfolioId: portfolio.id,
      version: nextVersion,
      name: originalName,
      content: {}, // Empty JSON for now - can be populated later with structured data
      rawText: text,
      fileType: mimeType,
      fileData: kind === "text" ? null : new Uint8Array(buffer),
    },
    select: { id: true },
  });

  return NextResponse.json({
    id: resume.id,
    originalName,
    mimeType,
    length: text.length,
  });
}
