import { extractJobRequirements, extractSkillsFromText, detectDomain } from "@/lib/ai-extraction";
import { analyzeResume } from "@/lib/analysis-engine";
import { authOptions } from "@/lib/auth";
import { transformToCategoryAnalysis } from "@/lib/category-transformer";
import { prisma } from "@/lib/db";
import { generateComprehensiveFeedback } from "@/lib/feedback-generator";
import { matchSkillsSimple, matchSkillsSemantically } from "@/lib/semantic-match";
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

  // Generate comprehensive feedback with category-structured data
  // We need to extract skill matches and job requirements for feedback generation
  const detectedDomain = analysis.domain || (await detectDomain(jobDescription));
  const [resumeSkills, jobRequirements] = await Promise.all([
    extractSkillsFromText(resumeText, "resume", detectedDomain),
    extractJobRequirements(jobDescription, detectedDomain),
  ]);

  const isSemanticMatchingEnabled = () =>
    (process.env.ENABLE_SEMANTIC_MATCHING ?? "true").toLowerCase() !== "false";

  const skillMatchResults = isSemanticMatchingEnabled()
    ? await matchSkillsSemantically(resumeSkills.all_skills, jobRequirements.all_required_skills)
    : matchSkillsSimple(resumeSkills.all_skills, jobRequirements.all_required_skills);

  const feedback = await generateComprehensiveFeedback({
    resumeText,
    jobDescription,
    domain: detectedDomain,
    skillMatches: skillMatchResults,
    jobRequirements,
  });

  // Transform to category analysis
  const categories = transformToCategoryAnalysis(feedback, analysis);

  // If user is signed in, persist Analysis with a placeholder Resume record
  const session = await getServerSession(authOptions);
  let analysisId: string | null = null;

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

    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        jobTitle,
        jobDesc: jobDescription,
        score: analysis.overallScore,
        keywords: analysis.matchedSkills.map((s) => s.skill),
        missing: analysis.missingSkills.map((s) => s.skill),
        suggestions: {
          bullets: analysis.suggestedBullets,
          categories: categories, // Store category data in suggestions JSON field
        },
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

    analysisId = savedAnalysis.id;
  }

  // Return analysis with categories
  return NextResponse.json({
    ...analysis,
    categories,
    analysisId, // Include analysis ID if saved
  });
}
