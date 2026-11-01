import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// A page may have only one <main>. The root layout owns it, so no other
// component or page may render another (#139).
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

describe("main landmark", () => {
  it("is rendered only by the root layout", () => {
    const src = path.resolve(__dirname, "..");
    const offenders = sourceFiles(src)
      .filter((f) => /<main[\s>]/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(src, f));
    expect(offenders).toEqual([path.join("app", "layout.tsx")]);
  });
});
