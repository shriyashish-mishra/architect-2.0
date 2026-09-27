"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitFork, GitCommit, GitBranch, Check } from "lucide-react";

const FAKE_COMMITS = [
  "feat: scaffold project from prompt",
  "fix: type error in Hero component",
  "chore: agent self-review pass",
];

export function GitForkPanel({
  repo,
  onConnect,
}: {
  repo: string | null;
  onConnect: () => Promise<void>;
}) {
  const [connecting, setConnecting] = useState(false);

  if (!repo) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <GitFork className="size-8 text-text-faint" />
        <div>
          <h3 className="font-semibold">Connect GitHub</h3>
          <p className="mt-1 max-w-xs text-sm text-text-muted">
            Every project lives in a real repo. Connect once and every change the agent makes
            becomes a commit you can review.
          </p>
        </div>
        <Button
          disabled={connecting}
          onClick={async () => {
            setConnecting(true);
            await onConnect();
            setConnecting(false);
          }}
        >
          <GitFork className="size-4" /> {connecting ? "Connecting…" : "Connect with GitHub"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-raised-2 px-3 py-2.5">
        <GitFork className="size-4" />
        <span className="font-mono text-sm">{repo}</span>
        <Badge tone="success" className="ml-auto">
          <Check className="size-3" /> connected
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <GitBranch className="size-3.5" /> main
        <span className="text-text-faint">· 3 commits</span>
        <Button variant="outline" size="sm" className="ml-auto">
          Push latest changes
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {FAKE_COMMITS.map((c, i) => (
          <li key={c} className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm">
            <GitCommit className="size-3.5 shrink-0 text-text-faint" />
            <span className="truncate">{c}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-text-faint">
              {["a1c9f2e", "4b8d01a", "e7f3c56"][i]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
