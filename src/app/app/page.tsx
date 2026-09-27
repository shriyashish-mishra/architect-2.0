import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "@/components/new-project-form";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/architect/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("updated_at", { ascending: false });

  return (
    <div className="bp-grid flex-1">
      <div className="mx-auto w-full max-w-4xl px-5 py-16">
        <h1 className="text-center text-3xl font-semibold tracking-tight">
          What are we building today?
        </h1>
        <p className="mt-2 text-center text-text-muted">
          Prompt a new app, or pick up a project you already started.
        </p>

        <div className="mt-8">
          <NewProjectForm />
        </div>

        <div className="mt-16">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            Your projects
          </h2>
          {!projects || projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-text-muted">
              Nothing yet — describe an app above to start your first project.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(projects as Project[]).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
