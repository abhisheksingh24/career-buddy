import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

describe("phone text input height (#142)", () => {
  it("sets a 44px min-height on single-line inputs below the md breakpoint only", () => {
    const m = css.match(
      /@media \(max-width: 767px\)\s*\{\s*input:not\(([^)]*)\)\s*\{\s*min-height: 44px;/,
    );
    expect(m).not.toBeNull();
    for (const t of ["file", "checkbox", "radio", "hidden"]) {
      expect(m![1]).toContain(`[type="${t}"]`);
    }
  });
});
