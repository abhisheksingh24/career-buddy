import { describe, expect, it } from "vitest";

import card from "./action-item-card.tsx?raw";
import navSrc from "./category-navigation.tsx?raw";
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

// Heading outline and focus ring (#154).
describe("interactive layout, heading outline and details focus ring", () => {
  it("puts the shared focus ring on every Category details region", () => {
    const count = (layout.match(/data-category-details/g) ?? []).length;
    expect(count).toBe(4);
    expect((layout.match(/\$\{DETAILS_FOCUS\}/g) ?? []).length).toBe(count);
    expect(layout).toMatch(
      /DETAILS_FOCUS =\s*"[^"]*focus-visible:ring-ring[^"]*focus-visible:ring-\[3px\]/,
    );
    expect(layout).not.toMatch(/focus-visible:ring-blue/);
  });

  it("goes down one heading level at a time", () => {
    expect(navSrc).toMatch(/<h2 [^>]*>Analysis Categories<\/h2>/);
    expect(card).toMatch(/<h3 /);
    expect(card).not.toMatch(/<h4/);
  });
});
