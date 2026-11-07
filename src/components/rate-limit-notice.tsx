"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { rateLimitMessage, revealAlert } from "@/lib/retry-wait";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The "too many requests" notice together with the button it explains. While
 * `active` it shows the alert above the children (the button) and scrolls the
 * pair into view, so the user sees both the message and the countdown. The
 * alert text is constant so the live region is announced once, not every second.
 */
export function RateLimitNotice({ active, children }: { active: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    revealAlert(ref.current, reduced);
  }, [active]);
  return (
    <div ref={ref} className="scroll-mb-6 space-y-4">
      {active && (
        <Alert variant="destructive" role="status">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rateLimitMessage()}</AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
}
