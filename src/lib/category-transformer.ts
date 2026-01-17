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
  ActionItem,
  CategoryId,
} from "./types/analysis";

// Category name mapping: full names -> short names
const CATEGORY_NAME_MAP: Record<string, CategoryId> = {
  matchOverview: "overview",
  requiredSkills: "skills",
  workExperience: "experience",
  educationCredentials: "education",
  impactAchievements: "impact",
  atsCompatibility: "ats",
  professionalQuality: "quality",
  // Also accept short names directly
  overview: "overview",
  skills: "skills",
  experience: "experience",
  education: "education",
  impact: "impact",
  ats: "ats",
  quality: "quality",
};

/**
 * Normalize action items category names
 */
function normalizeActionItems(actionItems: ActionItem[]): ActionItem[] {
  return actionItems.map((item) => ({
    ...item,
    category: CATEGORY_NAME_MAP[item.category] || item.category,
  }));
}

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
function calculateActionItemsCount(items: string[] | ActionItem[] | undefined): number {
  if (!items) return 0;
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
  const matchOverviewActionItems = normalizeActionItems(feedback.matchOverview?.actionItems || []);
  const matchOverview: MatchOverviewCategoryData = {
    score: analysis.overallScore,
    actionItemsCount:
      calculateActionItemsCount(matchOverviewActionItems) ||
      calculateActionItemsCount(
        feedback.matchOverview?.priorityActions || feedback.improvementAreas,
      ),
    actionItems: matchOverviewActionItems.length > 0 ? matchOverviewActionItems : [],
    topStrengths: feedback.matchOverview?.topStrengths || feedback.strengthAreas.slice(0, 5),
    topImprovements:
      feedback.matchOverview?.topImprovements || feedback.improvementAreas.slice(0, 5),
    priorityActions:
      feedback.matchOverview?.priorityActions || feedback.improvementAreas.slice(0, 5),
  };

  // Required Skills
  const requiredSkillsActionItems = normalizeActionItems(
    feedback.requiredSkills?.actionItems || [],
  );
  const requiredSkills: RequiredSkillsCategoryData = {
    score: analysis.scoreBreakdown.skills,
    actionItemsCount:
      calculateActionItemsCount(requiredSkillsActionItems) ||
      calculateActionItemsCount(feedback.requiredSkills?.skillGaps || []) +
        calculateActionItemsCount(feedback.requiredSkills?.missingCriticalSkills || []),
    actionItems: requiredSkillsActionItems.length > 0 ? requiredSkillsActionItems : [],
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    skillGaps: feedback.requiredSkills?.skillGaps || [],
    missingCriticalSkills: feedback.requiredSkills?.missingCriticalSkills || [],
  };

  // Work Experience
  const workExperienceActionItems = normalizeActionItems(
    feedback.workExperience?.actionItems || [],
  );
  const workExperience: WorkExperienceCategoryData = {
    score: analysis.scoreBreakdown.experienceMatch,
    actionItemsCount:
      calculateActionItemsCount(workExperienceActionItems) ||
      calculateActionItemsCount(feedback.workExperience?.experienceGaps || feedback.experienceGaps),
    actionItems: workExperienceActionItems.length > 0 ? workExperienceActionItems : [],
    durationAnalysis:
      feedback.workExperience?.durationAnalysis ||
      `Total years of experience: ${analysis.totalYearsExperience}`,
    relevantExperiences:
      feedback.workExperience?.relevantExperiences || feedback.relevantExperiences,
    experienceGaps: feedback.workExperience?.experienceGaps || feedback.experienceGaps,
  };

  // Education & Credentials
  const educationCredentialsActionItems = normalizeActionItems(
    feedback.educationCredentials?.actionItems || [],
  );
  const educationCredentials: EducationCredentialsCategoryData = {
    score: analysis.scoreBreakdown.education,
    actionItemsCount:
      calculateActionItemsCount(educationCredentialsActionItems) ||
      calculateActionItemsCount(feedback.educationCredentials?.missingCredentials || []),
    actionItems: educationCredentialsActionItems.length > 0 ? educationCredentialsActionItems : [],
    educationMatch:
      feedback.educationCredentials?.educationMatch ||
      "Education background assessment based on job requirements",
    missingCredentials: feedback.educationCredentials?.missingCredentials || [],
  };

  // Impact & Achievements
  const impactAchievementsActionItems = normalizeActionItems(
    feedback.impactAchievements?.actionItems || [],
  );
  const impactAchievements: ImpactAchievementsCategoryData = {
    score: analysis.scoreBreakdown.achievements,
    actionItemsCount:
      calculateActionItemsCount(impactAchievementsActionItems) ||
      calculateActionItemsCount(feedback.impactAchievements?.missingMetrics || []),
    actionItems: impactAchievementsActionItems.length > 0 ? impactAchievementsActionItems : [],
    currentAchievements: feedback.impactAchievements?.currentAchievements || [],
    missingMetrics: feedback.impactAchievements?.missingMetrics || [],
  };

  // ATS Compatibility
  const atsCompatibilityActionItems = normalizeActionItems(
    feedback.atsCompatibility?.actionItems || [],
  );
  const atsCompatibility: AtsCompatibilityCategoryData = {
    score: analysis.atsScore,
    actionItemsCount:
      calculateActionItemsCount(atsCompatibilityActionItems) ||
      calculateActionItemsCount(feedback.atsCompatibility?.atsIssues || []) +
        calculateActionItemsCount(feedback.atsCompatibility?.missingKeywords || []) +
        calculateActionItemsCount(feedback.atsCompatibility?.formattingProblems || []),
    actionItems: atsCompatibilityActionItems.length > 0 ? atsCompatibilityActionItems : [],
    atsIssues: feedback.atsCompatibility?.atsIssues || feedback.atsTips || [],
    missingKeywords: feedback.atsCompatibility?.missingKeywords || [],
    formattingProblems: feedback.atsCompatibility?.formattingProblems || [],
  };

  // Professional Quality
  const professionalQualityActionItems = normalizeActionItems(
    feedback.professionalQuality?.actionItems || [],
  );
  const professionalQuality: ProfessionalQualityCategoryData = {
    score: calculateProfessionalQualityScore(analysis.atsScore, feedback),
    actionItemsCount:
      calculateActionItemsCount(professionalQualityActionItems) ||
      calculateActionItemsCount(feedback.professionalQuality?.writingIssues || []) +
        calculateActionItemsCount(feedback.professionalQuality?.consistencyProblems || []) +
        calculateActionItemsCount(feedback.professionalQuality?.formattingConcerns || []),
    actionItems: professionalQualityActionItems.length > 0 ? professionalQualityActionItems : [],
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
