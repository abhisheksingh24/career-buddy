"use client";

import { ResumeAnalysisResults } from "@/components/resume-analysis-results";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

type AnalyzeResponse =
  | {
      score: number;
      missingKeywords: string[];
      suggestions: {
        bullets: string[];
        skills: string[];
      };
      jobTitle?: string;
      company?: string;
    }
  | { error?: string }
  | null;

export default function AnalyzePage() {
  const { data: session } = useSession();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<AnalyzeResponse>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userResume, setUserResume] = useState<string | null>(null);

  // Fetch user's resume on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserResume();
    }
  }, [session]);

  const fetchUserResume = async () => {
    try {
      const response = await fetch("/api/resume/active");
      if (response.ok) {
        const data = await response.json();
        setUserResume(data.rawText || null);
      }
    } catch (error) {
      console.error("Failed to fetch user resume:", error);
    }
  };

  const useMyResume = () => {
    if (userResume) {
      setResumeText(userResume);
    }
  };

  const run = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobTitle: jobTitle || "Position",
          company: company || "Company",
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze resume");
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <p className="text-gray-600">
          Analyze your resume against any job description to get matching scores and AI-powered
          suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Text
              </CardTitle>
              <CardDescription>
                Paste your resume content or use your uploaded resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userResume && (
                <Button
                  onClick={useMyResume}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Use My Uploaded Resume
                </Button>
              )}
              <textarea
                className="w-full border rounded-lg p-3 min-h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Enter the job details and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea
                  className="w-full border rounded-lg p-3 min-h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={run}
            disabled={isLoading || !resumeText || !jobDescription}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && !error && "score" in result && (
            <ResumeAnalysisResults
              score={result.score}
              missingKeywords={result.missingKeywords}
              suggestions={result.suggestions}
              jobTitle={result.jobTitle}
              company={result.company}
            />
          )}

          {!result && !error && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter your resume and job description to get started with the analysis.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
