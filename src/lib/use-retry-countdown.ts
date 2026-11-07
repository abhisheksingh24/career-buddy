"use client";

import { useCallback, useEffect, useState } from "react";
import { secondsLeft } from "@/lib/retry-wait";

/**
 * Counts down from a wait in seconds. Based on a deadline, not on counting
 * ticks, so it stays accurate when the tab is throttled in the background.
 */
export function useRetryCountdown() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const left = secondsLeft(deadline, Date.now());
      setRemaining(left);
      if (left === 0) setDeadline(null);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);

  const start = useCallback((seconds: number) => setDeadline(Date.now() + seconds * 1000), []);
  return { remaining, start };
}
