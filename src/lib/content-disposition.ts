const MAX_NAME_CODE_POINTS = 150;

/** Safe inline Content-Disposition: no quotes, control chars or non-ASCII in the plain form (RFC 5987 filename*). */
export function contentDisposition(name: string): string {
  // toWellFormed replaces lone surrogates with U+FFFD, which encodeURIComponent would otherwise reject.
  const wellFormed = name.toWellFormed().replace(/[\u0000-\u001f\u007f]/g, "");
  // Truncate by code point so a surrogate pair is never split.
  const cleaned =
    Array.from(wellFormed).slice(0, MAX_NAME_CODE_POINTS).join("").trim() || "resume.pdf";
  const ascii = cleaned.replace(/[^\x20-\x7e]/gu, "_").replace(/["\\;%]/g, "_");
  const encoded = encodeURIComponent(cleaned).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
