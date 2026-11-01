"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { rateLimitMessage, revealAlert } from "@/lib/retry-wait";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * The "too many requests" notice. Mount it only while the user must wait: it
 * scrolls itself into view on mount. Its text is constant so the live region
 * is announced once, not every second.
 */
export function RateLimitAlert() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    revealAlert(ref.current, reduced);
  }, []);
  return (
    <Alert ref={ref} variant="destructive" role="status">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{rateLimitMessage()}</AlertDescription>
    </Alert>
  );
}
