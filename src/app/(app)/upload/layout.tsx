import { requireSession } from "@/lib/require-session";
import type { ReactNode } from "react";

// Signed-out visitors go to sign-in and come back here.
export default async function UploadLayout({ children }: { children: ReactNode }) {
  await requireSession("/upload");
  return <>{children}</>;
}
