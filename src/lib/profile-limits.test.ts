// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PROFILE_LIMITS } from "./profile-schema";

// Client code must not import zod at runtime: its eval probe breaks the
// enforced CSP (ADR 0018). The profile page may only import types from the
// schema module and gets its limits from the import-free profile-limits.ts.
describe("profile client bundle stays zod-free", () => {
  it("profile-limits.ts has no imports", () => {
    expect(readFileSync("src/lib/profile-limits.ts", "utf8")).not.toMatch(/^\s*import\s/m);
  });
  it("the profile page imports the schema module as types only", () => {
    const page = readFileSync("src/app/(app)/profile/page.tsx", "utf8");
    const imports = page.match(/^import[^;]*profile-schema";/gm) ?? [];
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line).toMatch(/^import type /);
    expect(page).not.toMatch(/from "zod"/);
  });
  it("the schema re-exports the same limits", () => {
    expect(PROFILE_LIMITS.bio).toBe(3000);
  });
});
