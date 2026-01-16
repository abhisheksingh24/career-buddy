"use client";

import { type CategoryId, type Category } from "@/components/category-navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CategoryAnalysisResponse,
  RequiredSkillsCategoryData,
  EducationCredentialsCategoryData,
  EnhancedAnalysisResult,
} from "@/lib/types/analysis";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  FileCheck,
  FileText,
  AlertCircle,
} from "lucide-react";

interface CategoryDetailsPanelProps {
  selectedCategory: Category | null;
  categoryData?: CategoryAnalysisResponse | null; // Full category data from API
  allCategories?: Category[]; // All categories for score breakdown (Match Overview)
  analysisResult?: EnhancedAnalysisResult | null; // Full analysis result for accessing atsTips and suggestedBullets
  onCategorySelect?: (categoryId: CategoryId) => void; // Callback for category navigation
  isLoading?: boolean;
}

const getCategoryIcon = (categoryId: CategoryId | null) => {
  if (!categoryId) return null;
  const icons = {
    overview: TrendingUp,
    skills: Target,
    experience: Briefcase,
    education: GraduationCap,
    impact: Award,
    ats: FileCheck,
    quality: FileText,
  };
  return icons[categoryId];
};

const getCategoryDescription = (categoryId: CategoryId | null): string => {
  if (!categoryId) return "";
  const descriptions = {
    overview:
      "Get an overall view of how well your resume matches the job requirements and identify key areas for improvement.",
    skills:
      "See which required skills you have and which ones are missing. Understand skill gaps and how to address them.",
    experience:
      "Analyze your work experience relevance, duration, and alignment with the job requirements.",
    education:
      "Review how your education and credentials match the job requirements and identify any missing qualifications.",
    impact:
      "Evaluate your achievements and impact metrics. Learn how to quantify your accomplishments effectively.",
    ats: "Check your resume's compatibility with Applicant Tracking Systems and optimize for better parsing.",
    quality:
      "Assess the professional quality of your resume including formatting, clarity, and best practices.",
  };
  return descriptions[categoryId];
};

const getPlaceholderContent = (categoryId: CategoryId | null) => {
  if (!categoryId) return null;

  const placeholders = {
    overview: {
      title: "Match Overview",
      sections: [
        {
          title: "Overall Match Score",
          content: "Your overall resume match score will appear here.",
        },
        {
          title: "Top Strengths",
          content: "Key strengths that align with the job requirements will be highlighted here.",
        },
        {
          title: "Priority Improvements",
          content: "Most important areas to improve will be listed here.",
        },
      ],
    },
    skills: {
      title: "Required Skills Analysis",
      sections: [
        {
          title: "Matched Skills",
          content: "Skills from your resume that match the job requirements will be listed here.",
        },
        {
          title: "Missing Skills",
          content: "Required skills that are not present in your resume will be identified here.",
        },
        {
          title: "Skill Gaps",
          content: "Analysis of skill gaps and recommendations will appear here.",
        },
      ],
    },
    experience: {
      title: "Work Experience Analysis",
      sections: [
        {
          title: "Relevant Experience",
          content: "Your work experiences that align with the job will be highlighted here.",
        },
        {
          title: "Experience Gaps",
          content:
            "Areas where your experience may not fully match requirements will be identified.",
        },
        {
          title: "Duration Analysis",
          content: "Analysis of your work experience duration and relevance will appear here.",
        },
      ],
    },
    education: {
      title: "Education & Credentials",
      sections: [
        {
          title: "Education Match",
          content: "How your education aligns with job requirements will be shown here.",
        },
        {
          title: "Missing Credentials",
          content: "Any required credentials or certifications that are missing will be listed.",
        },
        {
          title: "Recommendations",
          content: "Suggestions for improving your education section will appear here.",
        },
      ],
    },
    impact: {
      title: "Impact & Achievements",
      sections: [
        {
          title: "Current Achievements",
          content: "Your quantified achievements and impact metrics will be displayed here.",
        },
        {
          title: "Missing Metrics",
          content: "Areas where you could add more quantifiable achievements will be identified.",
        },
        {
          title: "Improvement Suggestions",
          content: "Recommendations for strengthening your achievements section will appear here.",
        },
      ],
    },
    ats: {
      title: "ATS Compatibility",
      sections: [
        {
          title: "ATS Score",
          content: "Your resume's ATS compatibility score will be displayed here.",
        },
        {
          title: "Parsing Issues",
          content: "Any issues that might affect ATS parsing will be identified here.",
        },
        {
          title: "Optimization Tips",
          content: "Recommendations for improving ATS compatibility will appear here.",
        },
      ],
    },
    quality: {
      title: "Professional Quality",
      sections: [
        {
          title: "Formatting & Structure",
          content: "Analysis of your resume's formatting and structure will appear here.",
        },
        {
          title: "Clarity & Readability",
          content: "Assessment of your resume's clarity and readability will be shown here.",
        },
        {
          title: "Best Practices",
          content: "Recommendations based on industry best practices will appear here.",
        },
      ],
    },
  };

  return placeholders[categoryId];
};

export function CategoryDetailsPanel({
  selectedCategory,
  categoryData,
  allCategories,
  analysisResult,
  onCategorySelect,
  isLoading = false,
}: CategoryDetailsPanelProps) {
  // Empty state - no category selected
  if (!selectedCategory && !isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Interactive Resume Analysis</h1>
          <p className="text-gray-600">
            Select a category from the left panel to view detailed analysis and improvement
            suggestions.
          </p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Category Selected</h3>
              <p className="text-gray-500">
                Choose a category from the left panel to begin analyzing your resume.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category selected - show content
  const Icon = getCategoryIcon(selectedCategory.id);
  const placeholder = getPlaceholderContent(selectedCategory.id);
  const description = getCategoryDescription(selectedCategory.id);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper function to render suggestions list
  const renderSuggestionsList = (suggestions: string[], icon?: "check" | "arrow" | "lightbulb") => {
    if (!suggestions || suggestions.length === 0) {
      return <p className="text-gray-500 text-sm italic">No suggestions available.</p>;
    }
    return (
      <ol className="space-y-3 list-none">
        {suggestions.map((suggestion, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold mt-0.5">
              {idx + 1}
            </span>
            <span className="text-gray-700 text-sm flex-1">{suggestion}</span>
          </li>
        ))}
      </ol>
    );
  };

  // Get full category data if available
  const getFullCategoryData = () => {
    if (!categoryData || !selectedCategory) return null;

    const categoryMap: Record<CategoryId, keyof CategoryAnalysisResponse> = {
      overview: "overview",
      skills: "skills",
      experience: "experience",
      education: "education",
      impact: "impact",
      ats: "ats",
      quality: "quality",
    };

    const key = categoryMap[selectedCategory.id];
    return key ? categoryData[key] : null;
  };

  const fullCategoryData = getFullCategoryData();
  const hasRealData = fullCategoryData !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7 text-gray-700" />}
          <h1 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h1>
        </div>
        <p className="text-gray-600">{description}</p>

        {/* Score Display - Enhanced for Match Overview, standard for others */}
        {selectedCategory.id === "overview" ? (
          <div className="pt-4">
            {/* Large Prominent Score for Match Overview */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "text-7xl font-bold",
                    getScoreColor(selectedCategory.score).split(" ")[0],
                  )}
                >
                  {selectedCategory.score}
                </div>
                <div className="text-sm text-gray-500 mt-1">Overall Match</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Match Score</span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      getScoreColor(selectedCategory.score).split(" ")[0],
                    )}
                  >
                    {selectedCategory.score}%
                  </span>
                </div>
                <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      getProgressColor(selectedCategory.score),
                    )}
                    style={{ width: `${selectedCategory.score}%` }}
                  />
                </div>
              </div>
            </div>
            {selectedCategory.actionItemsCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {selectedCategory.actionItemsCount} improvement
                {selectedCategory.actionItemsCount !== 1 ? "s" : ""} available
              </Badge>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-base font-semibold px-3 py-1",
                  getScoreColor(selectedCategory.score),
                )}
              >
                Score: {selectedCategory.score}%
              </Badge>
              {selectedCategory.actionItemsCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {selectedCategory.actionItemsCount} improvement
                  {selectedCategory.actionItemsCount !== 1 ? "s" : ""} available
                </Badge>
              )}
            </div>
            {/* Progress Bar for other categories */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span
                  className={cn(
                    "font-semibold",
                    getScoreColor(selectedCategory.score).split(" ")[0],
                  )}
                >
                  {selectedCategory.score}%
                </span>
              </div>
              <div className="relative h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    getProgressColor(selectedCategory.score),
                  )}
                  style={{ width: `${selectedCategory.score}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Data Content (if available) */}
      {hasRealData && (
        <div className="space-y-4">
          {selectedCategory.id === "overview" && fullCategoryData && (
            <div className="space-y-4">
              {/* Score Breakdown - All 7 Categories with Mini Progress Bars */}
              {allCategories && allCategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allCategories.map((category) => {
                        const CategoryIcon = getCategoryIcon(category.id);
                        return (
                          <div
                            key={category.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (onCategorySelect) {
                                onCategorySelect(category.id);
                              }
                            }}
                          >
                            {CategoryIcon && (
                              <CategoryIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {category.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-sm font-semibold ml-2 flex-shrink-0",
                                    getScoreColor(category.score).split(" ")[0],
                                  )}
                                >
                                  {category.score}%
                                </span>
                              </div>
                              <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    getProgressColor(category.score),
                                  )}
                                  style={{ width: `${category.score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {"topStrengths" in fullCategoryData && fullCategoryData.topStrengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {fullCategoryData.topStrengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {"topImprovements" in fullCategoryData &&
                fullCategoryData.topImprovements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.topImprovements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">⚠</span>
                            <span className="text-gray-700">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              {"priorityActions" in fullCategoryData &&
                fullCategoryData.priorityActions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Priority Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.priorityActions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">→</span>
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          {selectedCategory.id === "skills" && fullCategoryData && (
            <div className="space-y-4">
              {/* Matched Skills - Grouped by Relevance */}
              {"matchedSkills" in fullCategoryData && fullCategoryData.matchedSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Matched Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const skillsData =
                        fullCategoryData.matchedSkills as RequiredSkillsCategoryData["matchedSkills"];
                      const highRelevance = skillsData.filter((s) => s.relevance === "high");
                      const mediumRelevance = skillsData.filter((s) => s.relevance === "medium");
                      const lowRelevance = skillsData.filter((s) => s.relevance === "low");

                      return (
                        <>
                          {highRelevance.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  High Relevance
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  ({highRelevance.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {highRelevance.map((skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-300"
                                  >
                                    {skill.skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {mediumRelevance.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Medium Relevance
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  ({mediumRelevance.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {mediumRelevance.map((skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-300"
                                  >
                                    {skill.skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {lowRelevance.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                  Low Relevance
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  ({lowRelevance.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {lowRelevance.map((skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-gray-50 text-gray-700 border-gray-300"
                                  >
                                    {skill.skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Missing Skills - Grouped by Priority */}
              {"missingSkills" in fullCategoryData && fullCategoryData.missingSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Missing Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const missingSkillsData =
                        fullCategoryData.missingSkills as RequiredSkillsCategoryData["missingSkills"];
                      const critical = missingSkillsData.filter((s) => s.priority === "critical");
                      const important = missingSkillsData.filter((s) => s.priority === "important");
                      const niceToHave = missingSkillsData.filter(
                        (s) => s.priority === "nice-to-have",
                      );

                      return (
                        <>
                          {critical.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  Critical
                                </Badge>
                                <span className="text-xs text-gray-500">({critical.length})</span>
                              </div>
                              <ul className="space-y-2">
                                {critical.map((skill, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-1">✗</span>
                                    <span className="text-gray-700">{skill.skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {important.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                  Important
                                </Badge>
                                <span className="text-xs text-gray-500">({important.length})</span>
                              </div>
                              <ul className="space-y-2">
                                {important.map((skill, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-orange-600 mt-1">⚠</span>
                                    <span className="text-gray-700">{skill.skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {niceToHave.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Nice to Have
                                </Badge>
                                <span className="text-xs text-gray-500">({niceToHave.length})</span>
                              </div>
                              <ul className="space-y-2">
                                {niceToHave.map((skill, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-yellow-600 mt-1">•</span>
                                    <span className="text-gray-700">{skill.skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Skill Categories Breakdown */}
              {"missingSkills" in fullCategoryData && fullCategoryData.missingSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skill Categories Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const missingSkillsData =
                        fullCategoryData.missingSkills as RequiredSkillsCategoryData["missingSkills"];
                      const technical = missingSkillsData.filter((s) => s.category === "technical");
                      const soft = missingSkillsData.filter((s) => s.category === "soft");
                      const tools = missingSkillsData.filter((s) => s.category === "tool");
                      const certifications = missingSkillsData.filter(
                        (s) => s.category === "certification",
                      );

                      // Also count matched skills by category if available
                      const matchedSkillsData =
                        fullCategoryData.matchedSkills as RequiredSkillsCategoryData["matchedSkills"];
                      // Note: matchedSkills don't have category field, so we'll focus on missing skills

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {technical.length > 0 && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-blue-900">
                                  Technical Skills
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-800 border-blue-300"
                                >
                                  {technical.length}
                                </Badge>
                              </div>
                              <p className="text-xs text-blue-700">Missing technical skills</p>
                            </div>
                          )}
                          {soft.length > 0 && (
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-purple-900">
                                  Soft Skills
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-300"
                                >
                                  {soft.length}
                                </Badge>
                              </div>
                              <p className="text-xs text-purple-700">Missing soft skills</p>
                            </div>
                          )}
                          {tools.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-green-900">Tools</span>
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 border-green-300"
                                >
                                  {tools.length}
                                </Badge>
                              </div>
                              <p className="text-xs text-green-700">Missing tools</p>
                            </div>
                          )}
                          {certifications.length > 0 && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-amber-900">
                                  Certifications
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-100 text-amber-800 border-amber-300"
                                >
                                  {certifications.length}
                                </Badge>
                              </div>
                              <p className="text-xs text-amber-700">Missing certifications</p>
                            </div>
                          )}
                          {technical.length === 0 &&
                            soft.length === 0 &&
                            tools.length === 0 &&
                            certifications.length === 0 && (
                              <p className="text-sm text-gray-500 col-span-2">
                                No skill category breakdown available.
                              </p>
                            )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
              {"skillGaps" in fullCategoryData && fullCategoryData.skillGaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skill Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {fullCategoryData.skillGaps.map((gap, idx) => (
                        <li key={idx} className="text-gray-700">
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions for Adding Skills */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Suggestions for Adding Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const missingSkillsData =
                      fullCategoryData.missingSkills as RequiredSkillsCategoryData["missingSkills"];
                    const suggestions: string[] = [];

                    // Generate suggestions based on missing skills
                    if (missingSkillsData && missingSkillsData.length > 0) {
                      const criticalSkills = missingSkillsData.filter(
                        (s) => s.priority === "critical",
                      );
                      if (criticalSkills.length > 0) {
                        suggestions.push(
                          `Focus on acquiring ${criticalSkills
                            .slice(0, 3)
                            .map((s) => s.skill)
                            .join(", ")} as these are critical for the role.`,
                        );
                      }

                      const technicalSkills = missingSkillsData.filter(
                        (s) => s.category === "technical",
                      );
                      if (technicalSkills.length > 0) {
                        suggestions.push(
                          `Consider taking courses or certifications in ${technicalSkills
                            .slice(0, 2)
                            .map((s) => s.skill)
                            .join(" and ")} to strengthen your technical profile.`,
                        );
                      }

                      const certifications = missingSkillsData.filter(
                        (s) => s.category === "certification",
                      );
                      if (certifications.length > 0) {
                        suggestions.push(
                          `Pursue relevant certifications such as ${certifications
                            .slice(0, 2)
                            .map((s) => s.skill)
                            .join(" or ")} to demonstrate expertise.`,
                        );
                      }

                      if (suggestions.length === 0) {
                        suggestions.push(
                          "Review the missing skills above and identify opportunities to gain experience or training in these areas.",
                        );
                      }
                    } else {
                      suggestions.push(
                        "Your skills profile aligns well with the job requirements. Continue building depth in your existing skills.",
                      );
                    }

                    return renderSuggestionsList(suggestions);
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedCategory.id === "experience" && fullCategoryData && (
            <div className="space-y-4">
              {"durationAnalysis" in fullCategoryData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Duration Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{fullCategoryData.durationAnalysis}</p>
                  </CardContent>
                </Card>
              )}
              {"relevantExperiences" in fullCategoryData &&
                fullCategoryData.relevantExperiences.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Relevant Experiences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.relevantExperiences.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <span className="text-gray-700">{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              {"experienceGaps" in fullCategoryData &&
                fullCategoryData.experienceGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Experience Gaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.experienceGaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">✗</span>
                            <span className="text-gray-700">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Suggestions for Reframing Experience */}
              {analysisResult?.suggestedBullets && analysisResult.suggestedBullets.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-600" />
                      Suggestions for Reframing Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Here are improved bullet points that better highlight your experience:
                    </p>
                    {renderSuggestionsList(analysisResult.suggestedBullets)}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedCategory.id === "education" && fullCategoryData && (
            <div className="space-y-4">
              {"educationMatch" in fullCategoryData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Education Match</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{fullCategoryData.educationMatch}</p>
                  </CardContent>
                </Card>
              )}
              {"missingCredentials" in fullCategoryData &&
                fullCategoryData.missingCredentials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Missing Credentials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.missingCredentials.map((cred, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">✗</span>
                            <span className="text-gray-700">{cred}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Suggestions for Adding Credentials */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Suggestions for Adding Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const missingCredentials =
                      (fullCategoryData as EducationCredentialsCategoryData).missingCredentials ||
                      [];
                    const suggestions: string[] = [];

                    if (missingCredentials.length > 0) {
                      suggestions.push(
                        `Consider pursuing ${missingCredentials.slice(0, 2).join(" or ")} to strengthen your qualifications.`,
                      );
                      suggestions.push(
                        "Research industry-recognized certifications that align with your career goals and the job requirements.",
                      );
                      suggestions.push(
                        "Highlight any relevant coursework, training programs, or professional development that demonstrates your commitment to learning.",
                      );
                    } else {
                      suggestions.push(
                        "Your educational credentials align well with the job requirements.",
                      );
                      suggestions.push(
                        "Consider continuing education or certifications to stay current in your field.",
                      );
                    }

                    return renderSuggestionsList(suggestions);
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedCategory.id === "impact" && fullCategoryData && (
            <div className="space-y-4">
              {"currentAchievements" in fullCategoryData &&
                fullCategoryData.currentAchievements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.currentAchievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              {"missingMetrics" in fullCategoryData &&
                fullCategoryData.missingMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Missing Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.missingMetrics.map((metric, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">⚠</span>
                            <span className="text-gray-700">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Suggestions for Quantifying Achievements */}
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Suggestions for Quantifying Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const suggestions: string[] = [
                      "Add specific numbers, percentages, or dollar amounts to quantify your impact (e.g., 'Increased sales by 25%' or 'Managed a team of 10').",
                      "Include time-based metrics (e.g., 'Reduced processing time by 30%' or 'Completed project 2 weeks ahead of schedule').",
                      "Use scale indicators (e.g., 'Managed $2M budget' or 'Served 500+ customers monthly').",
                      "Highlight comparative improvements (e.g., 'Improved efficiency by 40% compared to previous year').",
                      "Include volume metrics (e.g., 'Processed 1,000+ transactions daily' or 'Wrote 50+ technical documents').",
                    ];

                    return renderSuggestionsList(suggestions);
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedCategory.id === "ats" && fullCategoryData && (
            <div className="space-y-4">
              {"atsIssues" in fullCategoryData && fullCategoryData.atsIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ATS Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {fullCategoryData.atsIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {"missingKeywords" in fullCategoryData &&
                fullCategoryData.missingKeywords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Missing Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {fullCategoryData.missingKeywords.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-300"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              {"formattingProblems" in fullCategoryData &&
                fullCategoryData.formattingProblems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formatting Problems</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.formattingProblems.map((problem, idx) => (
                          <li key={idx} className="text-gray-700">
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* ATS Optimization Tips */}
              {analysisResult?.atsTips && analysisResult.atsTips.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-orange-600" />
                      ATS Optimization Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Follow these tips to improve your resume&apos;s ATS compatibility:
                    </p>
                    {renderSuggestionsList(analysisResult.atsTips)}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedCategory.id === "quality" && fullCategoryData && (
            <div className="space-y-4">
              {"writingIssues" in fullCategoryData && fullCategoryData.writingIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Writing Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {fullCategoryData.writingIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {"consistencyProblems" in fullCategoryData &&
                fullCategoryData.consistencyProblems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Consistency Problems</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.consistencyProblems.map((problem, idx) => (
                          <li key={idx} className="text-gray-700">
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              {"formattingConcerns" in fullCategoryData &&
                fullCategoryData.formattingConcerns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formatting Concerns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {fullCategoryData.formattingConcerns.map((concern, idx) => (
                          <li key={idx} className="text-gray-700">
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Professionalism Tips */}
              <Card className="border-indigo-200 bg-indigo-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Professionalism Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const suggestions: string[] = [
                      "Use consistent verb tenses throughout your resume (past tense for previous roles, present tense for current role).",
                      "Maintain consistent formatting for dates, job titles, and company names across all sections.",
                      "Use professional language and avoid jargon or overly casual expressions.",
                      "Ensure all bullet points start with strong action verbs (e.g., 'Led', 'Developed', 'Implemented').",
                      "Keep bullet points concise and focused on achievements rather than responsibilities.",
                      "Proofread carefully for spelling, grammar, and punctuation errors.",
                      "Use a clean, professional format that is easy to scan and read.",
                    ];

                    return renderSuggestionsList(suggestions);
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Placeholder Content (if no real data) */}
      {!hasRealData && placeholder && (
        <div className="space-y-4">
          {placeholder.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Coming Soon Notice (only if no real data) */}
      {!hasRealData && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p className="text-sm">
                Detailed analysis and improvement suggestions will be available in the next
                iteration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
