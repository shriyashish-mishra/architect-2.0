"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProject, importProject, listGithubRepos, type GithubRepo } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGENT_FRAMEWORKS, FRAMEWORKS, MODELS, type Framework, type ModelId, type ProjectKind } from "@/lib/architect/types";
import { ArrowUp, GitFork, Upload, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const APP_TEMPLATES = [
  "A waitlist landing page with a Supabase-backed signup form",
  "An internal dashboard that summarizes weekly support tickets",
  "A habit tracker with streaks and a weekly email digest",
];

const AGENT_TEMPLATES = [
  "A customer support agent that answers from our docs and escalates edge cases",
  "A research agent that reads a set of URLs and writes a summary memo",
  "An on-call triage agent that reads alerts and drafts an incident summary",
];

const FAKE_REPOS = [
  "shriyashish-mishra/internal-tool",
  "shriyashish-mishra/landing-page-v1",
  "shriyashish-mishra/support-bot",
];

export function NewProjectForm() {
  const [kind, setKind] = useState<ProjectKind>("app");
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<Framework>("nextjs");
  const [model, setModel] = useState<ModelId>("claude");
  const [pending, startTransition] = useTransition();
  const [importOpen, setImportOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const importRef = useRef<HTMLDivElement>(null);

  const frameworkOptions = kind === "app" ? FRAMEWORKS : AGENT_FRAMEWORKS;
  const templates = kind === "app" ? APP_TEMPLATES : AGENT_TEMPLATES;

  function selectKind(next: ProjectKind) {
    setKind(next);
    setFramework(next === "app" ? "nextjs" : "langgraph");
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (importRef.current && !importRef.current.contains(e.target as Node)) setImportOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-center gap-1 rounded-md border border-border-strong p-0.5 text-xs w-fit mx-auto">
        {(["app", "agent"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => selectKind(k)}
            className={cn(
              "rounded px-3 py-1 capitalize transition-colors",
              kind === k ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text",
            )}
          >
            Build {k === "app" ? "an app" : "an agent"}
          </button>
        ))}
      </div>

      <form
        ref={formRef}
        action={(fd) => startTransition(() => createProject(fd))}
        className="w-full rounded-2xl border border-border-strong bg-bg-raised shadow-xl shadow-black/20"
      >
        <textarea
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={kind === "app" ? "Describe the app you want to build…" : "Describe the agent you want to build — what it does, what tools it needs…"}
          rows={3}
          className="w-full resize-none bg-transparent px-5 pt-5 pb-2 text-base outline-none placeholder:text-text-faint"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-4 py-3">
          <Select
            value={framework}
            onChange={(v) => setFramework(v as Framework)}
            options={frameworkOptions.map((f) => ({ value: f.id, label: f.label }))}
          />
          <Select
            value={model}
            onChange={(v) => setModel(v as ModelId)}
            options={MODELS.map((m) => ({ value: m.id, label: m.label }))}
          />
          <input type="hidden" name="framework" value={framework} />
          <input type="hidden" name="model" value={model} />

          <div className="relative" ref={importRef}>
            <button
              type="button"
              onClick={() => setImportOpen((v) => !v)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong px-2.5 text-xs text-text-muted hover:text-text"
            >
              <GitFork className="size-3.5" /> Import repo
            </button>
            {importOpen && <ImportMenu onClose={() => setImportOpen(false)} />}
          </div>
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong px-2.5 text-xs text-text-muted hover:text-text"
            title="Upload a project zip (coming soon in this demo)"
          >
            <Upload className="size-3.5" /> Upload project
          </button>

          <div className="ml-auto">
            <Button
              type="submit"
              size="icon"
              disabled={!prompt.trim() || pending}
              title="Build it"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border-subtle px-4 py-3">
          {templates.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPrompt(t)}
              className={cn(
                "rounded-full border border-border-strong px-3 py-1 text-xs text-text-muted hover:border-accent/50 hover:text-text",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

function ImportMenu({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<string | null>(null);
  // undefined = still loading; null = no GitHub account connected (fall
  // back to the illustrative list); array = your real repos.
  const [repos, setRepos] = useState<GithubRepo[] | null | undefined>(undefined);

  useEffect(() => {
    listGithubRepos().then(setRepos);
  }, []);

  function pick(repo: string) {
    setPicked(repo);
    const fd = new FormData();
    fd.set("repo", repo);
    fd.set("framework", "nextjs");
    startTransition(() => importProject(fd));
  }

  const isReal = Array.isArray(repos);
  const items = isReal
    ? repos
    : FAKE_REPOS.map((full) => ({ fullName: full, name: full.split("/")[1], private: false, updatedAt: "" }));

  return (
    <div className="absolute left-0 top-9 z-20 w-72 rounded-lg border border-border-strong bg-bg-raised-2 p-1.5 shadow-xl">
      <p className="flex items-center justify-between px-2 py-1.5 text-[11px] uppercase tracking-wider text-text-faint">
        <span>{isReal ? "Your GitHub repos" : "Example repos"}</span>
        {isReal && <Badge tone="success">connected</Badge>}
      </p>
      {!isReal && (
        <p className="px-2 pb-1.5 text-[11px] text-text-faint">
          Illustrative — sign in with GitHub to import your real repos.
        </p>
      )}
      {repos === undefined ? (
        <p className="px-2 py-2 text-xs text-text-faint">Loading…</p>
      ) : isReal && repos.length === 0 ? (
        <p className="px-2 py-2 text-xs text-text-faint">No repos found on your account.</p>
      ) : (
        items.map((repo) => (
          <button
            key={repo.fullName}
            type="button"
            disabled={pending}
            onClick={() => pick(repo.fullName)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-text-muted hover:bg-bg-overlay hover:text-text disabled:opacity-60"
          >
            <GitFork className="size-3.5 shrink-0" />
            <span className="flex-1 truncate">{repo.name}</span>
            {repo.private && <Lock className="size-3 shrink-0 text-text-faint" />}
            {picked === repo.fullName && (pending ? <span className="pulse-dot size-1.5 rounded-full bg-accent" /> : <Check className="size-3.5 text-success" />)}
          </button>
        ))
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-xs text-text-faint hover:bg-bg-overlay"
      >
        Cancel
      </button>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-border-strong bg-bg px-2 text-xs text-text-muted outline-none hover:text-text"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
