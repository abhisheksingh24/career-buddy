import { requireSession } from "@/lib/require-session";
import type { ReactNode } from "react";

export default async function InteractiveLayout({ children }: { children: ReactNode }) {
  await requireSession("/analyze/interactive");
  return <>{children}</>;
}
