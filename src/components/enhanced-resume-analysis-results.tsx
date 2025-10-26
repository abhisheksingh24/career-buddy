"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EnhancedAnalysisResult } from "@/lib/types/analysis";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Target,
  Award,
  AlertTriangle,
  FileCheck,
  Briefcase,
} from "lucide-react";

interface EnhancedResumeAnalysisResultsProps {
  analysis: EnhancedAnalysisResult;
}

export function EnhancedResumeAnalysisResults({ analysis }: EnhancedResumeAnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "critical") return "text-red-600 border-red-300 bg-red-50";
    if (priority === "important") return "text-orange-600 border-orange-300 bg-orange-50";
    return "text-blue-600 border-blue-300 bg-blue-50";
  };

  return (
    <div className="space-y-6">
      {/* Overview Card with Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analysis Overview
          </CardTitle>
          <CardDescription>
            Domain: <span className="font-medium">{analysis.domain}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Overall Match Score</h3>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {Math.round(analysis.overallScore)}%
              </span>
            </div>
            <Progress
              value={analysis.overallScore}
              className={`h-2 ${getProgressColor(analysis.overallScore)}`}
            />
            <p className="text-xs text-gray-600">{getScoreLabel(analysis.overallScore)}</p>
          </div>

          {/* ATS Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">ATS Optimization Score</h3>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                {Math.round(analysis.atsScore)}%
              </span>
            </div>
            <Progress
              value={analysis.atsScore}
              className={`h-2 ${getProgressColor(analysis.atsScore)}`}
            />
            <p className="text-xs text-gray-600">
              How well your resume is optimized for Applicant Tracking Systems
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="ats">ATS Tips</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Award className="h-5 w-5" />
                Your Strengths
              </CardTitle>
              <CardDescription>What makes you a strong candidate for this role</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengthAreas.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Lightbulb className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>Opportunities to strengthen your application</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.improvementAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          {/* Matched Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Matched Skills ({analysis.matchedSkills.length})
              </CardTitle>
              <CardDescription>Skills from your resume that align with the job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((match, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={
                      match.relevance === "high"
                        ? "border-green-500 text-green-700 bg-green-50"
                        : match.relevance === "medium"
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : "border-gray-500 text-gray-700 bg-gray-50"
                    }
                  >
                    {match.skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          {analysis.missingSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Missing Skills ({analysis.missingSkills.length})
                </CardTitle>
                <CardDescription>
                  Skills from the job description not found in your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["critical", "important", "nice-to-have"].map((priority) => {
                    const skills = analysis.missingSkills.filter((s) => s.priority === priority);
                    if (skills.length === 0) return null;
                    return (
                      <div key={priority}>
                        <h4 className="text-sm font-medium mb-2 capitalize">
                          {priority.replace("-", " ")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={getPriorityColor(skill.priority)}
                            >
                              {skill.skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          {/* Relevant Experiences */}
          {analysis.relevantExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Briefcase className="h-5 w-5" />
                  Relevant Experience
                </CardTitle>
                <CardDescription>Your experiences that align well with this role</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.relevantExperiences.map((exp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{exp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Experience Gaps */}
          {analysis.experienceGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Target className="h-5 w-5" />
                  Experience Gaps
                </CardTitle>
                <CardDescription>
                  Experience or qualifications that could strengthen your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.experienceGaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ATS Tips Tab */}
        <TabsContent value="ats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                ATS Optimization Tips
              </CardTitle>
              <CardDescription>
                Specific recommendations to improve your resume&apos;s compatibility with Applicant
                Tracking Systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {analysis.atsTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm pt-0.5">{tip}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                AI-Generated Resume Improvements
              </CardTitle>
              <CardDescription>
                Rewritten bullet points tailored to this job description (click to copy)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.suggestedBullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(bullet);
                    }}
                    title="Click to copy"
                  >
                    <span className="flex-shrink-0 text-purple-600 font-medium">•</span>
                    <span className="text-sm">{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                💡 Tip: Click any bullet point to copy it to your clipboard
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
