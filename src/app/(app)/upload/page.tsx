"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  readUploadResponse,
  uploadedMessage,
  UPLOAD_FALLBACK_ERROR,
  type UploadOutcome,
} from "@/lib/upload-response";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState<string>("");
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
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="cursor-pointer">
            <input
              name="file"
              type="file"
              className="peer sr-only"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto min-h-11 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]"
            >
              <span>Choose file</span>
            </Button>
          </label>
          <Button type="submit" disabled={loading} className="min-h-11">
            <Upload className="h-4 w-4" />
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>
      {fileName && <p className="text-sm" aria-live="polite">Selected: {fileName}</p>}
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
            {uploadedMessage(outcome.fileName ?? fileName)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
