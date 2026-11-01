export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
/** Multipart framing adds a little to the file itself. */
export const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

export type UploadKind = "pdf" | "docx" | "text";

export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const TOO_LARGE_MESSAGE = "That file is too large. Resumes can be up to 5 MB.";
export const UNSUPPORTED_MESSAGE = "We can only read PDF, DOCX or plain text resumes.";
export const UNREADABLE_MESSAGE = "We could not read that file. Try exporting it again.";

export const MIME_BY_KIND: Record<UploadKind, string> = {
  pdf: "application/pdf",
  docx: DOCX_MIME,
  text: "text/plain",
};

/**
 * Decide the file kind from its leading bytes and name, never from the
 * client-supplied Content-Type. Returns null when unsupported.
 */
export function detectKind(buffer: Buffer, name: string): UploadKind | null {
  if (buffer.length === 0) return null;
  const lower = name.toLowerCase();
  if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return lower.endsWith(".docx") ? "docx" : null;
  }
  if ((lower.endsWith(".txt") || lower.endsWith(".md")) && !buffer.includes(0)) return "text";
  return null;
}
