import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTextFromFile } from "@/lib/parse";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = await extractTextFromFile(file);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to parse file", details: String(error?.message ?? error) }, { status: 415 });
  }
  const { text, mimeType, originalName } = parsed;

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      originalName,
      mimeType,
      parsedText: text,
      storageKey: `${session.user.id}::${Date.now()}::${originalName}`,
    },
  });

  return NextResponse.json({ id: resume.id, originalName, mimeType, length: text.length });
}

