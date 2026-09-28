"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { generateBuildPlan, isAgentFramework, type FileNode } from "@/lib/architect/agent-sim";
import { MODELS, type ModelId, type ProjectMessage, type WorkspaceMode } from "@/lib/architect/types";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { CodePanel } from "@/components/workspace/code-panel";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { GitForkPanel } from "@/components/workspace/github-panel";
import { DeployPanel } from "@/components/workspace/deploy-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Layout, Rocket, RotateCcw, Sparkles, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";
import { GitFork } from "lucide-react";

type Tab = "preview" | "code" | "agent" | "github" | "deploy";

const DEMO_PROJECT_NAME = "Support Triage Agent";
const DEMO_PROMPT =
  "Build a support agent that reads incoming tickets, checks our docs for the answer, and drafts a reply — escalating to a human when it isn't confident.";
const DEMO_FRAMEWORK = "langgraph";
const DEMO_ID = "demo";
const DEMO_USER = "demo";

let localCounter = 0;
function localId() {
  localCounter += 1;
  return `demo_${localCounter}`;
}

export function DemoWorkspace() {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [mode, setMode] = useState<WorkspaceMode>("pro");
  const [model, setModel] = useState<ModelId>("claude");
  const [status, setStatus] = useState<"draft" | "building" | "ready" | "deployed">("draft");
  const [githubRepo, setGithubRepo] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [previewDescription, setPreviewDescription] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const ran = useRef(false);

  function pushMessage(role: ProjectMessage["role"], content: string, stepKind: ProjectMessage["step_kind"] = null) {
    setMessages((prev) => [
      ...prev,
      { id: localId(), project_id: DEMO_ID, user_id: DEMO_USER, role, content, step_kind: stepKind, created_at: new Date().toISOString() },
    ]);
  }

  async function runBuild(prompt: string) {
    setIsBuilding(true);
    setStatus("building");
    const plan = generateBuildPlan(prompt, DEMO_FRAMEWORK);
    setFiles(plan.files);
    setPreviewDescription(plan.previewDescription);

    for (const step of plan.trace) {
      pushMessage("agent", `${step.title}\n${step.detail}`, step.kind);
      await new Promise((r) => setTimeout(r, Math.min(step.durationMs, 900) / 3));
    }
    pushMessage("agent", plan.summary, null);
    setStatus("ready");
    setIsBuilding(false);
  }

  async function runDemo() {
    setMessages([]);
    setGithubRepo(null);
    setDeployUrl(null);
    setIsBuilding(true);
    setStatus("building");
    pushMessage("user", DEMO_PROMPT, null);
    await new Promise((r) => setTimeout(r, 400));
    await runBuild(DEMO_PROMPT);
  }

  function handleSend(text: string) {
    pushMessage("user", text, null);
    runBuild(text);
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    queueMicrotask(() => runDemo());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectGithub() {
    await new Promise((r) => setTimeout(r, 1000));
    setGithubRepo("shriyashish-mishra/support-triage-agent");
  }

  async function deploy() {
    await new Promise((r) => setTimeout(r, 300));
    setDeployUrl("support-triage-agent.architect.app");
    setStatus("deployed");
  }

  const STATUS_TONE = { draft: "neutral", building: "warning", ready: "blue", deployed: "success" } as const;

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
      <div className="flex shrink-0 items-center gap-3 border-b border-border-subtle bg-accent/10 px-4 py-2 text-sm">
        <Sparkles className="size-4 text-accent" />
        <span>
          <span className="font-medium text-text">Live demo</span>
          <span className="text-text-muted"> — no sign-up, nothing you do here is saved.</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={runDemo} disabled={isBuilding}>
            <RotateCcw className="size-3.5" /> Replay
          </Button>
          <Link href="/auth/sign-up">
            <Button size="sm">Build your own, free</Button>
          </Link>
        </div>
      </div>

      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle px-4">
        <span className="w-48 shrink-0 truncate text-sm font-semibold sm:w-64">{DEMO_PROJECT_NAME}</span>
        <Badge tone={STATUS_TONE[status]}>{status}</Badge>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
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
                onClick={() => setMode(m)}
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
              <PreviewPanel title={DEMO_PROJECT_NAME} description={previewDescription} isBuilding={isBuilding} slug="support-triage-agent" isAgent={isAgentFramework(DEMO_FRAMEWORK)} />
            )}
            {effectiveTab === "code" && <CodePanel files={files} projectName={DEMO_PROJECT_NAME} />}
            {effectiveTab === "agent" && <AgentPanel messages={messages} model={MODELS.find((m) => m.id === model)?.label ?? model} isBuilding={isBuilding} />}
            {effectiveTab === "github" && <GitForkPanel repo={githubRepo} onConnect={connectGithub} />}
            {effectiveTab === "deploy" && <DeployPanel deployUrl={deployUrl} onDeploy={deploy} />}
          </div>
        </div>
      </div>
    </div>
  );
}
