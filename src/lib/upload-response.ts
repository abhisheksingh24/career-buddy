export const UPLOAD_FALLBACK_ERROR = "Upload failed. Please try again.";

export const UPLOAD_SIGN_IN_ERROR = "Please sign in to upload your resume.";

/** The one success line shown after an upload, on every page. */
export function uploadedMessage(fileName?: string): string {
  return fileName ? `Uploaded ${fileName}` : "Uploaded your resume";
}

export type UploadOutcome = { ok: true; fileName?: string } | { ok: false; error: string };

/** Turn an upload reply into a plain outcome; never throws on non-JSON bodies. */
export async function readUploadResponse(res: Response): Promise<UploadOutcome> {
  type Body = { error?: unknown; originalName?: unknown };
  let data: Body | null = null;
  try {
    const parsed: unknown = JSON.parse(await res.text());
    if (parsed && typeof parsed === "object") data = parsed as Body;
  } catch {
    data = null;
  }
  if (res.status === 401) return { ok: false, error: UPLOAD_SIGN_IN_ERROR };
  if (!res.ok) {
    const error =
      data && typeof data.error === "string" && data.error ? data.error : UPLOAD_FALLBACK_ERROR;
    return { ok: false, error };
  }
  return {
    ok: true,
    fileName: data && typeof data.originalName === "string" ? data.originalName : undefined,
  };
}
