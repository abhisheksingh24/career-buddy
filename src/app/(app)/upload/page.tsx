"use client";

import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{
    status: number;
    id?: string;
    originalName?: string;
    mimeType?: string;
    length?: number;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const text = await res.text();
      const maybe = text ? JSON.parse(text) : { error: "Empty response" };
      setResult({ status: res.status, ...maybe });
    } catch (e: unknown) {
      setResult({
        status: 500,
        error: e instanceof Error ? e.message : "Unknown error occurred",
      });
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Resume</h1>
      <form action={onSubmit} className="space-y-3">
        <input
          name="file"
          type="file"
          className="mt-2"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        <button disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {fileName && <p className="text-sm">Selected: {fileName}</p>}
      {result && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
