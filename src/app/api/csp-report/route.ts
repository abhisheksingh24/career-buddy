import { log } from "@/lib/logger";

// Receives CSP violation reports (report-uri and Reporting API). Public by
// design: browsers send it without cookies. Input is untrusted, so it is
// size-capped, reduced to a few short fields and only ever logged.
const MAX_BYTES = 8 * 1024;
const FIELDS = [
  "document-uri",
  "documentURL",
  "violated-directive",
  "effective-directive",
  "effectiveDirective",
  "blocked-uri",
  "blockedURL",
  "source-file",
  "sourceFile",
  "line-number",
  "lineNumber",
] as const;

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
  for (const k of FIELDS) {
    const v = body[k];
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return new Response(null, { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 });

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
