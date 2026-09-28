"use client";

import { useActionState, useState, useTransition } from "react";
import { signInWithPassword, continueAsGuest, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { GithubSignInButton } from "@/components/github-signin-button";
import { Sparkles } from "lucide-react";

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInWithPassword,
    null,
  );
  const [guestPending, startGuest] = useTransition();
  const [guestError, setGuestError] = useState<string | null>(null);

  return (
    <>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" placeholder="you@company.com" />
        <Field label="Password" name="password" type="password" placeholder="••••••••" />
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-text-faint">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <GithubSignInButton next={next} />
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
          <Sparkles className="size-4" /> {guestPending ? "Signing in…" : "Continue as guest"}
        </Button>
        {guestError && <p className="text-sm text-danger">{guestError}</p>}
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="h-9 rounded-lg border border-border-strong bg-bg px-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
