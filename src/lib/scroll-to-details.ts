/**
 * Scrolls the visible "Category details" region into view. The interactive
 * layout renders one region per breakpoint and hides the others, so pick the
 * one that is actually laid out (#152). On the stacked phone layout this brings
 * the chosen category's details on screen; on laptop it is a no-op nudge.
 */
export function scrollToCategoryDetails(root: ParentNode = document): boolean {
  const regions = Array.from(root.querySelectorAll<HTMLElement>("[data-category-details]"));
  const visible = regions.find((el) => el.offsetParent !== null);
  if (!visible) return false;
  visible.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return true;
}
