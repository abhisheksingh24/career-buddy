import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Pages reachable without a session. Signed-in pages (/dashboard, /profile,
// /upload, /analyze) are uncovered until test sign-in exists (#38).
const PAGES = [
  { name: "landing", path: "/" },
  { name: "sign-in", path: "/api/auth/signin" },
];

// Known violations we accept for now. Each entry needs a tracking issue; an
// entry that no longer matches fails the run so the list cannot rot.
type Allow = { rule: string; page: string; issue: string };
const ALLOWED: Allow[] = [
  // NextAuth's built-in sign-in page renders the Google logo without alt text.
  { rule: "image-alt", page: "/api/auth/signin", issue: "#102" },
];

const FAIL_ON = new Set(["serious", "critical"]);

for (const { name, path } of PAGES) {
  test(`${name} (${path}) has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const allowed = ALLOWED.filter((a) => a.page === path).map((a) => a.rule);
    const failing = results.violations.filter(
      (v) => FAIL_ON.has(v.impact ?? "") && !allowed.includes(v.id),
    );
    const summary = failing.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`,
    );
    expect(summary, `axe violations on ${path}`).toEqual([]);

    const seen = results.violations.map((v) => v.id);
    const stale = allowed.filter((r) => !seen.includes(r));
    expect(stale, `stale allow entries for ${path}`).toEqual([]);
  });
}
