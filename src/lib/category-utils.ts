/**
 * Category Utilities
 * Helper functions for transforming category data between different formats
 */

import type { Category, CategoryId } from "@/components/category-navigation";
import {
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  FileCheck,
  FileText,
} from "lucide-react";

import type { CategoryAnalysisResponse } from "./types/analysis";

/**
 * Transform CategoryAnalysisResponse to Category[] format for navigation component
 *
 * @param categoryData - The category analysis response from the API
 * @returns Array of Category objects with id, name, icon, score, and actionItemsCount
 */
export function transformCategoriesToNavigation(
  categoryData: CategoryAnalysisResponse,
): Category[] {
  return [
    {
      id: "overview" as CategoryId,
      name: "Match Overview",
      icon: TrendingUp,
      score: categoryData.overview.score,
      actionItemsCount: categoryData.overview.actionItemsCount,
    },
    {
      id: "skills" as CategoryId,
      name: "Required Skills",
      icon: Target,
      score: categoryData.skills.score,
      actionItemsCount: categoryData.skills.actionItemsCount,
    },
    {
      id: "experience" as CategoryId,
      name: "Work Experience",
      icon: Briefcase,
      score: categoryData.experience.score,
      actionItemsCount: categoryData.experience.actionItemsCount,
    },
    {
      id: "education" as CategoryId,
      name: "Education & Credentials",
      icon: GraduationCap,
      score: categoryData.education.score,
      actionItemsCount: categoryData.education.actionItemsCount,
    },
    {
      id: "impact" as CategoryId,
      name: "Impact & Achievements",
      icon: Award,
      score: categoryData.impact.score,
      actionItemsCount: categoryData.impact.actionItemsCount,
    },
    {
      id: "ats" as CategoryId,
      name: "ATS Compatibility",
      icon: FileCheck,
      score: categoryData.ats.score,
      actionItemsCount: categoryData.ats.actionItemsCount,
    },
    {
      id: "quality" as CategoryId,
      name: "Professional Quality",
      icon: FileText,
      score: categoryData.quality.score,
      actionItemsCount: categoryData.quality.actionItemsCount,
    },
  ];
}

/**
 * Get category-specific data by category ID
 *
 * @param categoryData - The category analysis response from the API
 * @param categoryId - The category ID to get data for
 * @returns The category-specific data object, or null if not found
 */
export function getCategoryData(categoryData: CategoryAnalysisResponse, categoryId: CategoryId) {
  const categoryMap: Record<CategoryId, keyof CategoryAnalysisResponse> = {
    overview: "overview",
    skills: "skills",
    experience: "experience",
    education: "education",
    impact: "impact",
    ats: "ats",
    quality: "quality",
  };

  const key = categoryMap[categoryId];
  return key ? categoryData[key] : null;
}

/**
 * Get the total number of action items across all categories
 *
 * @param categoryData - The category analysis response from the API
 * @returns Total count of action items
 */
export function getTotalActionItemsCount(categoryData: CategoryAnalysisResponse): number {
  return (
    categoryData.overview.actionItemsCount +
    categoryData.skills.actionItemsCount +
    categoryData.experience.actionItemsCount +
    categoryData.education.actionItemsCount +
    categoryData.impact.actionItemsCount +
    categoryData.ats.actionItemsCount +
    categoryData.quality.actionItemsCount
  );
}

/**
 * Get categories sorted by score (lowest first - most need improvement)
 *
 * @param categoryData - The category analysis response from the API
 * @returns Array of Category objects sorted by score (ascending)
 */
export function getCategoriesSortedByScore(categoryData: CategoryAnalysisResponse): Category[] {
  const categories = transformCategoriesToNavigation(categoryData);
  return categories.sort((a, b) => a.score - b.score);
}

/**
 * Get categories with scores below a threshold
 *
 * @param categoryData - The category analysis response from the API
 * @param threshold - Score threshold (default: 60)
 * @returns Array of Category objects with scores below threshold
 */
export function getLowScoreCategories(
  categoryData: CategoryAnalysisResponse,
  threshold: number = 60,
): Category[] {
  const categories = transformCategoriesToNavigation(categoryData);
  return categories.filter((category) => category.score < threshold);
}
