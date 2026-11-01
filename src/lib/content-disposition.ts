/** Safe inline Content-Disposition: no quotes, control chars or non-ASCII in the plain form (RFC 5987 filename*). */
export function contentDisposition(name: string): string {
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, "").trim() || "resume.pdf";
  const ascii = cleaned.replace(/[^\x20-\x7e]/g, "_").replace(/["\\;%]/g, "_");
  const encoded = encodeURIComponent(cleaned).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
