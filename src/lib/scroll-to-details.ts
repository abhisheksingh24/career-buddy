const PHONE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function matches(query: string): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}

/**
 * Scrolls the visible "Category details" region into view. The interactive
 * layout renders one region per breakpoint and hides the others, so pick the
 * one that is actually laid out (#152). Only the stacked phone layout (below
 * 768px) needs this; on tablet and laptop the details are already beside the
 * list, so it does nothing and returns false. Motion is instant when the user
 * prefers reduced motion.
 */
export function scrollToCategoryDetails(root: ParentNode = document): boolean {
  if (!matches(PHONE_QUERY)) return false;
  const regions = Array.from(root.querySelectorAll<HTMLElement>("[data-category-details]"));
  const visible = regions.find((el) => el.offsetParent !== null);
  if (!visible) return false;
  visible.scrollIntoView({
    behavior: matches(REDUCED_MOTION_QUERY) ? "auto" : "smooth",
    block: "nearest",
  });
  return true;
}
