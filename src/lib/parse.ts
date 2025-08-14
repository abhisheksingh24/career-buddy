export async function extractTextFromFile(file: File): Promise<{ text: string; mimeType: string; originalName: string }>{
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "application/octet-stream";
  const originalName = (file as any).name ?? "upload";

  if (mimeType === "application/pdf") {
    const { default: pdfParse } = await import("pdf-parse");
    const result = await pdfParse(buffer);
    return { text: result.text ?? "", mimeType, originalName };
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalName.toLowerCase().endsWith(".docx")
  ) {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value ?? "", mimeType, originalName };
  }

  // Fallback: treat as text
  return { text: buffer.toString("utf8"), mimeType, originalName };
}


