// Security headers for every response (issue #87).
// The CSP is REPORT-ONLY for now: violations show in the browser console but
// nothing is blocked. Enforcing is a follow-up (see docs/quality/threat-model.md).

export type HeaderEntry = { key: string; value: string };

export function buildCsp(isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    // Next injects inline bootstrap scripts; nonces would need middleware, so
    // 'unsafe-inline' is used for now. Dev needs eval for React refresh.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind and Next emit inline styles.
    "style-src 'self' 'unsafe-inline'",
    // next/font/google self-hosts the Geist files at build time.
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com",
    "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
    // pdf.js runs its worker from /pdf.worker.min.mjs (or a blob: wrapper).
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    // Google sign-in is a top-level redirect; form posts stay same-origin.
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

export function securityHeaders(isDev: boolean): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: "Content-Security-Policy-Report-Only", value: buildCsp(isDev) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
  // Browsers ignore HSTS over plain http; only send it in production builds.
  if (!isDev) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }
  return headers;
}
