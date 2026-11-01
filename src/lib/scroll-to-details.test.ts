import { describe, expect, it, vi } from "vitest";

import { scrollToCategoryDetails } from "./scroll-to-details";

function region(visible: boolean) {
  const scrollIntoView = vi.fn();
  return {
    offsetParent: visible ? {} : null,
    scrollIntoView,
  } as unknown as HTMLElement;
}

describe("scrollToCategoryDetails", () => {
  it("scrolls the visible region only", () => {
    const hidden = region(false);
    const shown = region(true);
    const root = { querySelectorAll: () => [hidden, shown] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(true);
    expect(shown.scrollIntoView).toHaveBeenCalledOnce();
    expect(hidden.scrollIntoView).not.toHaveBeenCalled();
  });

  it("reports false when nothing is visible", () => {
    const root = { querySelectorAll: () => [region(false)] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(false);
  });
});
