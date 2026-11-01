import { describe, expect, it } from "vitest";

import nav from "./category-navigation.tsx?raw";
import page from "../app/(app)/analyze/interactive/page.tsx?raw";

// #153: cards are real buttons so Tab/Enter/Space work and state is announced.
describe("category navigation", () => {
  it("renders each card as a button with aria-pressed and a focus ring", () => {
    expect(nav).toMatch(/<button[\s\S]*?type="button"/);
    expect(nav).toMatch(/aria-pressed=\{isActive\}/);
    expect(nav).toMatch(/focus-visible:ring-2/);
  });
  it("selects via the button's onClick", () => {
    expect(nav).toMatch(/onClick=\{\(\) => onCategorySelect\(category\.id\)\}/);
  });
});

// #151: the setup form's file label names the input.
describe("interactive setup form", () => {
  it("ties the label to the file input", () => {
    expect(page).toMatch(/htmlFor="resume-file"/);
    expect(page).toMatch(/id="resume-file"/);
  });
});
