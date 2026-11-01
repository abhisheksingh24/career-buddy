// Post-sign-in destination. Same-site paths only; anything else (off-site URLs,
// protocol-relative, backslash tricks) falls back to the Dashboard.
export const DEFAULT_DESTINATION = "/dashboard";

export function safeCallbackUrl(raw: string | string[] | undefined | null): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || value.length > 500) return DEFAULT_DESTINATION;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_DESTINATION;
  }

  if (/[\u0000-\u001f]/.test(value)) return DEFAULT_DESTINATION;
  try {
    // Must still resolve to this origin.
    if (new URL(value, "http://localhost").origin !== "http://localhost") {
      return DEFAULT_DESTINATION;
    }
  } catch {
    return DEFAULT_DESTINATION;
  }
  return value;
}
