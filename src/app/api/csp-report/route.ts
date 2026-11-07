import { publicGuard } from "@/lib/api-guard";
import { log } from "@/lib/logger";
import { readBodyLimited } from "@/lib/read-limited-body";

// Receives CSP violation reports (report-uri and Reporting API). Public by
// design: browsers send it without cookies. Input is untrusted, so it is
// size-capped, reduced to a few short fields and only ever logged.
const MAX_BYTES = 8 * 1024;
const MAX_FIELD = 80;

// Report field names (legacy report-uri and Reporting API) -> logger keys.
const URL_FIELDS: Record<string, string> = {
  "document-uri": "documentUri",
  documentURL: "documentUri",
  "blocked-uri": "blockedUri",
  blockedURL: "blockedUri",
  "source-file": "sourceFile",
  sourceFile: "sourceFile",
};
const DIRECTIVE_FIELDS: Record<string, string> = {
  "violated-directive": "directive",
  "effective-directive": "directive",
  effectiveDirective: "directive",
};
const LINE_FIELDS = ["line-number", "lineNumber"];

/** Drop query and fragment: URLs can carry tokens or personal data. */
function stripUrl(v: string): string {
  return v.split(/[?#]/)[0].slice(0, MAX_FIELD);
}

function pick(report: unknown): Record<string, string | number> | null {
  if (!report || typeof report !== "object") return null;
  const r = report as Record<string, unknown>;
  const body =
    r["csp-report"] && typeof r["csp-report"] === "object"
      ? (r["csp-report"] as Record<string, unknown>)
      : r.body && typeof r.body === "object"
        ? (r.body as Record<string, unknown>)
        : null;
  if (!body) return null;
  const out: Record<string, string | number> = {};
  for (const [k, key] of Object.entries(URL_FIELDS)) {
    const v = body[k];
    if (typeof v === "string" && !(key in out)) out[key] = stripUrl(v);
  }
  for (const [k, key] of Object.entries(DIRECTIVE_FIELDS)) {
    const v = body[k];
    if (typeof v === "string" && !(key in out)) out[key] = v.slice(0, MAX_FIELD);
  }
  for (const k of LINE_FIELDS) {
    const v = body[k];
    if (typeof v === "number" && Number.isFinite(v)) out.lineNumber = v;
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  const refused = publicGuard(request, {
    bucket: "csp-report",
    limit: 60,
    windowMs: 60_000,
    maxBytes: MAX_BYTES,
  });
  if (refused) return refused;
  // Bounded read: stops at the cap even for chunked bodies with no length.
  const bytes = await readBodyLimited(request, MAX_BYTES);
  if (!bytes) return new Response(null, { status: 413 });
  const text = new TextDecoder().decode(bytes);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const reports = Array.isArray(parsed) ? parsed.slice(0, 10) : [parsed];
  for (const r of reports) {
    const fields = pick(r);
    if (fields) log("warn", "csp-violation", fields);
  }
  return new Response(null, { status: 204 });
}
