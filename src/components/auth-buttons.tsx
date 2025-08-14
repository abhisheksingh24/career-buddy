"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { status } = useSession();

  if (status === "loading") {
    return <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-600">...</button>;
  }

  if (status === "authenticated") {
    return (
      <button
        className="px-3 py-1.5 rounded bg-gray-900 text-white"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      className="px-3 py-1.5 rounded bg-gray-900 text-white"
      onClick={() => signIn("google")}
    >
      Sign in
    </button>
  );
}


