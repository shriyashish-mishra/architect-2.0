"use client";

import { useRef, useState, useTransition } from "react";
import { createProject } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FRAMEWORKS, MODELS, type Framework, type ModelId } from "@/lib/architect/types";
import { ArrowUp, GitFork, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  "A waitlist landing page with a Supabase-backed signup form",
  "An internal dashboard that summarizes weekly support tickets",
  "A customer support agent that answers from our docs",
  "A habit tracker with streaks and a weekly email digest",
];

export function NewProjectForm() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<Framework>("nextjs");
  const [model, setModel] = useState<ModelId>("claude");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) => startTransition(() => createProject(fd))}
      className="w-full rounded-2xl border border-border-strong bg-bg-raised shadow-xl shadow-black/20"
    >
      <textarea
        name="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the app or agent you want to build…"
        rows={3}
        className="w-full resize-none bg-transparent px-5 pt-5 pb-2 text-base outline-none placeholder:text-text-faint"
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-4 py-3">
        <Select
          value={framework}
          onChange={(v) => setFramework(v as Framework)}
          options={FRAMEWORKS.map((f) => ({ value: f.id, label: f.label }))}
        />
        <Select
          value={model}
          onChange={(v) => setModel(v as ModelId)}
          options={MODELS.map((m) => ({ value: m.id, label: m.label }))}
        />
        <input type="hidden" name="framework" value={framework} />
        <input type="hidden" name="model" value={model} />

        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md border border-border-strong px-2.5 text-xs text-text-muted hover:text-text"
          title="Import an existing repo (coming soon in this demo)"
        >
          <GitFork className="size-3.5" /> Import repo
        </button>
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
        {TEMPLATES.map((t) => (
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
