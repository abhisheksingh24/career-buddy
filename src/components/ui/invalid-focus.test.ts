import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const block = (sel: string) => {
  const start = css.indexOf(`${sel} {`);
  return css.slice(start, css.indexOf("}", start));
};

// oklch -> relative luminance (Y of linear sRGB).
function luminance(l: number, c: number, hDeg: number) {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  const cl = (x: number) => Math.min(1, Math.max(0, x));
  return 0.2126 * cl(r) + 0.7152 * cl(g) + 0.0722 * cl(bl);
}
const token = (b: string, name: string) => {
  const line = b
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith(`--${name}:`));
  const m = line?.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
  if (!m) throw new Error(`${name} not an opaque oklch`);
  return luminance(Number(m[1]), Number(m[2]), Number(m[3]));
};
const contrast = (x: number, y: number) => (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);

describe("focused invalid buttons and badges", () => {
  for (const file of ["button", "badge"]) {
    it(`${file} uses the full-strength destructive ring when focused and invalid`, () => {
      const src = readFileSync(`src/components/ui/${file}.tsx`, "utf8");
      expect(src).toContain("focus-visible:aria-invalid:ring-destructive");
      expect(src).toContain("dark:focus-visible:aria-invalid:ring-destructive");
      // unfocused styling unchanged
      expect(src).toContain("aria-invalid:ring-destructive/20");
    });
  }

  for (const [mode, sel] of [
    ["light", ":root"],
    ["dark", ".dark"],
  ] as const) {
    it(`${mode}: full destructive ring reaches 3:1 on the page`, () => {
      const b = block(sel);
      expect(contrast(token(b, "destructive"), token(b, "background"))).toBeGreaterThanOrEqual(3);
    });
  }
});
