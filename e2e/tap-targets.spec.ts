import { expect, test } from "@playwright/test";

// Tap-target rule (docs/ux/principles.md): at phone width every control a
// visitor taps is at least 44px high. Covers the public Home screen and header;
// the signed-in screens share the same Button, Tabs and header classes.
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
