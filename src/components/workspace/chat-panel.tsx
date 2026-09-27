"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectMessage } from "@/lib/architect/types";
import { StepIcon } from "./step-icon";
import { Button } from "@/components/ui/button";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: {
  messages: ProjectMessage[];
  isBuilding: boolean;
  onSend: (text: string) => void;
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) =>
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
