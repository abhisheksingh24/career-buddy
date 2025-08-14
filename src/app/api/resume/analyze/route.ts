import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scoreMatch } from "@/lib/match";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const { resumeText = "", jobDescription = "" } = body as { resumeText?: string; jobDescription?: string };

  const { score, missingKeywords } = scoreMatch(resumeText, jobDescription);

  // If user is signed in, persist Analysis with a placeholder Resume record
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    // Upsert a single placeholder resume per user for now
    const resume = await prisma.resume.upsert({
      where: { storageKey: `${session.user.id}::placeholder` },
      update: {},
      create: {
        userId: session.user.id,
        originalName: "pasted-resume",
        mimeType: "text/plain",
        storageKey: `${session.user.id}::placeholder`,
        parsedText: resumeText,
      },
    });

    await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        jobDescription,
        score,
        missingKeywords,
        suggestionsJson: JSON.stringify([]),
      },
    });
  }

  return NextResponse.json({ score, missingKeywords });
}

