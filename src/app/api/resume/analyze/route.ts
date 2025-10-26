import { analyzeResume } from "@/lib/analysis-engine";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const {
    resumeText = "",
    jobDescription = "",
    jobTitle = "",
    company = "",
    domain,
  } = body as {
    resumeText?: string;
    jobDescription?: string;
    jobTitle?: string;
    company?: string;
    domain?: string;
  };

  // Perform comprehensive analysis
  const analysis = await analyzeResume({
    resumeText,
    jobDescription,
    domain,
    jobTitle,
    company,
  });

  // If user is signed in, persist Analysis with a placeholder Resume record
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
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

    // Create a placeholder resume for pasted text analysis
    const resume = await prisma.resume.create({
      data: {
        portfolioId: portfolio.id,
        version: nextVersion,
        name: "pasted-resume",
        content: {}, // Empty JSON for now
        rawText: resumeText,
        fileType: "text/plain",
        fileUrl: `${session.user.id}::placeholder::${Date.now()}`,
      },
    });

    await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        jobTitle,
        jobDesc: jobDescription,
        score: analysis.overallScore,
        keywords: analysis.matchedSkills.map((s) => s.skill),
        missing: analysis.missingSkills.map((s) => s.skill),
        suggestions: { bullets: analysis.suggestedBullets },
        // Enhanced analysis fields
        domain: analysis.domain,
        atsScore: analysis.atsScore,
        matchedSkills: JSON.parse(JSON.stringify(analysis.matchedSkills)), // Convert to JSON
        experienceGaps: analysis.experienceGaps,
        strengthAreas: analysis.strengthAreas,
        improvementAreas: analysis.improvementAreas,
        atsTips: analysis.atsTips,
      },
    });
  }

  return NextResponse.json(analysis);
}
