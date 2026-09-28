// Curated model/agent-framework library shown at /app/library. Every entry
// marked `available: true` is already selectable in Architect's own model
// or framework dropdowns (see MODELS / AGENT_FRAMEWORKS in types.ts) — this
// page exists so picking one is an informed choice, not a guess.

export type LibraryCategory = "model" | "local" | "framework";

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
];

export const CATEGORY_LABEL: Record<LibraryCategory, string> = {
  model: "Cloud models",
  local: "Run locally",
  framework: "Agent frameworks",
};
