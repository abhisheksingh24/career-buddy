import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollToCategoryDetails } from "./scroll-to-details";

function region(visible: boolean) {
  const scrollIntoView = vi.fn();
  return {
    offsetParent: visible ? {} : null,
    scrollIntoView,
  } as unknown as HTMLElement;
}

function stubMedia(opts: { phone: boolean; reduced?: boolean }) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("max-width") ? opts.phone : !!opts.reduced,
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("scrollToCategoryDetails", () => {
  it("scrolls the visible region only, smoothly", () => {
    stubMedia({ phone: true });
    const hidden = region(false);
    const shown = region(true);
    const root = { querySelectorAll: () => [hidden, shown] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(true);
    expect(shown.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });
    expect(hidden.scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls instantly under prefers-reduced-motion", () => {
    stubMedia({ phone: true, reduced: true });
    const shown = region(true);
    const root = { querySelectorAll: () => [shown] } as unknown as ParentNode;
    scrollToCategoryDetails(root);
    expect(shown.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "nearest" });
  });

  it("does nothing on tablet and desktop widths", () => {
    stubMedia({ phone: false });
    const shown = region(true);
    const root = { querySelectorAll: () => [shown] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(false);
    expect(shown.scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    const shown = region(true);
    const root = { querySelectorAll: () => [shown] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(false);
  });

  it("reports false when nothing is visible", () => {
    stubMedia({ phone: true });
    const root = { querySelectorAll: () => [region(false)] } as unknown as ParentNode;
    expect(scrollToCategoryDetails(root)).toBe(false);
  });
});
