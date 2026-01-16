import { authOptions } from "@/lib/auth";
import { transformToCategoryAnalysis } from "@/lib/category-transformer";
import { prisma } from "@/lib/db";
import type {
  CategoryAnalysisResponse,
  ComprehensiveFeedback,
  EnhancedAnalysisResult,
  SkillMatch,
} from "@/lib/types/analysis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // Await params in Next.js 15
    const { id: analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    // Fetch analysis from database
    const analysisRecord = await prisma.resumeAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        resume: {
          include: {
            portfolio: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!analysisRecord) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the analysis
    if (analysisRecord.resume.portfolio.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this analysis" },
        { status: 403 },
      );
    }

    // Check if category data exists in suggestions field
    const suggestions = analysisRecord.suggestions as {
      categories?: CategoryAnalysisResponse;
      bullets?: string[];
    } | null;

    if (suggestions?.categories) {
      // Return stored category data
      return NextResponse.json(suggestions.categories);
    }

    // Reconstruct category data from stored analysis fields (backward compatibility)
    // This handles old analyses that don't have category data stored
    const analysis: EnhancedAnalysisResult = {
      overallScore: analysisRecord.score || 0,
      atsScore: analysisRecord.atsScore || 0,
      domain: analysisRecord.domain || "Unknown",
      scoreBreakdown: {
        experienceMatch: 0, // Not stored, will need to reconstruct or use default
        skills: 0,
        education: 0,
        achievements: 0,
        ats: analysisRecord.atsScore || 0,
      },
      weights: {
        experienceMatch: 0.5,
        skills: 0.25,
        education: 0.15,
        achievements: 0.05,
        ats: 0.05,
      },
      totalYearsExperience: 0,
      matchedSkills: (analysisRecord.matchedSkills as SkillMatch[] | null) || [],
      missingSkills: (analysisRecord.missing || []).map((skill) => ({
        skill: typeof skill === "string" ? skill : skill.skill || skill,
        priority: "important" as const,
        category: "technical" as const,
      })),
      relevantExperiences: [],
      experienceGaps: analysisRecord.experienceGaps || [],
      strengthAreas: analysisRecord.strengthAreas || [],
      improvementAreas: analysisRecord.improvementAreas || [],
      atsTips: analysisRecord.atsTips || [],
      suggestedBullets: (suggestions?.bullets as string[]) || [],
      missingKeywords: analysisRecord.missing || [],
    };

    // Reconstruct feedback from stored data
    const feedback: ComprehensiveFeedback = {
      strengthAreas: analysisRecord.strengthAreas || [],
      improvementAreas: analysisRecord.improvementAreas || [],
      experienceGaps: analysisRecord.experienceGaps || [],
      relevantExperiences: [],
      atsTips: analysisRecord.atsTips || [],
      suggestedBullets: (suggestions?.bullets as string[]) || [],
    };

    // Transform to category analysis
    const categories = transformToCategoryAnalysis(feedback, analysis);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching category analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
