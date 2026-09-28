"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateBuildPlan, generateImportPlan, isAgentFramework, type BuildPlan, type FileNode } from "@/lib/architect/agent-sim";
import { MODELS, type ModelId, type Project, type ProjectMessage, type WorkspaceMode } from "@/lib/architect/types";
import { ChatPanel } from "./chat-panel";
import { PreviewPanel } from "./preview-panel";
import { CodePanel } from "./code-panel";
import { AgentPanel } from "./agent-panel";
import { GitForkPanel } from "./github-panel";
import { DeployPanel } from "./deploy-panel";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code2, GitFork, Layout, Rocket, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "preview" | "code" | "agent" | "github" | "deploy";

const STATUS_TONE = {
  draft: "neutral",
  building: "warning",
  ready: "blue",
  deployed: "success",
  error: "danger",
} as const;

export function Workspace({
  project,
  initialMessages,
  runOnMount,
}: {
  project: Project;
  initialMessages: ProjectMessage[];
  runOnMount: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages);
  const [mode, setMode] = useState<WorkspaceMode>(project.mode);
  const [model, setModel] = useState<ModelId>(project.model);
  const [status, setStatus] = useState(project.status);
  const [name, setName] = useState(project.name);
  const [githubRepo, setGitForkRepo] = useState(project.github_repo);
  const [deployUrl, setDeployUrl] = useState(project.deploy_url);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [preview, setPreview] = useState({ title: project.name, description: "" });
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const ran = useRef(false);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "app";
  // Only the very first build for an imported project should read as an
  // import ("clone, read structure, confirm it builds"); any follow-up
  // prompt after that is a normal build on top of it.
  const importedRepo = project.description?.startsWith("import:")
    ? project.description.slice("import:".length)
    : null;

  async function persistMessage(role: ProjectMessage["role"], content: string, stepKind: ProjectMessage["step_kind"] = null) {
    const optimistic: ProjectMessage = {
      id: crypto.randomUUID(),
      project_id: project.id,
      user_id: project.user_id,
      role,
      content,
      step_kind: stepKind,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await supabase.from("project_messages").insert({
      project_id: project.id,
      user_id: auth.user.id,
      role,
      content,
      step_kind: stepKind,
    });
  }

  async function setProjectStatus(next: typeof status) {
    setStatus(next);
    await supabase.from("projects").update({ status: next }).eq("id", project.id);
  }

  async function runPlan(plan: BuildPlan) {
    setIsBuilding(true);
    await setProjectStatus("building");
    setFiles(plan.files);
    setPreview({ title: plan.previewTitle, description: plan.previewDescription });

    for (const step of plan.trace) {
      await persistMessage("agent", `${step.title}\n${step.detail}`, step.kind);
      await new Promise((r) => setTimeout(r, Math.min(step.durationMs, 900) / 2.2));
    }
    await persistMessage("agent", plan.summary, null);
    await setProjectStatus("ready");
    setIsBuilding(false);
  }

  // Normal build/edit, used for every prompt after the project exists.
  async function runBuild(prompt: string) {
    await runPlan(generateBuildPlan(prompt, project.framework));
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Deferred a tick so the state updates below are a reaction to mount,
    // not part of the synchronous effect commit.
    queueMicrotask(() => {
      const lastUserPrompt = [...initialMessages].reverse().find((m) => m.role === "user")?.content;
      if (!lastUserPrompt) return;

      // Imports get their own plan (clone -> read structure -> confirm it
      // builds) instead of the from-scratch build sequence.
      const initialPlan = importedRepo
        ? generateImportPlan(importedRepo, project.framework)
        : generateBuildPlan(lastUserPrompt, project.framework);

      if (runOnMount) {
        router.replace(`/app/projects/${project.id}`);
        runPlan(initialPlan);
      } else {
        setFiles(initialPlan.files);
        setPreview({ title: initialPlan.previewTitle, description: initialPlan.previewDescription });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend(text: string) {
    await persistMessage("user", text, null);
    runBuild(text);
  }

  async function updateMode(next: WorkspaceMode) {
    setMode(next);
    await supabase.from("projects").update({ mode: next }).eq("id", project.id);
  }

  async function updateModel(next: ModelId) {
    setModel(next);
    await supabase.from("projects").update({ model: next }).eq("id", project.id);
  }

  async function connectGitFork() {
    await new Promise((r) => setTimeout(r, 1100));
    const repo = `shriyashish-mishra/${slug}`;
    setGitForkRepo(repo);
    await supabase.from("projects").update({ github_repo: repo }).eq("id", project.id);
  }

  async function deploy() {
    const url = `${slug}.architect.app`;
    setDeployUrl(url);
    await setProjectStatus("deployed");
    await supabase.from("projects").update({ deploy_url: url }).eq("id", project.id);
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] =
    mode === "pro"
      ? [
          { id: "preview", label: "Preview", icon: Layout },
          { id: "code", label: "Code", icon: Code2 },
          { id: "agent", label: "Agent", icon: Waypoints },
          { id: "github", label: "GitHub", icon: GitFork },
          { id: "deploy", label: "Deploy", icon: Rocket },
        ]
      : [
          { id: "preview", label: "Preview", icon: Layout },
          { id: "github", label: "GitHub", icon: GitFork },
          { id: "deploy", label: "Deploy", icon: Rocket },
        ];

  const effectiveTab: Tab = tabs.find((t) => t.id === activeTab) ? activeTab : "preview";

  return (
    <div className="flex h-screen min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle px-4">
        <Link href="/app" className="rounded-md p-1.5 text-text-faint hover:bg-bg-raised-2 hover:text-text">
          <ArrowLeft className="size-4" />
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => supabase.from("projects").update({ name }).eq("id", project.id).then(() => {})}
          className="w-48 shrink-0 truncate bg-transparent text-sm font-semibold outline-none focus:underline sm:w-64"
        />
        <Badge tone={STATUS_TONE[status]}>{status}</Badge>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => updateModel(e.target.value as ModelId)}
            className="h-8 rounded-md border border-border-strong bg-bg px-2 text-xs text-text-muted outline-none hover:text-text"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          <div className="flex items-center rounded-md border border-border-strong p-0.5 text-xs">
            {(["vibe", "pro"] as const).map((m) => (
              <button
                key={m}
                onClick={() => updateMode(m)}
                className={cn(
                  "rounded px-2.5 py-1 capitalize transition-colors",
                  mode === m ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[380px_1fr]">
        <div className="min-h-0 border-r border-border-subtle">
          <ChatPanel messages={messages} isBuilding={isBuilding} onSend={handleSend} />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center gap-1 border-b border-border-subtle px-3 py-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  effectiveTab === t.id ? "bg-bg-raised-2 text-text" : "text-text-muted hover:text-text",
                )}
              >
                <t.icon className="size-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1">
            {effectiveTab === "preview" && (
              <PreviewPanel title={preview.title || name} description={preview.description} isBuilding={isBuilding} slug={slug} isAgent={isAgentFramework(project.framework)} />
            )}
            {effectiveTab === "code" && <CodePanel files={files} projectName={name} />}
            {effectiveTab === "agent" && <AgentPanel messages={messages} model={MODELS.find((m) => m.id === model)?.label ?? model} isBuilding={isBuilding} />}
            {effectiveTab === "github" && <GitForkPanel repo={githubRepo} onConnect={connectGitFork} />}
            {effectiveTab === "deploy" && <DeployPanel deployUrl={deployUrl} onDeploy={deploy} />}
          </div>
        </div>
      </div>
    </div>
  );
}
