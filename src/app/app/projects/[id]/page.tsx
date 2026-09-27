import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/workspace/workspace";
import type { Project, ProjectMessage } from "@/lib/architect/types";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fresh?: string }>;
}) {
  const { id } = await params;
  const { fresh } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: messages } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <Workspace
      project={project as Project}
      initialMessages={(messages as ProjectMessage[]) ?? []}
      runOnMount={fresh === "1"}
    />
  );
}
