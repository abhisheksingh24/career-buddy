"use client";

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

  const run = async () => {
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
    setResult(await res.json());
  };

  const runAI = async () => {
    const res = await fetch("/api/resume/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
    setAi(await res.json());
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
      <button className="px-4 py-2 bg-black text-white rounded" onClick={run}>
        Run Analysis
      </button>
      <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={runAI}>
        Get AI Suggestions
      </button>
      {result && (
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {ai && (
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(ai, null, 2)}
        </pre>
      )}
    </div>
  );
}
