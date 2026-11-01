export const UPLOAD_FALLBACK_ERROR = "Upload failed. Please try again.";

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
