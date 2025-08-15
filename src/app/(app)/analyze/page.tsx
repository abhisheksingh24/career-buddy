"use client";

import { SuggestionsList } from "@/components/suggestions-list";
import { useState } from "react";

type AnalyzeResponse = { score: number; missingKeywords: string[] } | { error?: string } | null;
type SuggestResponse =
  | { suggestions: string[]; skills?: string[]; disabled?: boolean }
  | { error?: string }
  | null;

export default function AnalyzePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalyzeResponse>(null);
  const [ai, setAi] = useState<SuggestResponse>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
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

  const runAI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/resume/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      if (!res.ok) throw new Error("Failed to get AI suggestions");
      setAi(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAi(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Analyze</h1>
      <textarea
        className="w-full border rounded p-2 min-h-32"
        placeholder="Paste resume text"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 min-h-32"
        placeholder="Paste job description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          onClick={run}
          disabled={isLoading || !resumeText || !jobDescription}
        >
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </button>
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
          onClick={runAI}
          disabled={isLoading || !resumeText || !jobDescription}
        >
          {isLoading ? "Getting Suggestions..." : "Get AI Suggestions"}
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>}

      {result && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <h3 className="font-medium mb-2">Analysis Results</h3>
          <div>
            <strong>Score:</strong> {result.score}
          </div>
          {result.missingKeywords?.length > 0 && (
            <div className="mt-2">
              <strong>Missing Keywords:</strong>
              <ul className="list-disc list-inside">
                {result.missingKeywords.map((kw, i) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {ai && !error && (
        <SuggestionsList suggestions={ai.suggestions} skills={ai.skills} disabled={ai.disabled} />
      )}
    </div>
  );
}
