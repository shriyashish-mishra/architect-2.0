"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FRAMEWORKS, type Project } from "@/lib/architect/types";
import { timeAgo } from "@/lib/utils";
import { deleteProject } from "@/app/app/actions";
import { ExternalLink, GitFork, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONE = {
  draft: "neutral",
  building: "warning",
  ready: "blue",
  deployed: "success",
  error: "danger",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const framework = FRAMEWORKS.find((f) => f.id === project.framework)?.label ?? project.framework;
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id);
      router.refresh();
    });
  }

  return (
    <Link href={`/app/projects/${project.id}`} onMouseLeave={() => setConfirming(false)}>
      <Card className="group relative flex h-full flex-col p-5 transition-colors hover:border-border-strong">
        <button
          onClick={handleDelete}
          disabled={pending}
          title={confirming ? "Click again to confirm delete" : "Delete project"}
          className={cn(
            "absolute right-3 top-3 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100",
            confirming ? "bg-danger/15 text-danger opacity-100" : "text-text-faint hover:bg-bg-raised-2 hover:text-danger",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>

        <div className="flex items-start justify-between gap-2 pr-6">
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
