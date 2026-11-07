import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Signed-in axe check for /analyze/interactive (issue #146). It needs a real
// session, which means a database. CI forbids service containers, so it is
// opt-in: it skips unless A11Y_SESSION_TOKEN is set. To run it locally, with a
// server already running on A11Y_PORT with the same NEXTAUTH_URL and
// DATABASE_URL and MOCK_AI_SUGGESTIONS=true:
//   TEST_LOGIN=true NEXTAUTH_URL=http://localhost:3917 DATABASE_URL=... node scripts/test-login.mjs
//   A11Y_SESSION_TOKEN=<value from the JSON> npx playwright test a11y-interactive
// The script's guards (ADR 0016) still decide whether a token can be minted.
const TOKEN = process.env.A11Y_SESSION_TOKEN;
const RULES = ["landmark-unique", "scrollable-region-focusable", "color-contrast", "heading-order"];

test.skip(!TOKEN, "set A11Y_SESSION_TOKEN (see scripts/test-login.mjs) to run");

test("interactive analysis page has none of the four #146 axe rule failures", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([{ name: "next-auth.session-token", value: TOKEN!, url: baseURL! }]);
  await page.goto("/analyze/interactive");
  await page.waitForLoadState("networkidle");

  // Run an analysis so the scores, categories and details are rendered.
  await page.setInputFiles("input[type=file]", {
    name: "resume.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      "Jane Doe\nSoftware Engineer\nSkills: TypeScript, React, Node, PostgreSQL\nExperience: 5 years at Acme.\n",
    ),
  });
  await expect(page.locator("textarea[readonly]")).not.toHaveValue("");
  await page.locator("textarea:not([readonly])").fill("Senior TypeScript React engineer, Node.");
  await page.getByRole("button", { name: "Start Analysis" }).click();
  await expect(page.getByRole("button", { name: "Show Input Form" })).toBeVisible({
    timeout: 20_000,
  });
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  const failing = results.violations
    .filter((v) => RULES.includes(v.id))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(failing).toEqual([]);
});
