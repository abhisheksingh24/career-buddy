import type { UploadKind } from "./upload-validation";

/** Extract text from an upload already validated by `detectKind`. */
export async function extractText(buffer: Buffer, kind: UploadKind): Promise<string> {
  if (kind === "pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    return (await pdfParse(buffer)).text ?? "";
  }
  if (kind === "docx") {
    const { default: mammoth } = await import("mammoth");
    return (await mammoth.extractRawText({ buffer })).value ?? "";
  }
  return buffer.toString("utf8");
}
