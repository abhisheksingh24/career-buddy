"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  readUploadResponse,
  UPLOAD_FALLBACK_ERROR,
  type UploadOutcome,
} from "@/lib/upload-response";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function UploadPage() {
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setOutcome(null);
    try {
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      setOutcome(await readUploadResponse(res));
    } catch {
      setOutcome({ ok: false, error: UPLOAD_FALLBACK_ERROR });
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Resume</h1>
      <form action={onSubmit} className="space-y-3">
        <input name="file" type="file" className="mt-2" accept=".pdf,.docx,.txt" />
        <button disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {outcome && !outcome.ok && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="break-words">{outcome.error}</AlertDescription>
        </Alert>
      )}
      {outcome?.ok && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="break-words">
            {outcome.fileName ? `Uploaded ${outcome.fileName}` : "Resume uploaded successfully!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
