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

export interface ComprehensiveFeedback {
  strengthAreas: string[];
  improvementAreas: string[];
  experienceGaps: string[];
  relevantExperiences: string[];
  atsTips: string[];
  suggestedBullets: string[];
}

export interface ScoreBreakdown {
  experienceRelevance: number; // 0-100 (40% weight for senior, 20% for entry)
  skills: number; // 0-100 (25% weight for senior, 30% for entry)
  experienceDuration: number; // 0-100 (15% weight)
  education: number; // 0-100 (10% weight for senior, 30% for entry)
  achievements: number; // 0-100 (5% weight for senior, 10% for entry)
  ats: number; // 0-100 (5% weight)
}

export interface ScoringWeights {
  experienceRelevance: number;
  skills: number;
  experienceDuration: number;
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
