"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Framework, ModelId } from "@/lib/architect/types";

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
