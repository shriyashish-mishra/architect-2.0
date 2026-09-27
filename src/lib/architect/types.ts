export type Framework = "nextjs" | "react" | "python" | "node" | "other";
export type ModelId = "claude" | "gpt" | "gemini" | "oss";
export type WorkspaceMode = "vibe" | "pro";
export type ProjectStatus = "draft" | "building" | "ready" | "deployed" | "error";
export type MessageRole = "user" | "agent" | "system";
export type StepKind = "plan" | "write_code" | "run_tool" | "error" | "recover" | "info" | null;

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  framework: Framework;
  mode: WorkspaceMode;
  model: ModelId;
  status: ProjectStatus;
  github_repo: string | null;
  deploy_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  step_kind: StepKind;
  created_at: string;
}

export const MODELS: { id: ModelId; label: string; vendor: string }[] = [
  { id: "claude", label: "Claude Sonnet 5", vendor: "Anthropic" },
  { id: "gpt", label: "GPT-5.1", vendor: "OpenAI" },
  { id: "gemini", label: "Gemini 3 Pro", vendor: "Google" },
  { id: "oss", label: "Llama 4 (self-hosted)", vendor: "Open source" },
];

export const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "nextjs", label: "Next.js" },
  { id: "react", label: "React + Vite" },
  { id: "python", label: "Python / FastAPI" },
  { id: "node", label: "Node.js" },
  { id: "other", label: "Other / custom agent framework" },
];
