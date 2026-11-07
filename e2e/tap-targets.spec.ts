import { expect, test, type Page } from "@playwright/test";

// Tap-target rule (docs/ux/principles.md): at phone width every control a
// visitor taps is at least 44px high. The public Home screen runs everywhere;
// the signed-in screens run only with a session (see below).
test.use({ viewport: { width: 390, height: 844 } });

test("Home header and links are at least 44px high on a phone", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const controls = page.locator("header a, header button, main a, main button");
  const count = await controls.count();
  expect(count).toBeGreaterThanOrEqual(6);
  for (let i = 0; i < count; i++) {
    const box = await controls.nth(i).boundingBox();
    const label = (await controls.nth(i).innerText()).trim();
    expect(box?.height ?? 0, `"${label}" height`).toBeGreaterThanOrEqual(44);
  }
});

// Signed-in screens need a session, and a session needs a database, which CI
// does not have. So these run only when A11Y_SESSION_TOKEN is set (a token from
// scripts/test-login.mjs against a running instance; see docs/ux/design-system.md,
// "Checking tap targets"). Text fields are excluded: their heights are owned by
// the form-field work, not this rule.
const token = process.env.A11Y_SESSION_TOKEN;

const SIGNED_IN_SCREENS = ["/dashboard", "/profile", "/upload", "/analyze", "/analyze/interactive"];

async function shortControls(page: Page) {
  return page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "a, button, [role=tab], [role=combobox], [role=checkbox], [role=switch], summary, input[type=file], input[type=checkbox], input[type=radio], select",
      ),
    ]
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && r.height < 44)
      .map(({ e, r }) => ({
        label: ((e as HTMLElement).innerText || e.getAttribute("aria-label") || e.tagName)
          .trim()
          .slice(0, 40),
        height: Math.round(r.height),
      })),
  );
}

test.describe("signed-in screens", () => {
  test.skip(!token, "set A11Y_SESSION_TOKEN to run the signed-in tap-target checks");

  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: token ?? "",
        url: baseURL ?? "http://localhost:3917",
      },
    ]);
  });

  for (const path of SIGNED_IN_SCREENS) {
    test(`${path} controls are at least 44px high on a phone`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(new URL(page.url()).pathname, "stayed signed in").toBe(path);
      expect(await shortControls(page)).toEqual([]);
    });
  }

  test("/analyze/interactive controls stay at least 44px once the form is filled", async ({
    page,
  }) => {
    await page.goto("/analyze/interactive");
    await page.waitForLoadState("networkidle");
    await page.getByPlaceholder("e.g., Software Engineer", { exact: true }).fill("Engineer");
    await page.getByPlaceholder("e.g., Google").fill("Acme");
    await page
      .getByPlaceholder("Paste the job description here...")
      .fill("We need React and TypeScript skills.");
    expect(await shortControls(page)).toEqual([]);
  });
});
