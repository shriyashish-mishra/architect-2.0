"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEPLOY_STEPS = ["Building", "Provisioning sandbox", "Deploying", "Live"];

export function DeployPanel({
  deployUrl,
  onDeploy,
}: {
  deployUrl: string | null;
  onDeploy: () => Promise<void>;
}) {
  const [deploying, setDeploying] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "DATABASE_URL", value: "••••••••" },
  ]);

  async function runDeploy() {
    setDeploying(true);
    for (let i = 0; i < DEPLOY_STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, 550));
    }
    await onDeploy();
    setDeploying(false);
  }

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto p-5">
      <div>
        <h3 className="text-sm font-medium text-text-muted">Environment variables</h3>
        <div className="mt-2 space-y-2">
          {envVars.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                readOnly
                value={v.key}
                className="h-8 flex-1 rounded-md border border-border-strong bg-bg px-2 font-mono text-xs"
              />
              <input
                readOnly
                value={v.value}
                className="h-8 flex-1 rounded-md border border-border-strong bg-bg px-2 font-mono text-xs"
              />
              <button
                onClick={() => setEnvVars((prev) => prev.filter((_, idx) => idx !== i))}
                className="rounded-md p-1.5 text-text-faint hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setEnvVars((prev) => [...prev, { key: "NEW_VAR", value: "" }])}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
          >
            <Plus className="size-3.5" /> Add variable
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-muted">Deploy</h3>
        {deployUrl && !deploying ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm">
            <Check className="size-4 text-success" />
            <a href="#" className="font-mono text-success hover:underline">{deployUrl}</a>
            <ExternalLink className="size-3.5 text-success" />
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
            {DEPLOY_STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
                  deploying && i === stepIndex && "text-accent",
                  deploying && i < stepIndex && "text-text-faint",
                  !deploying && "text-text-faint",
                )}
              >
                {deploying && i < stepIndex ? (
                  <Check className="size-3" />
                ) : deploying && i === stepIndex ? (
                  <span className="pulse-dot size-1.5 rounded-full bg-accent" />
                ) : (
                  <span className="size-1.5 rounded-full bg-border-strong" />
                )}
                {s}
              </div>
            ))}
          </div>
        )}
        <Button className="mt-3 w-full" disabled={deploying} onClick={runDeploy}>
          <Rocket className="size-4" /> {deployUrl ? "Redeploy" : deploying ? "Deploying…" : "Deploy"}
        </Button>
        <p className="mt-2 text-xs text-text-faint">
          Deploys build the sandbox&apos;s current file state into a production container and
          point a stable URL at it. See ARCHITECTURE.md for how this maps to real infra.
        </p>
      </div>
    </div>
  );
}
