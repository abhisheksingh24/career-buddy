/**
 * Category Transformer
 * Transforms ComprehensiveFeedback and EnhancedAnalysisResult into CategoryAnalysisResponse
 */

import type {
  ComprehensiveFeedback,
  EnhancedAnalysisResult,
  CategoryAnalysisResponse,
  MatchOverviewCategoryData,
  RequiredSkillsCategoryData,
  WorkExperienceCategoryData,
  EducationCredentialsCategoryData,
  ImpactAchievementsCategoryData,
  AtsCompatibilityCategoryData,
  ProfessionalQualityCategoryData,
} from "./types/analysis";

/**
 * Calculate Professional Quality score
 * Weighted: ATS score (70%) + writing quality heuristics (30%)
 */
function calculateProfessionalQualityScore(
  atsScore: number,
  feedback: ComprehensiveFeedback,
): number {
  const atsWeight = 0.7;
  const writingWeight = 0.3;

  // Writing quality heuristics based on feedback
  let writingScore = 100;
  if (feedback.professionalQuality?.writingIssues.length) {
    writingScore -= Math.min(30, feedback.professionalQuality.writingIssues.length * 5);
  }
  if (feedback.professionalQuality?.consistencyProblems.length) {
    writingScore -= Math.min(20, feedback.professionalQuality.consistencyProblems.length * 5);
  }
  if (feedback.professionalQuality?.formattingConcerns.length) {
    writingScore -= Math.min(20, feedback.professionalQuality.formattingConcerns.length * 5);
  }
  writingScore = Math.max(0, writingScore);

  const qualityScore = atsScore * atsWeight + writingScore * writingWeight;
  return Math.round(Math.max(0, Math.min(100, qualityScore)));
}

/**
 * Calculate action items count for a category
 */
function calculateActionItemsCount(items: string[]): number {
  return items.length;
}

/**
 * Transform ComprehensiveFeedback and EnhancedAnalysisResult into CategoryAnalysisResponse
 */
export function transformToCategoryAnalysis(
  feedback: ComprehensiveFeedback,
  analysis: EnhancedAnalysisResult,
): CategoryAnalysisResponse {
  // Match Overview
  const matchOverview: MatchOverviewCategoryData = {
    score: analysis.overallScore,
    actionItemsCount: calculateActionItemsCount(
      feedback.matchOverview?.priorityActions || feedback.improvementAreas,
    ),
    topStrengths: feedback.matchOverview?.topStrengths || feedback.strengthAreas.slice(0, 5),
    topImprovements:
      feedback.matchOverview?.topImprovements || feedback.improvementAreas.slice(0, 5),
    priorityActions:
      feedback.matchOverview?.priorityActions || feedback.improvementAreas.slice(0, 5),
  };

  // Required Skills
  const requiredSkills: RequiredSkillsCategoryData = {
    score: analysis.scoreBreakdown.skills,
    actionItemsCount:
      calculateActionItemsCount(feedback.requiredSkills?.skillGaps || []) +
      calculateActionItemsCount(feedback.requiredSkills?.missingCriticalSkills || []),
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    skillGaps: feedback.requiredSkills?.skillGaps || [],
    missingCriticalSkills: feedback.requiredSkills?.missingCriticalSkills || [],
  };

  // Work Experience
  const workExperience: WorkExperienceCategoryData = {
    score: analysis.scoreBreakdown.experienceMatch,
    actionItemsCount: calculateActionItemsCount(
      feedback.workExperience?.experienceGaps || feedback.experienceGaps,
    ),
    durationAnalysis:
      feedback.workExperience?.durationAnalysis ||
      `Total years of experience: ${analysis.totalYearsExperience}`,
    relevantExperiences:
      feedback.workExperience?.relevantExperiences || feedback.relevantExperiences,
    experienceGaps: feedback.workExperience?.experienceGaps || feedback.experienceGaps,
  };

  // Education & Credentials
  const educationCredentials: EducationCredentialsCategoryData = {
    score: analysis.scoreBreakdown.education,
    actionItemsCount: calculateActionItemsCount(
      feedback.educationCredentials?.missingCredentials || [],
    ),
    educationMatch:
      feedback.educationCredentials?.educationMatch ||
      "Education background assessment based on job requirements",
    missingCredentials: feedback.educationCredentials?.missingCredentials || [],
  };

  // Impact & Achievements
  const impactAchievements: ImpactAchievementsCategoryData = {
    score: analysis.scoreBreakdown.achievements,
    actionItemsCount: calculateActionItemsCount(feedback.impactAchievements?.missingMetrics || []),
    currentAchievements: feedback.impactAchievements?.currentAchievements || [],
    missingMetrics: feedback.impactAchievements?.missingMetrics || [],
  };

  // ATS Compatibility
  const atsCompatibility: AtsCompatibilityCategoryData = {
    score: analysis.atsScore,
    actionItemsCount:
      calculateActionItemsCount(feedback.atsCompatibility?.atsIssues || []) +
      calculateActionItemsCount(feedback.atsCompatibility?.missingKeywords || []) +
      calculateActionItemsCount(feedback.atsCompatibility?.formattingProblems || []),
    atsIssues: feedback.atsCompatibility?.atsIssues || feedback.atsTips || [],
    missingKeywords: feedback.atsCompatibility?.missingKeywords || [],
    formattingProblems: feedback.atsCompatibility?.formattingProblems || [],
  };

  // Professional Quality
  const professionalQuality: ProfessionalQualityCategoryData = {
    score: calculateProfessionalQualityScore(analysis.atsScore, feedback),
    actionItemsCount:
      calculateActionItemsCount(feedback.professionalQuality?.writingIssues || []) +
      calculateActionItemsCount(feedback.professionalQuality?.consistencyProblems || []) +
      calculateActionItemsCount(feedback.professionalQuality?.formattingConcerns || []),
    writingIssues: feedback.professionalQuality?.writingIssues || [],
    consistencyProblems: feedback.professionalQuality?.consistencyProblems || [],
    formattingConcerns: feedback.professionalQuality?.formattingConcerns || [],
  };

  return {
    overview: matchOverview,
    skills: requiredSkills,
    experience: workExperience,
    education: educationCredentials,
    impact: impactAchievements,
    ats: atsCompatibility,
    quality: professionalQuality,
  };
}
