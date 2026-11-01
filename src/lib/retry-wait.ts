/**
 * The message shown while the user must wait before analysing again. It is
 * constant on purpose: it sits in a live region, and text that changed every
 * second would be re-announced every second. The countdown lives in the button.
 */
export function rateLimitMessage(): string {
  return "You're doing that too quickly. Please wait a moment and try again.";
}

/** Whole seconds from a Retry-After header value, or null if absent or invalid. */
export function parseRetryAfter(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return n > 0 ? n : null;
}

/** Whole seconds left until the deadline (ms epoch), never negative. */
export function secondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
