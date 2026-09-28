"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Framework, ModelId } from "@/lib/architect/types";

export interface GithubRepo {
  fullName: string;
  name: string;
  private: boolean;
  updatedAt: string;
}

export type GithubReposResult =
  | { status: "no_token" }
  | { status: "error"; message: string }
  | { status: "ok"; repos: GithubRepo[] };

// Real (not simulated): lists the signed-in user's own GitHub repos via the
// GitHub API, using the OAuth provider token captured at /auth/callback.
// Distinguishes "never signed in with GitHub" from "signed in, but the API
// call failed" — silently collapsing those into one fallback made a real
// failure (bad scope, expired token, rate limit) look identical to a guest
// session, which is exactly what made this hard to debug last time.
export async function listGithubRepos(): Promise<GithubReposResult> {
  const token = (await cookies()).get("gh_token")?.value;
  if (!token) return { status: "no_token" };

  let res: Response;
  try {
    res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=15&affiliation=owner,collaborator", {
      headers: {
        // GitHub's OAuth App (as opposed to GitHub App) tokens are the
        // classic format — `token <token>`, not `Bearer <token>`.
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Network error reaching GitHub" };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { status: "error", message: `GitHub API ${res.status}: ${body.slice(0, 200) || res.statusText}` };
  }

  const repos = (await res.json()) as Array<{
    full_name: string;
    name: string;
    private: boolean;
    updated_at: string;
  }>;

  return {
    status: "ok",
    repos: repos.map((r) => ({
      fullName: r.full_name,
      name: r.name,
      private: r.private,
      updatedAt: r.updated_at,
    })),
  };
}

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const words = cleaned.split(/\s+/).slice(0, 5);
  return words.length ? words.join(" ") : "Untitled project";
}

export async function createProject(formData: FormData) {
  const prompt = String(formData.get("prompt") ?? "").trim();
  const framework = String(formData.get("framework") ?? "nextjs") as Framework;
  const model = String(formData.get("model") ?? "claude") as ModelId;

  if (!prompt) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: titleFromPrompt(prompt),
      framework,
      model,
      status: "building",
    })
    .select()
    .single();

  if (error || !project) {
    throw new Error(error?.message ?? "Could not create project");
  }

  await supabase.from("project_messages").insert({
    project_id: project.id,
    user_id: user.id,
    role: "user",
    content: prompt,
  });

  redirect(`/app/projects/${project.id}?fresh=1`);
}

export async function importProject(formData: FormData) {
  const repo = String(formData.get("repo") ?? "").trim();
  const framework = String(formData.get("framework") ?? "nextjs") as Framework;
  if (!repo) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const name = repo.split("/").pop() ?? repo;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      framework,
      model: "claude",
      status: "building",
      github_repo: repo,
      // Marks this project as import-sourced so the workspace regenerates
      // the "existing codebase" file tree instead of a from-scratch build.
      description: `import:${repo}`,
    })
    .select()
    .single();

  if (error || !project) {
    throw new Error(error?.message ?? "Could not import project");
  }

  await supabase.from("project_messages").insert({
    project_id: project.id,
    user_id: user.id,
    role: "user",
    content: `Import ${repo} from GitHub and let's keep working on it here.`,
  });

  redirect(`/app/projects/${project.id}?fresh=1`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/app");
}

export async function updateProjectMeta(
  projectId: string,
  patch: { name?: string; mode?: string; model?: string; status?: string; deploy_url?: string; github_repo?: string },
) {
  const supabase = await createClient();
  await supabase.from("projects").update(patch).eq("id", projectId);
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath("/app");
}

export async function sendMessage(
  projectId: string,
  role: "user" | "agent" | "system",
  content: string,
  stepKind?: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("project_messages").insert({
    project_id: projectId,
    user_id: user.id,
    role,
    content,
    step_kind: stepKind ?? null,
  });
  revalidatePath(`/app/projects/${projectId}`);
}
