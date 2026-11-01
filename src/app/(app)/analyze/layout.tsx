import type { ReactNode } from "react";

// Sign-in guards live in the nested layouts so each page returns to itself.
export default function AnalyzeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
