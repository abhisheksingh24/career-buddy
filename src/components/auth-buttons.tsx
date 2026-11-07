"use client";

import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-600">...</button>;
  }

  if (status === "authenticated") {
    return (
      <button
        className="px-3 py-1.5 rounded bg-gray-900 text-white outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
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
      className="px-3 py-1.5 rounded bg-gray-900 text-white outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
      onClick={() => signIn("google")}
    >
      Sign in
    </button>
  );
}
