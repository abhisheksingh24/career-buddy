import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

// Only these paths may be used as a post-sign-in destination (no open redirect).
const ALLOWED_RETURN_PATHS = ["/analyze", "/analyze/interactive", "/upload"] as const;

export function signInUrl(returnPath: string): string {
  const safe = (ALLOWED_RETURN_PATHS as readonly string[]).includes(returnPath)
    ? returnPath
    : "/dashboard";
  return `/api/auth/signin?callbackUrl=${encodeURIComponent(safe)}`;
}

// Server-side page guard: sends signed-out visitors to sign-in, then back to returnPath.
export async function requireSession(returnPath: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(signInUrl(returnPath));
}
