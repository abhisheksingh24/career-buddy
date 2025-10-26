import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the user's default portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id, isDefault: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "No portfolio found" }, { status: 404 });
    }

    // Get the most recent resume from the portfolio
    const resume = await prisma.resume.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { version: "desc" },
    });

    if (!resume) {
      return NextResponse.json({ error: "No resume found" }, { status: 404 });
    }

    return NextResponse.json({
      id: resume.id,
      name: resume.name,
      rawText: resume.rawText,
      fileType: resume.fileType,
      createdAt: resume.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch active resume:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
