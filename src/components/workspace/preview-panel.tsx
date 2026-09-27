"use client";

import { useState } from "react";
import { RefreshCw, Monitor, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function PreviewPanel({
  title,
  description,
  isBuilding,
  slug,
}: {
  title: string;
  description: string;
  isBuilding: boolean;
  slug: string;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [spinning, setSpinning] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
        <div className="flex items-center gap-1 rounded-md border border-border-strong bg-bg px-2 py-1 font-mono text-xs text-text-faint">
          <span className="size-1.5 rounded-full bg-success" />
          {slug}.architect.app
        </div>
        <button
          onClick={() => {
            setSpinning(true);
            setTimeout(() => setSpinning(false), 500);
          }}
          className="rounded-md p-1.5 text-text-faint hover:bg-bg-raised-2 hover:text-text"
          title="Refresh preview"
        >
          <RefreshCw className={cn("size-3.5", spinning && "animate-spin")} />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={cn("rounded-md p-1.5", device === "desktop" ? "bg-bg-raised-2 text-text" : "text-text-faint hover:text-text")}
          >
            <Monitor className="size-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn("rounded-md p-1.5", device === "mobile" ? "bg-bg-raised-2 text-text" : "text-text-faint hover:text-text")}
          >
            <Smartphone className="size-3.5" />
          </button>
          <button className="ml-1 rounded-md p-1.5 text-text-faint hover:bg-bg-raised-2 hover:text-text" title="Open in new tab (demo)">
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#05070a] p-6">
        {isBuilding ? (
          <div className="flex flex-col items-center gap-3 text-text-faint">
            <span className="pulse-dot size-2 rounded-full bg-accent" />
            <p className="text-sm">Spinning up the sandbox…</p>
          </div>
        ) : (
          <div
            className={cn(
              "overflow-hidden rounded-lg border border-border-strong bg-white text-[#111] shadow-2xl transition-all",
              device === "desktop" ? "w-full max-w-2xl" : "w-[320px]",
            )}
          >
            <div className="flex items-center gap-3 border-b border-black/10 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F2A93B]" />
              <div className="text-xs font-semibold tracking-tight">{title || "Your app"}</div>
              <div className="ml-auto flex gap-3 text-[10px] text-black/40">
                <span>Home</span>
                <span>About</span>
                <span>Sign in</span>
              </div>
            </div>
            <div className="space-y-3 px-6 py-8">
              <div className="h-3 w-2/3 rounded bg-black/80" />
              <div className="h-2 w-1/2 rounded bg-black/30" />
              <div className="mt-4 h-8 w-28 rounded-md bg-[#F2A93B]" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="h-16 rounded-md bg-black/5" />
                <div className="h-16 rounded-md bg-black/5" />
                <div className="h-16 rounded-md bg-black/5" />
              </div>
            </div>
            <div className="border-t border-black/10 px-6 py-3 text-[10px] text-black/40">
              {description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
