"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectMessage, StepKind } from "@/lib/architect/types";
import { StepIcon } from "./step-icon";
import { Button } from "@/components/ui/button";
import { ArrowUp, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Vibe mode never shows a file path, a terminal command, or a stack trace —
// just what's actually happening, in plain words. Pro mode gets the real
// thing (see TraceRow below). Returning null skips a step entirely: some
// steps (RTK/OKF call-outs) are architecture flavor for a technical
// audience and have nothing to say to someone who just wants their app.
function friendlyLabel(kind: StepKind, title: string): string | null {
  if (title.startsWith("rtk:") || title.startsWith("Grounding in OKF")) return null;
  switch (kind) {
    case "plan":
      return "Planning what to build";
    case "write_code":
      return "Writing the code";
    case "run_tool":
      return "Setting things up";
    case "error":
      return "Hit a small snag — fixing it";
    case "recover":
      return "Fixed — carrying on";
    case "info":
      return title === "Ready" ? "All set!" : title;
    default:
      return title;
  }
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-text">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function ChatPanel({
  messages,
  isBuilding,
  onSend,
  technical = true,
}: {
  messages: ProjectMessage[];
  isBuilding: boolean;
  onSend: (text: string) => void;
  /** Pro mode: full raw trace (file paths, commands, errors). Vibe mode: plain-language progress only. */
  technical?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isBuilding]);

  function submit() {
    const text = draft.trim();
    if (!text || isBuilding) return;
    onSend(text);
    setDraft("");
  }

  // Simple (Vibe) mode: one unified, chronological list mixing plain chat
  // bubbles with collapsed, plain-language progress rows — no file paths,
  // commands, or raw errors, and no repeated near-duplicate steps.
  type RenderItem =
    | { type: "user" | "agent"; id: string; content: string }
    | { type: "step"; id: string; label: string };

  const simpleItems: RenderItem[] = [];
  if (!technical) {
    for (const m of messages) {
      if (m.step_kind) {
        const [title] = m.content.split("\n");
        const label = friendlyLabel(m.step_kind, title);
        if (!label) continue;
        const last = simpleItems[simpleItems.length - 1];
        if (last?.type === "step" && last.label === label) continue;
        simpleItems.push({ type: "step", id: m.id, label });
      } else {
        simpleItems.push({ type: m.role === "user" ? "user" : "agent", id: m.id, content: m.content });
      }
    }
  }
  const latestStepId = [...simpleItems].reverse().find((it) => it.type === "step")?.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {technical
            ? messages.map((m) =>
                m.step_kind ? (
                  <TraceRow key={m.id} message={m} />
                ) : m.role === "user" ? (
                  <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 border border-accent/20 px-3.5 py-2 text-sm text-text">
                    {m.content}
                  </div>
                ) : (
                  <div key={m.id} className="max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-bg-raised-2 px-3.5 py-2 text-sm leading-relaxed">
                    {renderInline(m.content)}
                  </div>
                ),
              )
            : simpleItems.map((it) =>
                it.type === "step" ? (
                  <div key={it.id} className="flex items-center gap-2 px-1 text-sm text-text-muted">
                    {it.id === latestStepId && isBuilding ? (
                      <span className="pulse-dot size-1.5 shrink-0 rounded-full bg-accent" />
                    ) : (
                      <Check className="size-3.5 shrink-0 text-success" />
                    )}
                    {it.label}
                  </div>
                ) : it.type === "user" ? (
                  <div key={it.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 border border-accent/20 px-3.5 py-2 text-sm text-text">
                    {it.content}
                  </div>
                ) : (
                  <div key={it.id} className="max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-bg-raised-2 px-3.5 py-2 text-sm leading-relaxed">
                    {renderInline(it.content)}
                  </div>
                ),
              )}
          {isBuilding && (
            <div className="flex items-center gap-2 px-1 text-xs text-text-muted">
              <span className="pulse-dot size-1.5 rounded-full bg-accent" />
              Architect is working…
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border-strong bg-bg px-3 py-2">
          <Sparkles className="mt-1.5 size-4 shrink-0 text-text-faint" />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={isBuilding ? "Architect is building — you can queue the next request…" : "Ask for a change, or describe what's next…"}
            className="max-h-32 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-text-faint"
          />
          <Button size="icon" onClick={submit} disabled={!draft.trim()}>
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TraceRow({ message }: { message: ProjectMessage }) {
  const [open, setOpen] = useState(message.step_kind === "error");
  const [title, ...rest] = message.content.split("\n");
  const detail = rest.join("\n");

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border px-3 py-1.5 text-left text-xs transition-colors",
        message.step_kind === "error"
          ? "border-danger/30 bg-danger/5"
          : "border-border-subtle bg-bg-raised/50 hover:border-border",
      )}
    >
      <span className="flex items-center gap-1.5 font-mono text-text-muted">
        <StepIcon kind={message.step_kind} />
        {title}
      </span>
      {open && detail && (
        <span className="whitespace-pre-line pl-5 text-text-faint">{detail}</span>
      )}
    </button>
  );
}
