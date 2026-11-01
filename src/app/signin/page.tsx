import { SignInCard } from "@/components/sign-in-card";
import { authOptions } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/callback-url";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export const metadata = { title: "Sign in - Career Buddy" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const destination = safeCallbackUrl(params.callbackUrl);

  const session = await getServerSession(authOptions);
  if (session?.user) redirect(destination);

  return <SignInCard callbackUrl={destination} hasError={Boolean(params.error)} />;
}
