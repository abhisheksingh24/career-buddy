"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";


const BENEFITS = ["See how well it fits", "Get suggestions to improve", "Tailor it to one job"];

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export function SignInCard({ callbackUrl, hasError }: { callbackUrl: string; hasError: boolean }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(hasError);

  async function start() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      // On success the browser leaves for Google, so pending stays on.
      await signIn("google", { callbackUrl });
    } catch {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm p-4 sm:py-12">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Career Buddy</p>
          <h1 className="text-2xl leading-tight font-semibold">
            Get your resume scored and tailored to the role you want
          </h1>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="space-y-2 text-sm">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {failed && (
            <Alert variant="destructive">
              <AlertDescription>Couldn&apos;t sign you in. Try again.</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            size="lg"
            className="min-h-11 w-full"
            disabled={pending}
            onClick={start}
          >
            {pending ? (
              "Opening Google..."
            ) : (
              <>
                <GoogleLogo />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            We use Google only to sign you in (your name and email). Your resumes stay private to
            you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
