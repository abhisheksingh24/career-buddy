export type LogLevel = "debug" | "info" | "warn" | "error";

export function log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
  const payload = { level, message, metadata, timestamp: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

