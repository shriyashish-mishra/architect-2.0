"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitFork, Key, Check, Link2, Globe } from "lucide-react";
import { MODELS } from "@/lib/architect/types";

export function SettingsForm({ email, isAnonymous }: { email: string; isAnonymous: boolean }) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [ghConnected, setGhConnected] = useState(false);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="font-semibold">Account</h2>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-text-muted">{isAnonymous ? "Guest session" : "Email"}</span>
          <span>{isAnonymous ? "Not saved — sign up to keep your work" : email}</span>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Model providers</h2>
        <p className="mt-1 text-sm text-text-muted">
          Bring your own API key for any provider, or use Architect&apos;s shared credits.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {MODELS.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Key className="size-4 shrink-0 text-text-faint" />
              <div className="w-36 shrink-0 text-sm">
                <div>{m.label}</div>
                <div className="text-xs text-text-faint">{m.vendor}</div>
              </div>
              <input
                type="password"
                placeholder="Using shared credits"
                value={keys[m.id] ?? ""}
                onChange={(e) => setKeys((prev) => ({ ...prev, [m.id]: e.target.value }))}
                className="h-8 flex-1 rounded-md border border-border-strong bg-bg px-2 font-mono text-xs outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">GitHub</h2>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <GitFork className="size-4" />
            {ghConnected ? "shriyashish-mishra" : "Not connected"}
          </div>
          {ghConnected ? (
            <Badge tone="success"><Check className="size-3" /> connected</Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setGhConnected(true)}>
              Connect
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">About</h2>
        <p className="mt-2 text-sm text-text-muted">
          Architect 2.0 — built by <span className="text-text">Shriyashish Mishra</span> for the
          Lyzr Architect 2.0 hiring assignment (Technical Product Manager · Architect).
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-text-muted">
          <a href="https://github.com/shriyashish-mishra/architect-2.0" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-text">
            <GitFork className="size-3.5" /> GitHub
          </a>
          <a href="https://linkedin.com/in/shriyashish-mishra" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-text">
            <Link2 className="size-3.5" /> LinkedIn
          </a>
          <a href="https://shriyashish.lovable.app" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-text">
            <Globe className="size-3.5" /> Portfolio
          </a>
        </div>
      </Card>
    </div>
  );
}
