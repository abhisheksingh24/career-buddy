import { buildCsp } from "@/lib/security-headers";
import { NextResponse, type NextRequest } from "next/server";

// Runs on every page request: makes a fresh nonce and enforces the CSP with it.
// Next reads the nonce from the request's CSP header and stamps it on its own
// scripts.
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: not API routes or static assets. Skip prefetches, whose
      // responses are never rendered as documents.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
