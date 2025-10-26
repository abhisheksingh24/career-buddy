/**
 * Comprehensive Analysis Engine
 * Orchestrates the entire resume analysis process
 */

import { extractSkillsFromText, extractJobRequirements, detectDomain } from "./ai-extraction";
import { generateComprehensiveFeedback } from "./feedback-generator";
import { matchSkillsSemantically, matchSkillsSimple } from "./semantic-match";
import type { EnhancedAnalysisResult, SkillMatch, SkillGap } from "./types/analysis";

function isMockMode(): boolean {
  return (process.env.MOCK_AI_SUGGESTIONS ?? "false").toLowerCase() === "true";
}

function isSemanticMatchingEnabled(): boolean {
  return (process.env.ENABLE_SEMANTIC_MATCHING ?? "true").toLowerCase() === "true";
}

/**
 * Calculate weighted score based on skill matches
 */
function calculateWeightedScore(
  skillMatches: Array<{ relevance: "high" | "medium" | "low" }>,
  totalRequiredSkills: number,
): number {
  if (totalRequiredSkills === 0) return 0;

  const weights = { high: 1.0, medium: 0.6, low: 0.3 };

  const weightedMatches = skillMatches.reduce((sum, match) => {
    return sum + weights[match.relevance];
  }, 0);

  const score = (weightedMatches / totalRequiredSkills) * 100;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate ATS optimization score
 */
function calculateATSScore(
  resumeText: string,
  jobRequirements: { required_skills: string[]; experience_requirements: string[] },
): number {
  let score = 100;
  const resumeLower = resumeText.toLowerCase();

  // Check for standard sections
  const hasSections = {
    experience: /experience|work history|employment/i.test(resumeText),
    education: /education|academic|degree/i.test(resumeText),
    skills: /skills|technical skills|competencies/i.test(resumeText),
  };

  if (!hasSections.experience) score -= 15;
  if (!hasSections.education) score -= 10;
  if (!hasSections.skills) score -= 15;

  // Check for keyword presence
  const keywordMatches = jobRequirements.required_skills.filter((skill) =>
    resumeLower.includes(skill.toLowerCase()),
  ).length;

  const keywordScore = (keywordMatches / Math.max(1, jobRequirements.required_skills.length)) * 40;
  score = Math.min(100, score - 40 + keywordScore);

  // Check for formatting issues
  if (resumeText.length < 500) score -= 10; // Too short
  if (resumeText.length > 5000) score -= 5; // Might be too long

  return Math.max(0, Math.round(score));
}

/**
 * Convert skill matches to SkillMatch format
 */
function convertToSkillMatches(
  matches: Array<{ resumeSkill: string; relevance: "high" | "medium" | "low" }>,
): SkillMatch[] {
  return matches.map((match) => ({
    skill: match.resumeSkill,
    relevance: match.relevance,
    source: "resume" as const,
  }));
}

/**
 * Identify missing skills and categorize by priority
 */
function identifyMissingSkills(
  jobRequirements: { required_skills: string[]; preferred_skills: string[] },
  skillMatches: Array<{ jobSkill: string; relevance: "high" | "medium" | "low" }>,
): SkillGap[] {
  const matchedJobSkills = new Set(
    skillMatches.filter((m) => m.relevance !== "low").map((m) => m.jobSkill.toLowerCase()),
  );

  const missingSkills: SkillGap[] = [];

  // Required skills that are missing are critical
  jobRequirements.required_skills.forEach((skill) => {
    if (!matchedJobSkills.has(skill.toLowerCase())) {
      missingSkills.push({
        skill,
        priority: "critical",
        category: categorizeSkill(skill),
      });
    }
  });

  // Preferred skills that are missing are nice-to-have
  jobRequirements.preferred_skills.forEach((skill) => {
    if (!matchedJobSkills.has(skill.toLowerCase())) {
      missingSkills.push({
        skill,
        priority: "nice-to-have",
        category: categorizeSkill(skill),
      });
    }
  });

  return missingSkills;
}

/**
 * Categorize a skill into technical, soft, certification, or tool
 */
function categorizeSkill(skill: string): "technical" | "soft" | "certification" | "tool" {
  const skillLower = skill.toLowerCase();

  // Soft skills keywords
  const softSkillsKeywords = [
    "leadership",
    "communication",
    "teamwork",
    "problem",
    "analytical",
    "creative",
    "management",
  ];
  if (softSkillsKeywords.some((keyword) => skillLower.includes(keyword))) {
    return "soft";
  }

  // Certification keywords
  const certKeywords = ["certified", "certification", "degree", "bachelor", "master", "phd"];
  if (certKeywords.some((keyword) => skillLower.includes(keyword))) {
    return "certification";
  }

  // Tool keywords (software, platforms)
  const toolKeywords = ["software", "platform", "tool", "system", "application"];
  if (toolKeywords.some((keyword) => skillLower.includes(keyword))) {
    return "tool";
  }

  // Default to technical
  return "technical";
}

/**
 * Main analysis function
 */
export async function analyzeResume(params: {
  resumeText: string;
  jobDescription: string;
  domain?: string;
  jobTitle?: string;
  company?: string;
}): Promise<EnhancedAnalysisResult> {
  if (isMockMode()) {
    return getMockEnhancedAnalysis(params);
  }

  try {
    // Step 1: Detect or use provided domain
    const domain = params.domain || (await detectDomain(params.jobDescription));

    // Step 2: Extract skills from both texts
    const [resumeSkills, jobRequirements] = await Promise.all([
      extractSkillsFromText(params.resumeText, "resume", domain),
      extractJobRequirements(params.jobDescription, domain),
    ]);

    // Step 3: Perform semantic or simple matching
    const skillMatchResults = isSemanticMatchingEnabled()
      ? await matchSkillsSemantically(resumeSkills.all_skills, jobRequirements.all_required_skills)
      : matchSkillsSimple(resumeSkills.all_skills, jobRequirements.all_required_skills);

    // Step 4: Calculate scores
    const overallScore = calculateWeightedScore(
      skillMatchResults,
      jobRequirements.all_required_skills.length,
    );
    const atsScore = calculateATSScore(params.resumeText, jobRequirements);

    // Step 5: Convert matches and identify gaps
    const matchedSkills = convertToSkillMatches(skillMatchResults);
    const missingSkills = identifyMissingSkills(jobRequirements, skillMatchResults);

    // Step 6: Generate comprehensive feedback
    const feedback = await generateComprehensiveFeedback({
      resumeText: params.resumeText,
      jobDescription: params.jobDescription,
      domain,
      skillMatches: skillMatchResults,
      jobRequirements,
    });

    return {
      overallScore,
      atsScore,
      domain,
      matchedSkills,
      missingSkills,
      relevantExperiences: feedback.relevantExperiences,
      experienceGaps: feedback.experienceGaps,
      strengthAreas: feedback.strengthAreas,
      improvementAreas: feedback.improvementAreas,
      atsTips: feedback.atsTips,
      suggestedBullets: feedback.suggestedBullets,
      missingKeywords: missingSkills.map((s) => s.skill), // Legacy field
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    return getMockEnhancedAnalysis(params);
  }
}

/**
 * Mock analysis for development
 */
function getMockEnhancedAnalysis(params: {
  resumeText: string;
  jobDescription: string;
  domain?: string;
}): EnhancedAnalysisResult {
  const domain = params.domain || "Software Engineering";

  return {
    overallScore: 72,
    atsScore: 85,
    domain,
    matchedSkills: [
      { skill: "React", relevance: "high", source: "resume" },
      { skill: "TypeScript", relevance: "high", source: "resume" },
      { skill: "Leadership", relevance: "high", source: "resume" },
      { skill: "Problem Solving", relevance: "medium", source: "resume" },
      { skill: "Node.js", relevance: "medium", source: "resume" },
    ],
    missingSkills: [
      { skill: "AWS", priority: "critical", category: "technical" },
      { skill: "Docker", priority: "important", category: "tool" },
      { skill: "GraphQL", priority: "nice-to-have", category: "technical" },
    ],
    relevantExperiences: [
      "Led TypeScript migration project - directly relevant to role requirements",
      "Experience with React and modern web development aligns well",
      "Demonstrated leadership through team management and mentorship",
      "Strong track record of delivering projects on time",
    ],
    experienceGaps: [
      "No explicit mention of cloud platform experience (AWS/Azure/GCP)",
      "Limited evidence of experience with CI/CD pipelines",
      "Missing specific examples of cross-functional collaboration",
    ],
    strengthAreas: [
      "Strong technical foundation with demonstrated hands-on experience",
      "Excellent track record of leading teams and mentoring developers",
      "Clear evidence of problem-solving skills with quantifiable impact",
      "Good balance of technical and soft skills relevant to the role",
    ],
    improvementAreas: [
      "Add more specific metrics to quantify achievements",
      "Highlight experience with modern tools mentioned in the job description",
      "Expand on leadership experiences to align with senior-level expectations",
    ],
    atsTips: [
      "Add a 'Technical Skills' section with explicit keywords: React, TypeScript, Node.js",
      "Include the exact job title or similar variations in your resume",
      "Use standard section headers: 'Experience', 'Education', 'Skills'",
      "Spell out acronyms on first use (e.g., 'CI/CD')",
      "Include years of experience prominently",
      "Use bullet points instead of paragraphs for better readability",
    ],
    suggestedBullets: [
      "Led a team of 5 developers in migrating a legacy application to React and TypeScript, resulting in 40% faster load times",
      "Architected and implemented microservices using Node.js and Docker, reducing deployment time by 60%",
      "Mentored 3 junior developers through code reviews and pair programming, resulting in 2 promotions within 12 months",
      "Collaborated with product managers to deliver 15+ features, maintaining 98% on-time delivery rate",
      "Implemented testing strategy using Jest, achieving 85% code coverage and reducing production bugs by 50%",
    ],
    missingKeywords: ["AWS", "Docker", "GraphQL"], // Legacy field
  };
}
