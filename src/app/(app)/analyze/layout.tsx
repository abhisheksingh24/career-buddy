import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";

// Analyze pages need a signed-in user (their API calls are guarded too).
export default async function AnalyzeLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/analyze")}`);
  }
  return <>{children}</>;
}
