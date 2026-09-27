import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FRAMEWORKS, type Project } from "@/lib/architect/types";
import { timeAgo } from "@/lib/utils";
import { ExternalLink, GitFork } from "lucide-react";

const STATUS_TONE = {
  draft: "neutral",
  building: "warning",
  ready: "blue",
  deployed: "success",
  error: "danger",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const framework = FRAMEWORKS.find((f) => f.id === project.framework)?.label ?? project.framework;

  return (
    <Link href={`/app/projects/${project.id}`}>
      <Card className="group flex h-full flex-col p-5 transition-colors hover:border-border-strong">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text group-hover:text-accent">{project.name}</h3>
          <Badge tone={STATUS_TONE[project.status]}>{project.status}</Badge>
        </div>
        <p className="mt-1 text-xs text-text-faint">{framework} · updated {timeAgo(project.updated_at)}</p>

        <div className="mt-4 flex-1 rounded-lg border border-dashed border-border bg-bg/60 p-3">
          <div className="space-y-1.5">
            <div className="h-1.5 w-4/5 rounded bg-border-strong" />
            <div className="h-1.5 w-3/5 rounded bg-border-strong" />
            <div className="h-1.5 w-2/3 rounded bg-border-strong" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-text-faint">
          {project.github_repo && (
            <span className="flex items-center gap-1">
              <GitFork className="size-3" /> connected
            </span>
          )}
          {project.deploy_url && (
            <span className="flex items-center gap-1">
              <ExternalLink className="size-3" /> live
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
