/**
 * Enhanced Analysis Types for Domain-Agnostic Resume Analysis
 */

export interface SkillMatch {
  skill: string;
  relevance: "high" | "medium" | "low";
  source: "resume" | "job_description";
}

export interface SkillGap {
  skill: string;
  priority: "critical" | "important" | "nice-to-have";
  category: "technical" | "soft" | "certification" | "tool";
}

export interface ExtractedSkills {
  technical_skills: string[];
  soft_skills: string[];
  tools: string[];
  certifications: string[];
  domain_keywords: string[];
  all_skills: string[]; // Combined list for matching
}

export interface JobRequirements {
  required_skills: string[];
  preferred_skills: string[];
  experience_requirements: string[];
  all_required_skills: string[]; // Combined for matching
}

export interface SkillMatchResult {
  resumeSkill: string;
  jobSkill: string;
  similarity: number;
  relevance: "high" | "medium" | "low";
}

// Category-specific data structures
export interface MatchOverviewData {
  topStrengths: string[];
  topImprovements: string[];
  priorityActions: string[];
}

export interface RequiredSkillsData {
  skillGaps: string[];
  missingCriticalSkills: string[];
}

export interface WorkExperienceData {
  durationAnalysis: string;
  relevantExperiences: string[];
  experienceGaps: string[];
}

export interface EducationCredentialsData {
  educationMatch: string;
  missingCredentials: string[];
}

export interface ImpactAchievementsData {
  currentAchievements: string[];
  missingMetrics: string[];
}

export interface AtsCompatibilityData {
  atsIssues: string[];
  missingKeywords: string[];
  formattingProblems: string[];
}

export interface ProfessionalQualityData {
  writingIssues: string[];
  consistencyProblems: string[];
  formattingConcerns: string[];
}

export interface ComprehensiveFeedback {
  // Existing fields (kept for backward compatibility)
  strengthAreas: string[];
  improvementAreas: string[];
  experienceGaps: string[];
  relevantExperiences: string[];
  atsTips: string[];
  suggestedBullets: string[];

  // New category-structured fields
  matchOverview?: MatchOverviewData;
  requiredSkills?: RequiredSkillsData;
  workExperience?: WorkExperienceData;
  educationCredentials?: EducationCredentialsData;
  impactAchievements?: ImpactAchievementsData;
  atsCompatibility?: AtsCompatibilityData;
  professionalQuality?: ProfessionalQualityData;
}

export interface ScoreBreakdown {
  experienceMatch: number; // 0-100 (50% weight) - combines relevance + duration
  skills: number; // 0-100 (25% weight)
  education: number; // 0-100 (15% weight)
  achievements: number; // 0-100 (5% weight)
  ats: number; // 0-100 (5% weight)
}

export interface ScoringWeights {
  experienceMatch: number;
  skills: number;
  education: number;
  achievements: number;
  ats: number;
}

export interface EnhancedAnalysisResult {
  // Core scoring
  overallScore: number; // 0-100 overall match
  atsScore: number; // 0-100 ATS optimization score
  domain: string; // Detected/provided job domain

  // Comprehensive scoring breakdown
  scoreBreakdown: ScoreBreakdown;
  weights: ScoringWeights;
  totalYearsExperience: number; // Calculated from resume

  // Skill analysis
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];

  // Experience analysis
  relevantExperiences: string[]; // Which resume sections align well
  experienceGaps: string[]; // What experience is missing

  // Strengths and improvements
  strengthAreas: string[]; // 3-5 key strengths
  improvementAreas: string[]; // 3-5 areas to improve

  // ATS optimization
  atsTips: string[]; // 5-7 specific ATS improvements

  // Actionable suggestions
  suggestedBullets: string[]; // 5-8 rewritten bullet points

  // Legacy fields (for backward compatibility)
  missingKeywords: string[]; // Deprecated but kept for now
}

// Category Analysis Response Types
export interface CategoryData {
  score: number; // 0-100
  actionItemsCount: number;
}

export interface MatchOverviewCategoryData extends CategoryData {
  topStrengths: string[];
  topImprovements: string[];
  priorityActions: string[];
}

export interface RequiredSkillsCategoryData extends CategoryData {
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  skillGaps: string[];
  missingCriticalSkills: string[];
}

export interface WorkExperienceCategoryData extends CategoryData {
  durationAnalysis: string;
  relevantExperiences: string[];
  experienceGaps: string[];
}

export interface EducationCredentialsCategoryData extends CategoryData {
  educationMatch: string;
  missingCredentials: string[];
}

export interface ImpactAchievementsCategoryData extends CategoryData {
  currentAchievements: string[];
  missingMetrics: string[];
}

export interface AtsCompatibilityCategoryData extends CategoryData {
  atsIssues: string[];
  missingKeywords: string[];
  formattingProblems: string[];
}

export interface ProfessionalQualityCategoryData extends CategoryData {
  writingIssues: string[];
  consistencyProblems: string[];
  formattingConcerns: string[];
}

export interface CategoryAnalysisResponse {
  overview: MatchOverviewCategoryData;
  skills: RequiredSkillsCategoryData;
  experience: WorkExperienceCategoryData;
  education: EducationCredentialsCategoryData;
  impact: ImpactAchievementsCategoryData;
  ats: AtsCompatibilityCategoryData;
  quality: ProfessionalQualityCategoryData;
}
