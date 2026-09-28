"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { signUpWithPassword, continueAsGuest, type AuthState } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { GithubSignInButton } from "@/components/github-signin-button";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUpWithPassword,
    null,
  );
  const [guestPending, startGuest] = useTransition();
  const [guestError, setGuestError] = useState<string | null>(null);

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free to start. No card required."
      footer={
        <>
          Already building?{" "}
          <Link href="/auth/sign-in" className="text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-9 rounded-lg border border-border-strong bg-bg px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            className="h-9 rounded-lg border border-border-strong bg-bg px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.info && <p className="text-sm text-success">{state.info}</p>}
        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-text-faint">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <GithubSignInButton />
        <Button
          variant="outline"
          className="w-full"
          disabled={guestPending}
          onClick={() =>
            startGuest(async () => {
              setGuestError(null);
              const res = await continueAsGuest();
              if (res?.error) setGuestError(res.error);
            })
          }
        >
          <Sparkles className="size-4" /> {guestPending ? "Signing in…" : "Try it without an account"}
        </Button>
        {guestError && <p className="text-sm text-danger">{guestError}</p>}
      </div>
    </AuthCard>
  );
}
