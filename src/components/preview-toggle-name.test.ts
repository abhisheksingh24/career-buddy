import { describe, expect, it } from "vitest";

import layout from "./interactive-analysis-layout.tsx?raw";

// #164: WCAG 2.5.3 Label in Name. The preview bar is named by its visible text.
describe("resume preview toggle bar", () => {
  const start = layout.indexOf('"Hide Resume Preview"');
  const button = layout.slice(
    layout.lastIndexOf("<button", start),
    layout.indexOf("</button>", start),
  );

  it("has no aria-label overriding the visible text", () => {
    expect(button).not.toMatch(/aria-label/);
  });

  it("shows Show/Hide Resume Preview and exposes its state", () => {
    expect(button).toContain("Hide Resume Preview");
    expect(button).toContain("Show Resume Preview");
    expect(button).toMatch(/aria-expanded=\{rightPanelOpen\}/);
  });
});
