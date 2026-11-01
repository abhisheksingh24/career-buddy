// Pure logic for scripts/audit.mjs (importable, no side effects). Tested in
// src/lib/audit.test.ts. See docs/decisions/0010-dependency-audit-in-ci.md.

// Codes and phrases npm uses when the registry request itself failed.
const NETWORK =
  /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|EPIPE|FETCH_ERROR|ERR_SOCKET_TIMEOUT|\bE429\b|\bE5\d\d\b|audit request to .* failed|audit endpoint returned an error/;

/** Turn raw npm output into a report; garbled output becomes an `error` report. */
export function parseAudit(stdout, stderr = "") {
  try {
    const parsed = JSON.parse(stdout);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fall through
  }
  return { error: { code: "UNPARSEABLE", summary: (stderr || stdout || "").slice(0, 500) } };
}

/** Text of the error only; findings (no `error` key) never yield any text. */
export function errorText(report) {
  if (!report.error) return "";
  return [report.error.code, report.message, report.error.summary, report.error.detail]
    .filter(Boolean)
    .join(" ");
}

export function isNetworkError(report) {
  return Boolean(report.error) && NETWORK.test(errorText(report));
}

/**
 * Decide the outcome of a (final) report.
 * Returns { status: "pass" | "fail" | "warn", messages: string[] }.
 * `warn` means a network failure: exit 0. `allow` is a Map of GHSA id -> entry.
 */
export function evaluate(report, allow) {
  if (report.error) {
    const text = errorText(report);
    if (isNetworkError(report)) {
      return {
        status: "warn",
        messages: [
          `::warning::npm audit skipped: registry unreachable (${text.slice(0, 200)}). Not a finding.`,
        ],
      };
    }
    return { status: "fail", messages: [`::error::npm audit failed to run: ${text}`] };
  }

  const bad = new Map();
  const accepted = new Set();
  for (const v of Object.values(report.vulnerabilities ?? {})) {
    for (const via of v.via ?? []) {
      if (typeof via === "string" || !["high", "critical"].includes(via.severity)) continue;
      const id = via.url
        ? via.url.split("/").pop()
        : `${via.dependency}:${via.source ?? via.title}`;
      if (allow.has(id)) accepted.add(id);
      else
        bad.set(
          id,
          `::error::${via.dependency} (${via.severity}): ${via.title} ${via.url ?? ""}`.trim(),
        );
    }
  }
  const messages = [];
  for (const id of accepted) {
    const a = allow.get(id);
    messages.push(`Accepted ${id}: ${a.reason} [${a.tracking}]`);
  }
  for (const id of allow.keys()) {
    if (!accepted.has(id))
      messages.push(
        `::warning::Allowlist entry ${id} no longer reported; remove it from .github/audit-allowlist.json.`,
      );
  }
  if (bad.size) return { status: "fail", messages: [...messages, ...bad.values()] };
  return {
    status: "pass",
    messages: [
      ...messages,
      "npm audit: no unaccepted high or critical findings in production dependencies.",
    ],
  };
}
