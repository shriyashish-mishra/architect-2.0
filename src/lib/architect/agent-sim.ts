// Client-side simulation of an agent build run. Nothing here calls a real
// model — it deterministically turns a prompt into a plausible plan, file
// tree, and tool-call trace so the workspace UI has something real to
// animate. See ARCHITECTURE.md for how this would be replaced by an actual
// agent harness (planner -> tool loop -> sandbox) in production.

export interface FileNode {
  path: string;
  kind: "file" | "dir";
  language?: string;
  children?: FileNode[];
}

export interface AgentTrace {
  id: string;
  kind: "plan" | "write_code" | "run_tool" | "error" | "recover" | "info";
  title: string;
  detail: string;
  durationMs: number;
}

export interface BuildPlan {
  summary: string;
  files: FileNode[];
  trace: AgentTrace[];
  previewTitle: string;
  previewDescription: string;
}

function titleCaseFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const words = cleaned.split(/\s+/).slice(0, 4);
  if (words.length === 0) return "New App";
  return words.map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

let counter = 0;
function id() {
  counter += 1;
  return `t_${Date.now()}_${counter}`;
}

export function generateBuildPlan(prompt: string, framework: string): BuildPlan {
  const subject = titleCaseFromPrompt(prompt) || "New App";

  const files: FileNode[] = [
    {
      path: "app",
      kind: "dir",
      children: [
        { path: "app/layout.tsx", kind: "file", language: "tsx" },
        { path: "app/page.tsx", kind: "file", language: "tsx" },
        { path: "app/globals.css", kind: "file", language: "css" },
      ],
    },
    {
      path: "components",
      kind: "dir",
      children: [
        { path: "components/Hero.tsx", kind: "file", language: "tsx" },
        { path: "components/Nav.tsx", kind: "file", language: "tsx" },
      ],
    },
    {
      path: "agents",
      kind: "dir",
      children: [
        { path: "agents/orchestrator.ts", kind: "file", language: "ts" },
        { path: "agents/tools.ts", kind: "file", language: "ts" },
      ],
    },
    { path: "package.json", kind: "file", language: "json" },
    { path: "README.md", kind: "file", language: "md" },
  ];

  const trace: AgentTrace[] = [
    {
      id: id(),
      kind: "plan",
      title: "Reading your prompt",
      detail: `Breaking "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}" into a build plan: pages, components, data model, and any agents it needs.`,
      durationMs: 900,
    },
    {
      id: id(),
      kind: "plan",
      title: "Drafting the plan",
      detail: `1. Scaffold ${framework} project\n2. Build ${subject} UI (layout, nav, hero, core flow)\n3. Wire up state / data\n4. Add an agent for the dynamic parts\n5. Self-review and fix issues`,
      durationMs: 700,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "sandbox.create()",
      detail: `Provisioning an isolated dev sandbox (${framework}, Node 22) with a live preview URL.`,
      durationMs: 1200,
    },
    {
      id: id(),
      kind: "write_code",
      title: "app/layout.tsx",
      detail: "Setting up root layout, fonts, and global providers.",
      durationMs: 800,
    },
    {
      id: id(),
      kind: "write_code",
      title: "components/Nav.tsx",
      detail: "Writing the navigation shell.",
      durationMs: 600,
    },
    {
      id: id(),
      kind: "write_code",
      title: "components/Hero.tsx",
      detail: `Writing the primary "${subject}" experience based on your prompt.`,
      durationMs: 1100,
    },
    {
      id: id(),
      kind: "write_code",
      title: "app/page.tsx",
      detail: "Composing the page from the components above.",
      durationMs: 700,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "npm install",
      detail: "Installing dependencies inside the sandbox.",
      durationMs: 1500,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "npm run build",
      detail: "Type-checking and building to catch errors before you see the preview.",
      durationMs: 1300,
    },
    {
      id: id(),
      kind: "error",
      title: "Type error in components/Hero.tsx:14",
      detail: "Property 'subtitle' is missing in type — the component expected a prop that page.tsx never passed.",
      durationMs: 500,
    },
    {
      id: id(),
      kind: "recover",
      title: "Fixing the type error",
      detail: "Making 'subtitle' optional and giving it a sensible default, then re-running the build.",
      durationMs: 900,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "npm run build",
      detail: "Build passed. Starting the dev server and wiring it to your live preview.",
      durationMs: 1000,
    },
    {
      id: id(),
      kind: "info",
      title: "Ready",
      detail: `${subject} is live in preview. Ask for changes any time — I'll edit the same files instead of starting over.`,
      durationMs: 400,
    },
  ];

  return {
    summary: `Built **${subject}** — a ${framework} app with a landing flow and a starter agent, matching what you described.`,
    files,
    trace,
    previewTitle: subject,
    previewDescription: `A live-editable ${framework} app scaffolded from your prompt. In production this preview streams from the running sandbox over a websocket; here it's a representative snapshot.`,
  };
}

export const _internal = { slugify: (s: string) => s.toLowerCase().replace(/\s+/g, "-") };
