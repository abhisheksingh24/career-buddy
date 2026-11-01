/** "1 second" / "5 seconds". */
export function formatSeconds(n: number): string {
  return `${n} ${n === 1 ? "second" : "seconds"}`;
}

/** The message shown while the user must wait before analysing again. */
export function rateLimitMessage(secondsLeft: number): string {
  return `You're doing that too quickly. Please wait ${formatSeconds(secondsLeft)} and try again.`;
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
