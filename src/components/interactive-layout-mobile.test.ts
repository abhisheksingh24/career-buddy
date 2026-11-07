import { describe, expect, it } from "vitest";

import layout from "./interactive-analysis-layout.tsx?raw";

// Phone layout (#152): the categories list must be height-capped and the
// details region must not be a shrinkable flex child (it collapsed to 0px).
describe("interactive layout, phone branch", () => {
  const phone = layout.slice(layout.indexOf("Mobile: Stacked Layout"));
  const nav = phone.slice(phone.indexOf('aria-label="Analysis categories"'));
  const details = phone.slice(phone.indexOf('aria-label="Category details"'));

  it("caps the categories list height and lets it scroll", () => {
    expect(nav.slice(0, 200)).toMatch(/max-h-\[40vh\]/);
    expect(nav.slice(0, 200)).toMatch(/overflow-y-auto/);
  });

  it("keeps the details at natural height", () => {
    expect(details.slice(0, 250)).toMatch(/flex-shrink-0/);
    expect(details.slice(0, 250)).not.toMatch(/flex-1/);
  });

  it("scrolls the whole stack", () => {
    expect(phone.slice(0, 250)).toMatch(/flex-1 overflow-y-auto/);
  });
});
