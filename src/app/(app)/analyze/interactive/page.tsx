"use client";

import { CategoryDetailsPanel } from "@/components/category-details-panel";
import {
  CategoryNavigation,
  type Category,
  type CategoryId,
} from "@/components/category-navigation";
import { InteractiveAnalysisLayout } from "@/components/interactive-analysis-layout";
import { ResumePDFViewer } from "@/components/resume-pdf-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transformCategoriesToNavigation } from "@/lib/category-utils";
import type { EnhancedAnalysisResult, CategoryAnalysisResponse } from "@/lib/types/analysis";
import {
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  FileCheck,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

// Placeholder category data - will be replaced with real data in later iterations
const placeholderCategories: Category[] = [
  {
    id: "overview",
    name: "Match Overview",
    icon: TrendingUp,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "skills",
    name: "Required Skills",
    icon: Target,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "experience",
    name: "Work Experience",
    icon: Briefcase,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "education",
    name: "Education & Credentials",
    icon: GraduationCap,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "impact",
    name: "Impact & Achievements",
    icon: Award,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "ats",
    name: "ATS Compatibility",
    icon: FileCheck,
    score: 0,
    actionItemsCount: 0,
  },
  {
    id: "quality",
    name: "Professional Quality",
    icon: FileText,
    score: 0,
    actionItemsCount: 0,
  },
];

// Type for analysis response with categories
type AnalysisResponse = EnhancedAnalysisResult & {
  categories?: CategoryAnalysisResponse;
  analysisId?: string;
};

export default function InteractiveAnalyzePage() {
  const { data: session } = useSession();

  // Input form state
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [userResume, setUserResume] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeFileType, setResumeFileType] = useState<string>("text/plain");
  const [showInputForm, setShowInputForm] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [categories, setCategories] = useState<CategoryAnalysisResponse | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's resume on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserResume();
    }
  }, [session]);

  // #region agent log
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "interactive/page.tsx:useEffect",
          message: "ResumePDFViewer props updated",
          data: {
            resumeId,
            resumeFileType,
            fileUrl: resumeId ? `/api/resume/${resumeId}/file` : null,
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "A",
        }),
      }).catch(() => {});
    }
  }, [resumeId, resumeFileType]);
  // #endregion

  const fetchUserResume = async () => {
    try {
      const response = await fetch("/api/resume/active");
      if (response.ok) {
        const data = await response.json();
        setUserResume(data.rawText || null);
        setResumeId(data.id || null);
        setResumeFileType(data.fileType || "text/plain");
      }
    } catch (error) {
      console.error("Failed to fetch user resume:", error);
    }
  };

  const useMyResume = () => {
    if (userResume) {
      setResumeText(userResume);
      // Resume ID and file type are already set from fetchUserResume
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await res.json();

      // Update resume state with uploaded file info
      if (uploadData.id) {
        setResumeId(uploadData.id);
        setResumeFileType(uploadData.mimeType || "application/pdf");
      }

      // Fetch the uploaded resume text after upload completes
      const resumeResponse = await fetch("/api/resume/active");
      if (resumeResponse.ok) {
        const resumeData = await resumeResponse.json();
        if (resumeData.rawText) {
          setResumeText(resumeData.rawText);
        }
        // Update resume ID and file type from active resume
        if (resumeData.id) {
          setResumeId(resumeData.id);
          setResumeFileType(resumeData.fileType || "text/plain");
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategoryId(categoryId);
    // No loading state needed for category selection - data is already loaded
  };

  // Handle API call for analysis
  const handleStartAnalysis = async () => {
    if (!resumeText || !jobDescription) {
      setError("Please provide both resume text and job description");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobTitle: jobTitle || "Position",
          company: company || "Company",
          domain: domain || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data: AnalysisResponse = await response.json();

      // Store analysis result
      setAnalysisResult(data);

      // Extract and store categories if available
      if (data.categories) {
        setCategories(data.categories);
      }

      // Collapse input form after successful analysis
      setShowInputForm(false);

      // Set default selected category to "overview"
      setSelectedCategoryId("overview");

      // Clear any previous errors
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis";
      setError(errorMessage);
      // Don't clear form data on error - allow user to retry
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which categories to use (real data or placeholder)
  const displayCategories = categories
    ? transformCategoriesToNavigation(categories)
    : placeholderCategories;

  const selectedCategory = selectedCategoryId
    ? displayCategories.find((c) => c.id === selectedCategoryId) || null
    : null;

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[calc(100vh-4rem)]">
      {/* Input Form Section - Collapsible */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Resume Analysis Setup</h2>
            {!showInputForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInputForm(true)}
                className="text-sm"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Input Form
              </Button>
            )}
            {showInputForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInputForm(false)}
                className="text-sm"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Input Form
              </Button>
            )}
          </div>

          {showInputForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Resume Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Resume
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Upload a PDF file or use your uploaded resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload Resume File</label>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        disabled={isUploading || isLoading}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {uploadError && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">{uploadError}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Use Uploaded Resume Button */}
                    {userResume && (
                      <Button
                        onClick={useMyResume}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Use My Uploaded Resume
                      </Button>
                    )}

                    {/* Text Paste - Disabled for MVP, PDF upload required */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Resume Text (for analysis)
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-3 min-h-24 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Resume text will be extracted from uploaded PDF..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        disabled={isLoading}
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Text is automatically extracted from uploaded PDF for analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Description Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Information</CardTitle>
                    <CardDescription className="text-sm">
                      Enter the job details and description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Job Title and Company */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Job Title</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Google"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Domain */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Job Domain{" "}
                        <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Software Engineering"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Job Description</label>
                      <textarea
                        className="w-full border rounded-lg p-3 min-h-24 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Start Analysis Button */}
              <Button
                onClick={handleStartAnalysis}
                disabled={isLoading || !resumeText || !jobDescription}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  "Start Analysis"
                )}
              </Button>
            </div>
          )}

          {/* Collapsed View - Show Job Title and Company */}
          {!showInputForm && (jobTitle || company) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{jobTitle || "Position"}</span>
              {company && (
                <>
                  <span>@</span>
                  <span className="font-medium">{company}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <InteractiveAnalysisLayout
        jobTitle={jobTitle || "Position"}
        company={company || "Company"}
        overallScore={analysisResult?.overallScore || 0}
      >
        {{
          leftPanel: (
            <CategoryNavigation
              categories={displayCategories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={handleCategorySelect}
            />
          ),
          centerPanel: (
            <CategoryDetailsPanel
              selectedCategory={selectedCategory}
              categoryData={categories}
              allCategories={displayCategories}
              analysisResult={analysisResult}
              onCategorySelect={handleCategorySelect}
              isLoading={isLoading}
            />
          ),
          rightPanel: (
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resume Preview</h3>
              <ResumePDFViewer
                fileUrl={resumeId ? `/api/resume/${resumeId}/file` : null}
                fileType={resumeFileType}
                isLoading={isUploading}
              />
            </div>
          ),
        }}
      </InteractiveAnalysisLayout>
    </div>
  );
}
