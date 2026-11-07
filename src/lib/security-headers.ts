// Security headers and the Content-Security-Policy (issues #87, #96).
// The CSP is ENFORCED and built per request in src/proxy.ts with a fresh nonce,
// so scripts and style elements need no 'unsafe-inline'. The static headers
// below go on every response from next.config.ts.

export type HeaderEntry = { key: string; value: string };

export const CSP_REPORT_PATH = "/api/csp-report";

export function buildCsp(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    // 'strict-dynamic' lets nonced scripts load their chunks. Dev needs eval
    // for React refresh.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Style elements need the nonce. Dev (HMR) injects style tags without one.
    `style-src-elem 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    // React `style={{...}}` attributes (progress bars) cannot carry a nonce.
    // Attribute styles cannot run script, so this is the accepted residual.
    "style-src-attr 'unsafe-inline'",
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
    `report-uri ${CSP_REPORT_PATH}`,
    "report-to csp",
  ];
  return directives.join("; ");
}

/** Headers that are the same for every request. The CSP is added by the proxy. */
export function securityHeaders(isDev: boolean): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: "Reporting-Endpoints", value: `csp="${CSP_REPORT_PATH}"` },
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
