"use client";

import type { ProjectMessage } from "@/lib/architect/types";
import { StepIcon, stepLabel } from "./step-icon";
import { Badge } from "@/components/ui/badge";
import { Cpu, Clock, Wrench } from "lucide-react";

export function AgentPanel({
  messages,
  model,
  isBuilding,
}: {
  messages: ProjectMessage[];
  model: string;
  isBuilding: boolean;
}) {
  const steps = messages.filter((m) => m.step_kind);
  const toolCalls = steps.filter((s) => s.step_kind === "run_tool").length;
  const errors = steps.filter((s) => s.step_kind === "error").length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-4 border-b border-border-subtle px-4 py-3 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <Cpu className="size-3.5 text-blue" /> {model}
        </span>
        <span className="flex items-center gap-1.5">
          <Wrench className="size-3.5" /> {toolCalls} tool calls
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {steps.length ? `${(steps.length * 0.9).toFixed(1)}s` : "0s"}
        </span>
        {errors > 0 && <Badge tone="danger">{errors} error{errors > 1 ? "s" : ""} recovered</Badge>}
        {isBuilding && <Badge tone="warning">running</Badge>}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        {steps.length === 0 ? (
          <p className="text-sm text-text-faint">No agent runs yet — send a prompt in chat to see the full trace here.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {steps.map((s) => {
              const [title, ...rest] = s.content.split("\n");
              return (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[25px] top-0.5 flex size-4 items-center justify-center rounded-full border border-border bg-bg-raised">
                    <StepIcon kind={s.step_kind} className="size-2.5" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-text-faint">
                      {stepLabel(s.step_kind)}
                    </span>
                    <span className="text-sm font-medium text-text">{title}</span>
                  </div>
                  {rest.length > 0 && (
                    <p className="mt-1 whitespace-pre-line font-mono text-xs text-text-muted">{rest.join("\n")}</p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
