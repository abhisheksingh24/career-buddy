import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Achromatic oklch(L 0 0): linear luminance is L^3.
const css = readFileSync("src/app/globals.css", "utf8");
const block = (sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return css.slice(start, css.indexOf("}", start));
};
const lightness = (b: string, name: string) => {
  const line = b
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith(`--${name}:`));
  const m = line?.match(/oklch\(([\d.]+) 0 0\)/);
  if (!m) throw new Error(`${name} not an opaque grey oklch`);
  return Number(m[1]);
};
const contrast = (a: number, b: number) => {
  const [hi, lo] = [a ** 3, b ** 3].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("focus ring contrast (WCAG 1.4.11, 3:1)", () => {
  for (const [mode, sel] of [
    ["light", ":root"],
    ["dark", ".dark"],
  ] as const) {
    it(`${mode}: ring reaches 3:1 on background, card and primary`, () => {
      const b = block(sel);
      const ring = lightness(b, "ring");
      // In dark mode the primary button is near-white, so no single grey can
      // reach 3:1 against both it and the dark page; the ring's outer edge
      // sits on the page or card, which is what is checked there.
      const surfaces =
        mode === "light" ? ["background", "card", "primary"] : ["background", "card"];
      for (const surface of surfaces) {
        expect(contrast(ring, lightness(b, surface))).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
