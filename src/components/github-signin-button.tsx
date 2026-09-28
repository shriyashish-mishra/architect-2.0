"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GitFork } from "lucide-react";

export function GithubSignInButton({ next = "/app" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // Supabase's default GitHub scope is just `user:email` — that's not
        // enough to list repos. Ask for `repo` explicitly (needed to see
        // private repos too) so the token this returns can actually back
        // the "Import repo" picker.
        scopes: "read:user user:email repo",
      },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
    // On success the browser is redirected to GitHub, so nothing else runs here.
  }

  return (
    <div>
      <Button variant="secondary" className="w-full" disabled={pending} onClick={signIn}>
        <GitFork className="size-4" /> {pending ? "Redirecting to GitHub…" : "Continue with GitHub"}
      </Button>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
