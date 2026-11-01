// The only sanctioned way to write server logs (ADR 0017).
//
// Resumes, job descriptions, names and emails are personal data and must never
// reach logs. Two defences: callers pass static messages plus structured
// metadata, and this module drops every free-text value it is handed. Only
// numbers, booleans, null and strings under an allowlisted key survive.
// logger.test.ts fails if server code calls console directly.

export type LogLevel = "debug" | "info" | "warn" | "error";

/** Metadata keys whose string values are short identifiers we control. */
const SAFE_STRING_KEYS = new Set([
  "event",
  "route",
  "method",
  "code",
  "status",
  "errorName",
  "model",
  "category",
  "reason",
  // CSP report fields, already stripped of query/fragment and capped by the route.
  "directive",
  "blockedUri",
  "documentUri",
  "sourceFile",
]);

const MAX_SAFE_STRING = 80;
const REDACTED = "[redacted]";

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    return SAFE_STRING_KEYS.has(key) && value.length <= MAX_SAFE_STRING ? value : REDACTED;
  }
  if (Array.isArray(value)) return `[array:${value.length}]`;
  if (value === undefined) return undefined;
  return REDACTED;
}

export function sanitizeMetadata(
  metadata?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const v = sanitizeValue(key, value);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

export function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  const payload = {
    level,
    message,
    metadata: sanitizeMetadata(metadata),
    timestamp: new Date().toISOString(),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/**
 * Log a caught error without its message or stack: SDK, parser and database
 * errors often quote the input (resume text, a bad JSON body). Only the error
 * class, a machine code and an HTTP status are kept.
 */
export function logError(
  message: string,
  error: unknown,
  metadata?: Record<string, unknown>,
): void {
  const e = (error ?? {}) as { name?: unknown; code?: unknown; status?: unknown };
  log("error", message, {
    ...metadata,
    errorName: typeof e.name === "string" ? e.name : typeof error,
    code: typeof e.code === "string" || typeof e.code === "number" ? String(e.code) : undefined,
    status: typeof e.status === "number" ? e.status : undefined,
  });
}
