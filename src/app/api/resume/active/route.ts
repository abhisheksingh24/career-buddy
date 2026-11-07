import { guard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  try {
    // Get the user's default portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId, isDefault: true },
    });

    // "No resume yet" is a normal state, not an error: answer 200 with null so
    // the browser console does not log a failed request on every page load.
    if (!portfolio) return NextResponse.json(null);

    // Get the most recent resume from the portfolio
    const resume = await prisma.resume.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { version: "desc" },
    });

    if (!resume) return NextResponse.json(null);

    return NextResponse.json({
      id: resume.id,
      name: resume.name,
      rawText: resume.rawText,
      fileType: resume.fileType,
      createdAt: resume.createdAt,
    });
  } catch (error) {
    logError("Failed to fetch active resume", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
