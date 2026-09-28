// Curated model/agent-framework library shown at /app/library. Every entry
// marked `available: true` in the model/local/framework categories is
// already selectable in Architect's own dropdowns (see MODELS /
// AGENT_FRAMEWORKS in types.ts) — this page exists so picking one is an
// informed choice, not a guess.
//
// The "infra" category is different on purpose: RTK and OKF aren't things
// you pick from a dropdown — they're optimizations wired into the real
// production architecture this demo describes (see ARCHITECTURE.md), not
// into the simulated build you're clicking through here. `available: true`
// for those means "specified and integrated into the architecture", not
// "running live in this demo" — the copy says so explicitly either way.

export type LibraryCategory = "model" | "local" | "framework" | "infra";

export interface LibraryItem {
  id: string;
  name: string;
  vendor: string;
  category: LibraryCategory;
  tagline: string;
  why: string;
  steps: string[];
  docsUrl: string;
  available: boolean;
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "claude",
    name: "Claude Sonnet 5",
    vendor: "Anthropic",
    category: "model",
    tagline: "The strongest model for coding and agentic tool-use.",
    why: "Architect's own build agent runs on Claude by default — best-in-class at multi-step reasoning, long-context codebases, and knowing when to stop and ask instead of guessing.",
    steps: [
      "Get an API key at console.anthropic.com",
      "Paste it into Settings → Model providers → Claude",
      "Pick \"Claude Sonnet 5\" from the model dropdown on any project",
    ],
    docsUrl: "https://docs.claude.com",
    available: true,
  },
  {
    id: "gpt",
    name: "GPT-5.1",
    vendor: "OpenAI",
    category: "model",
    tagline: "The broadest tool/plugin ecosystem of any model family.",
    why: "If your agent needs to talk to a lot of third-party integrations, GPT usually has the widest first-party support already built for it.",
    steps: [
      "Get an API key at platform.openai.com",
      "Paste it into Settings → Model providers → GPT",
      "Pick \"GPT-5.1\" from the model dropdown on any project",
    ],
    docsUrl: "https://platform.openai.com/docs",
    available: true,
  },
  {
    id: "gemini",
    name: "Gemini 3 Pro",
    vendor: "Google",
    category: "model",
    tagline: "Natively multimodal with a huge context window.",
    why: "Best pick when your agent needs to read more than text — screenshots, PDFs, long transcripts — in a single call, not stitched together.",
    steps: [
      "Get an API key at aistudio.google.com",
      "Paste it into Settings → Model providers → Gemini",
      "Pick \"Gemini 3 Pro\" from the model dropdown on any project",
    ],
    docsUrl: "https://ai.google.dev/docs",
    available: true,
  },
  {
    id: "groq",
    name: "Groq",
    vendor: "Groq",
    category: "model",
    tagline: "Custom LPU chips run open models at ~10x typical speed.",
    why: "When latency matters more than raw capability — a support agent that needs to feel instant, or a high-volume loop — Groq's inference speed is the whole point.",
    steps: [
      "Get an API key at console.groq.com",
      "Paste it into Settings → Model providers → Groq",
      "Pick the Groq model from the dropdown on any project",
    ],
    docsUrl: "https://console.groq.com/docs",
    available: true,
  },
  {
    id: "mistral",
    name: "Mistral Large",
    vendor: "Mistral AI",
    category: "model",
    tagline: "Strong open-weight models, EU-hosted.",
    why: "A solid default when data residency matters, or when you want a model whose weights you could eventually self-host without switching vendors.",
    steps: [
      "Get an API key at console.mistral.ai",
      "Paste it into Settings → Model providers → Mistral",
      "Pick \"Mistral Large\" from the model dropdown on any project",
    ],
    docsUrl: "https://docs.mistral.ai",
    available: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek V3",
    vendor: "DeepSeek",
    category: "model",
    tagline: "Frontier reasoning at a fraction of the usual cost.",
    why: "Excellent price-to-capability ratio for reasoning-heavy agents where you're running a lot of calls and cost actually matters.",
    steps: [
      "Get an API key at platform.deepseek.com",
      "Paste it into Settings → Model providers → DeepSeek",
      "Pick \"DeepSeek V3\" from the model dropdown on any project",
    ],
    docsUrl: "https://api-docs.deepseek.com",
    available: true,
  },
  {
    id: "grok",
    name: "Grok 4",
    vendor: "xAI",
    category: "model",
    tagline: "Real-time awareness of what's happening right now.",
    why: "Trained with live access to X — the pick when your agent needs to reason about current events or trends, not just its training cutoff.",
    steps: [
      "Get an API key at console.x.ai",
      "Paste it into Settings → Model providers → Grok",
      "Pick \"Grok 4\" from the model dropdown on any project",
    ],
    docsUrl: "https://docs.x.ai",
    available: true,
  },
  {
    id: "perplexity",
    name: "Sonar",
    vendor: "Perplexity",
    category: "model",
    tagline: "A model with search built in, not bolted on.",
    why: "Every answer comes with citations by default — the right default for a research agent or anything where 'where did this come from' matters more than raw creativity.",
    steps: [
      "Get an API key at perplexity.ai/settings/api",
      "Paste it into Settings → Model providers → Perplexity",
      "Pick \"Sonar\" from the model dropdown on any project",
    ],
    docsUrl: "https://docs.perplexity.ai",
    available: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    vendor: "OpenRouter",
    category: "model",
    tagline: "One key, 200+ models — the model-agnostic escape hatch.",
    why: "If you don't want to manage a separate key per provider, OpenRouter fronts almost every model that exists behind one OpenAI-compatible endpoint. It's the practical extreme of \"model-agnostic\" — swap models by changing a string, not a provider.",
    steps: [
      "Get an API key at openrouter.ai/keys",
      "Paste it into Settings → Model providers → OpenRouter",
      "Pick \"Any model via OpenRouter\" and specify the underlying model id",
    ],
    docsUrl: "https://openrouter.ai/docs",
    available: true,
  },
  {
    id: "ollama",
    name: "Ollama",
    vendor: "Ollama",
    category: "local",
    tagline: "Run open models entirely on your own machine.",
    why: "Free, private, and offline-capable — nothing leaves your laptop. The right call for prototyping, sensitive data, or just not wanting a bill.",
    steps: [
      "Install from ollama.com, then run: ollama pull llama3.3",
      "Start it: ollama serve (it listens on localhost:11434, OpenAI-compatible)",
      "In Settings → Model providers, point the self-hosted entry at that URL",
    ],
    docsUrl: "https://ollama.com",
    available: true,
  },
  {
    id: "langgraph",
    name: "LangGraph",
    vendor: "LangChain",
    category: "framework",
    tagline: "The most battle-tested way to build stateful agent graphs.",
    why: "Best default for anything with real branching logic and checkpointing — Architect's own agent-framework scaffolding uses this shape by default.",
    steps: [
      "pip install langgraph",
      "On the homepage, switch to \"Build an agent\" and pick LangGraph",
      "Architect scaffolds agent/graph.py — keep prompting to extend it",
    ],
    docsUrl: "https://langchain-ai.github.io/langgraph/",
    available: true,
  },
  {
    id: "crewai",
    name: "CrewAI",
    vendor: "CrewAI",
    category: "framework",
    tagline: "Multi-agent \"crews\" with defined roles.",
    why: "Reach for this when the problem already mirrors a real team — a researcher, a writer, a reviewer — more than a single decision graph.",
    steps: [
      "pip install crewai",
      "On the homepage, switch to \"Build an agent\" and pick CrewAI",
      "Describe each role you want in your prompt — Architect scaffolds one agent per role",
    ],
    docsUrl: "https://docs.crewai.com",
    available: true,
  },
  {
    id: "autogen",
    name: "AutoGen",
    vendor: "Microsoft",
    category: "framework",
    tagline: "Built for agent-to-agent conversation and code execution.",
    why: "Strong when agents need to negotiate with each other or execute and self-correct code in a loop, not just call tools once.",
    steps: [
      "pip install pyautogen",
      "On the homepage, switch to \"Build an agent\" and pick AutoGen",
      "Architect wires up the conversable-agent pattern to start from",
    ],
    docsUrl: "https://microsoft.github.io/autogen/",
    available: true,
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    vendor: "LlamaIndex",
    category: "framework",
    tagline: "The standard for retrieval-augmented generation.",
    why: "If your agent's main job is reading a pile of documents well — support docs, contracts, a knowledge base — start here instead of building retrieval from scratch.",
    steps: [
      "pip install llama-index",
      "On the homepage, switch to \"Build an agent\" and pick LlamaIndex",
      "Point it at your docs — Architect scaffolds the ingestion + query pipeline",
    ],
    docsUrl: "https://docs.llamaindex.ai",
    available: true,
  },
  {
    id: "mcp",
    name: "Model Context Protocol (MCP)",
    vendor: "Anthropic (open standard)",
    category: "framework",
    tagline: "The open standard for connecting an agent to tools and data.",
    why: "Instead of writing custom tool integrations for every data source, MCP gives you one protocol — Architect's own tool surface (read_file, run_command, search_docs) is designed to be MCP-compatible, so any MCP server just becomes another tool your agent can call.",
    steps: [
      "pip install mcp (or npm install @modelcontextprotocol/sdk)",
      "On the homepage, switch to \"Build an agent\" and pick MCP",
      "Architect scaffolds a server your agent's clients can connect to",
    ],
    docsUrl: "https://modelcontextprotocol.io",
    available: true,
  },
  {
    id: "rtk",
    name: "RTK",
    vendor: "rtk-ai",
    category: "infra",
    tagline: "Cuts 60-90% of the tokens an agent burns reading tool output.",
    why: "Every tool call — ls, cat, git diff, a test run — normally dumps raw output straight into the model's context. RTK is a single Rust binary that sits between a sandbox and the model and compresses that output before it's ever read. It's specified as part of Architect's real agent harness (ARCHITECTURE.md §3, \"Context management\") and shown as a step in this demo's simulated build trace — but it isn't literally running in this demo, since there's no real sandbox behind it yet.",
    steps: [
      "Read how it fits the harness in ARCHITECTURE.md → §3",
      "Try it yourself: brew install rtk (or cargo install rtk)",
      "Pipe any command through it: rtk git diff",
    ],
    docsUrl: "https://github.com/rtk-ai/rtk",
    available: true,
  },
  {
    id: "okf",
    name: "Open Knowledge Format (OKF)",
    vendor: "Google Cloud (open spec)",
    category: "infra",
    tagline: "Git-native, explicitly-linked knowledge — no vector DB required.",
    why: "RAG infers relationships by embedding similarity; OKF keeps them explicit — plain Markdown files with YAML frontmatter and real links between concepts, versioned right next to your code. Every Architect project keeps its grounding in .architect/knowledge/ in this format (see ARCHITECTURE.md §3) so what the agent \"knows\" about your project is auditable and diffable, not a black-box index. Like RTK, this describes the real architecture, not live behavior in this simulated demo.",
    steps: [
      "Read the integration in ARCHITECTURE.md → §3",
      "Try the format yourself: any .md file with YAML frontmatter + explicit links",
      "Reference implementation: github.com/okf-memory/okf-agent-memory",
    ],
    docsUrl: "https://github.com/okf-memory/okf-agent-memory",
    available: true,
  },
  {
    id: "e2b",
    name: "E2B",
    vendor: "E2B",
    category: "infra",
    tagline: "Open-source sandboxing purpose-built for AI agents.",
    why: "This is the sandboxing technology ARCHITECTURE.md recommends for running each user's app (§2: Sandboxes) — Firecracker microVMs under the hood, an SDK on top built specifically for the \"agent writes code, code runs somewhere isolated\" pattern.",
    steps: [
      "Read the full reasoning in ARCHITECTURE.md → §2",
      "Try it directly: pip install e2b, then from e2b import Sandbox",
      "e2b.dev for docs, pricing, and supported runtimes",
    ],
    docsUrl: "https://e2b.dev/docs",
    available: true,
  },
];

export const CATEGORY_LABEL: Record<LibraryCategory, string> = {
  model: "Cloud models",
  local: "Run locally",
  framework: "Agent frameworks",
  infra: "Context & infrastructure — from the real architecture",
};
