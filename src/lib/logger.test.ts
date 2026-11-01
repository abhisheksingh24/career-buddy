import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { log, logError, sanitizeMetadata } from "./logger";

afterEach(() => vi.restoreAllMocks());

describe("sanitizeMetadata", () => {
  it("keeps numbers, booleans and allowlisted short strings", () => {
    expect(sanitizeMetadata({ count: 3, ok: true, route: "resume.upload", none: null })).toEqual({
      count: 3,
      ok: true,
      route: "resume.upload",
      none: null,
    });
  });

  it("redacts free text under any other key, including resume text and emails", () => {
    const out = sanitizeMetadata({
      rawText: "Jane Doe, jane@example.com, Senior Engineer",
      email: "jane@example.com",
      payload: { name: "Jane" },
    });
    expect(JSON.stringify(out)).not.toMatch(/Jane|example\.com|Engineer/);
  });

  it("redacts over-long strings even under allowed keys and reduces arrays to a length", () => {
    const out = sanitizeMetadata({ reason: "x".repeat(200), skills: ["a", "b"] });
    expect(out).toEqual({ reason: "[redacted]", skills: "[array:2]" });
  });
});

describe("logError", () => {
  it("drops the error message and stack", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = Object.assign(new Error("Bad JSON near 'jane@example.com'"), { status: 400 });
    logError("upload failed", err, { route: "resume.upload" });
    const line = String(spy.mock.calls[0][0]);
    expect(line).not.toContain("jane@example.com");
    expect(JSON.parse(line).metadata).toMatchObject({ errorName: "Error", status: 400 });
  });
});

describe("log", () => {
  it("emits one JSON line", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "hello", { count: 1 });
    expect(JSON.parse(String(spy.mock.calls[0][0]))).toMatchObject({
      level: "info",
      message: "hello",
    });
  });
});

describe("server code", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) files.push(p);
    }
  };
  walk("src/lib");
  walk("src/app/api");

  it("never calls console directly outside the logger", () => {
    const offenders = files.filter(
      (f) => !f.endsWith("logger.ts") && /\bconsole\.\w+\(/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
