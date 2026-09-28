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

const AGENT_FRAMEWORK_IDS = new Set(["langgraph", "crewai", "autogen", "llamaindex", "mcp", "agent-other"]);
export function isAgentFramework(framework: string): boolean {
  return AGENT_FRAMEWORK_IDS.has(framework);
}

export function generateBuildPlan(prompt: string, framework: string): BuildPlan {
  if (AGENT_FRAMEWORK_IDS.has(framework)) return generateAgentPlan(prompt, framework);

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
      kind: "info",
      title: "rtk: compressing tool output",
      detail: "Every command this sandbox runs is piped through RTK (rtk-ai/rtk) before I read it — cuts stdout/file-read volume 60-90% before it touches my context, so a long build log or `git diff` doesn't burn the budget I need for actually reasoning about your app.",
      durationMs: 400,
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

const AGENT_FRAMEWORK_LABELS: Record<string, string> = {
  langgraph: "LangGraph",
  crewai: "CrewAI",
  autogen: "AutoGen",
  llamaindex: "LlamaIndex",
  mcp: "MCP",
  "agent-other": "your agent framework",
};

function generateAgentPlan(prompt: string, framework: string): BuildPlan {
  const subject = titleCaseFromPrompt(prompt) || "New Agent";
  const fwLabel = AGENT_FRAMEWORK_LABELS[framework] ?? framework;

  const files: FileNode[] = [
    {
      path: "agent",
      kind: "dir",
      children: [
        { path: "agent/graph.py", kind: "file", language: "py" },
        { path: "agent/tools.py", kind: "file", language: "py" },
        { path: "agent/memory.py", kind: "file", language: "py" },
        { path: "agent/prompts.py", kind: "file", language: "py" },
      ],
    },
    {
      path: "evals",
      kind: "dir",
      children: [{ path: "evals/test_cases.py", kind: "file", language: "py" }],
    },
    { path: "main.py", kind: "file", language: "py" },
    { path: "requirements.txt", kind: "file", language: "text" },
    { path: "README.md", kind: "file", language: "md" },
  ];

  const trace: AgentTrace[] = [
    {
      id: id(),
      kind: "plan",
      title: "Reading your prompt",
      detail: `Breaking "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}" into an agent plan: what it needs to reason about, which tools it needs, and what "done" looks like.`,
      durationMs: 900,
    },
    {
      id: id(),
      kind: "plan",
      title: "Drafting the agent graph",
      detail: `1. Scaffold a ${fwLabel} project\n2. Define the graph/crew structure and each node's role\n3. Wire up tools (${subject} needs real actions, not just chat)\n4. Add memory + guardrails\n5. Write eval cases and self-review`,
      durationMs: 700,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "sandbox.create()",
      detail: `Provisioning an isolated Python sandbox (${fwLabel}, Python 3.12) — agents run headless, so there's no browser preview, just live logs.`,
      durationMs: 1200,
    },
    {
      id: id(),
      kind: "info",
      title: "rtk: compressing tool output",
      detail: "Piping every command through RTK (rtk-ai/rtk) before I read it — 60-90% less tool-call token cost, which matters even more here since agent loops make a lot more tool calls than a one-shot app build.",
      durationMs: 400,
    },
    {
      id: id(),
      kind: "write_code",
      title: "agent/tools.py",
      detail: `Writing the tools ${subject} can call.`,
      durationMs: 900,
    },
    {
      id: id(),
      kind: "write_code",
      title: "agent/graph.py",
      detail: `Wiring the ${fwLabel} graph: nodes, edges, and where a human-in-the-loop checkpoint makes sense.`,
      durationMs: 1100,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "pip install -r requirements.txt",
      detail: "Installing dependencies inside the sandbox.",
      durationMs: 1400,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "python -m evals.test_cases",
      detail: "Running the agent against its eval cases before calling it done.",
      durationMs: 1300,
    },
    {
      id: id(),
      kind: "error",
      title: "evals/test_cases.py::test_tool_call_recovery — FAILED",
      detail: "The agent didn't retry after a tool call returned an error — it just gave up and reported failure to the user.",
      durationMs: 500,
    },
    {
      id: id(),
      kind: "recover",
      title: "Adding a bounded retry",
      detail: "Wrapping tool calls with a 3-attempt retry and feeding the error back to the model, then re-running evals.",
      durationMs: 900,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "python -m evals.test_cases",
      detail: "All eval cases passed. Agent is live and listening.",
      durationMs: 900,
    },
    {
      id: id(),
      kind: "info",
      title: "Ready",
      detail: `${subject} is live. Ask for changes any time — I'll edit the same graph instead of starting over.`,
      durationMs: 400,
    },
  ];

  return {
    summary: `Built **${subject}** — a ${fwLabel} agent with its own tools, memory, and eval cases, matching what you described.`,
    files,
    trace,
    previewTitle: subject,
    previewDescription: `${subject} running in a headless Python sandbox. Agents don't have a UI to preview — this tab instead streams its live run logs.`,
  };
}

export function generateImportPlan(repoName: string, framework: string): BuildPlan {
  const files: FileNode[] = [
    {
      path: "app",
      kind: "dir",
      children: [
        { path: "app/layout.tsx", kind: "file", language: "tsx" },
        { path: "app/page.tsx", kind: "file", language: "tsx" },
        { path: "app/dashboard/page.tsx", kind: "file", language: "tsx" },
        { path: "app/globals.css", kind: "file", language: "css" },
      ],
    },
    {
      path: "components",
      kind: "dir",
      children: [
        { path: "components/Nav.tsx", kind: "file", language: "tsx" },
        { path: "components/Table.tsx", kind: "file", language: "tsx" },
      ],
    },
    {
      path: "agents",
      kind: "dir",
      children: [{ path: "agents/orchestrator.ts", kind: "file", language: "ts" }],
    },
    {
      path: "tests",
      kind: "dir",
      children: [{ path: "tests/smoke.test.ts", kind: "file", language: "ts" }],
    },
    { path: ".github/workflows/ci.yml", kind: "file", language: "yaml" },
    { path: "package.json", kind: "file", language: "json" },
    { path: "README.md", kind: "file", language: "md" },
  ];

  const trace: AgentTrace[] = [
    {
      id: id(),
      kind: "run_tool",
      title: `git clone ${repoName}`,
      detail: "Cloning the repository into a fresh sandbox over your GitHub App installation token.",
      durationMs: 1000,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "npm install",
      detail: "Installing dependencies exactly as pinned in the existing lockfile — nothing upgraded.",
      durationMs: 1400,
    },
    {
      id: id(),
      kind: "plan",
      title: "Reading the existing structure",
      detail: `Indexing ${repoName}: routes, components, an existing "agents/" module, and a CI workflow. Building a map of the codebase before touching anything.`,
      durationMs: 1100,
    },
    {
      id: id(),
      kind: "info",
      title: "Grounding in OKF",
      detail: `Converting ${repoName}'s README and docs into an OKF bundle (.architect/knowledge/) — plain Markdown with explicit links between concepts, not a vector index, so what I know about this repo stays readable and diffable right next to the code.`,
      durationMs: 500,
    },
    {
      id: id(),
      kind: "run_tool",
      title: "npm run build",
      detail: "Confirming the project builds as-is before any changes, so I never hand you a broken starting point.",
      durationMs: 1200,
    },
    {
      id: id(),
      kind: "info",
      title: "Ready",
      detail: `Imported ${repoName}. I've read the existing code and I'll match its structure and conventions for anything you ask next — no rewrites.`,
      durationMs: 400,
    },
  ];

  return {
    summary: `Imported **${repoName}** — read the existing ${framework} codebase, confirmed it builds, and I'm ready to keep working in it.`,
    files,
    trace,
    previewTitle: repoName,
    previewDescription: `The existing app from ${repoName}, now running in an Architect sandbox exactly as it was on GitHub.`,
  };
}

export const _internal = { slugify: (s: string) => s.toLowerCase().replace(/\s+/g, "-") };
