import { requireSession } from "@/lib/require-session";
import type { ReactNode } from "react";

export default async function AnalyzeMainLayout({ children }: { children: ReactNode }) {
  await requireSession("/analyze");
  return <>{children}</>;
}
