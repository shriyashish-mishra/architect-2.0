import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "blue";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-bg-raised-2 text-text-muted border-border",
  accent: "bg-accent/10 text-accent border-accent/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  blue: "bg-blue/10 text-blue border-blue/30",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
