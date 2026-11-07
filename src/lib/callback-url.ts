// Post-sign-in destination. Same-site paths (or absolute URLs on the app origin) only; anything else (off-site URLs,
// protocol-relative, backslash tricks) falls back to the Dashboard.
export const DEFAULT_DESTINATION = "/dashboard";

function configuredOrigin(): string | null {
  try {
    return process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).origin : null;
  } catch {
    return null;
  }
}

// NextAuth turns the header's relative callbackUrl into an absolute URL on this app's
// origin. Accept that form only when the origin matches exactly, and reduce it to
// path + query so the checks below apply to what we actually redirect to.
function toRelative(value: string, appOrigin: string | null): string | null {
  if (value.startsWith("/")) return value;
  if (!appOrigin || !/^https?:\/\//i.test(value) || value.includes("\\")) return null;
  if (/[\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.origin !== appOrigin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export function safeCallbackUrl(
  raw: string | string[] | undefined | null,
  appOrigin: string | null = configuredOrigin(),
): string {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (!first || first.length > 500) return DEFAULT_DESTINATION;
  const value = toRelative(first, appOrigin);
  if (value === null) return DEFAULT_DESTINATION;
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
