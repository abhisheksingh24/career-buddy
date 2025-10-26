"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";

interface ResumeAnalysisResultsProps {
  score: number;
  missingKeywords: string[];
  suggestions?: {
    bullets: string[];
    skills: string[];
  };
  jobTitle?: string;
  company?: string;
  isLoading?: boolean;
  error?: string;
}

export function ResumeAnalysisResults({
  score,
  missingKeywords,
  suggestions,
  jobTitle,
  company,
  isLoading = false,
  error,
}: ResumeAnalysisResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Your resume strongly aligns with this job. You're a great candidate!";
    if (score >= 60) return "Good alignment with some areas for improvement.";
    if (score >= 40) return "Moderate alignment. Consider addressing the gaps below.";
    return "Significant gaps detected. Focus on the suggestions below to improve your match.";
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Matching Score
            {jobTitle && company && (
              <span className="text-sm font-normal text-gray-600">
                for {jobTitle} at {company}
              </span>
            )}
          </CardTitle>
          <CardDescription>{getScoreDescription(score)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {Math.round(score)}%
            </span>
            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
          <Progress value={score} className="h-2" />
        </CardContent>
      </Card>

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Missing Keywords
            </CardTitle>
            <CardDescription>
              These keywords from the job description are missing from your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {suggestions && (suggestions.bullets.length > 0 || suggestions.skills.length > 0) && (
        <div className="space-y-4">
          {/* Resume Improvements */}
          {suggestions.bullets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Immediate Resume Improvements
                </CardTitle>
                <CardDescription>
                  AI-generated bullet points tailored to this job description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {suggestions.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills to Develop */}
          {suggestions.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Skills to Develop
                </CardTitle>
                <CardDescription>
                  Consider learning these skills to improve your match
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggestions.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-purple-700 bg-purple-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No suggestions available */}
      {suggestions && suggestions.bullets.length === 0 && suggestions.skills.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No specific suggestions available for this analysis.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
