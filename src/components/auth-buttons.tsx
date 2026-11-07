"use client";

import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { status } = useSession();
  const pathname = usePathname();

  // The sign-in page has its own button; a second one in the header is noise.
  if (pathname === "/signin" && status !== "authenticated") return null;

  if (status === "loading") {
    return (
      <button className="px-3 py-1.5 max-sm:min-h-11 rounded bg-gray-200 text-gray-600">...</button>
    );
  }

  if (status === "authenticated") {
    return (
      <button
        className="px-3 py-1.5 max-sm:min-h-11 rounded bg-gray-900 text-white outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    );
  }

  // The Profile page shows its own sign-in action; one is enough there.
  if (pathname === "/profile") return null;

  return (
    <button
      className="px-3 py-1.5 max-sm:min-h-11 rounded bg-gray-900 text-white outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
      onClick={() => signIn(undefined, { callbackUrl: pathname })}
    >
      Sign in
    </button>
  );
}
