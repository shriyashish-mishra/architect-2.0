import { AlertTriangle, FileCode2, ListTree, RefreshCw, Terminal, Info } from "lucide-react";
import type { StepKind } from "@/lib/architect/types";
import { cn } from "@/lib/utils";

export function StepIcon({ kind, className }: { kind: StepKind; className?: string }) {
  const cls = cn("size-3.5", className);
  switch (kind) {
    case "plan":
      return <ListTree className={cn(cls, "text-violet")} />;
    case "write_code":
      return <FileCode2 className={cn(cls, "text-blue")} />;
    case "run_tool":
      return <Terminal className={cn(cls, "text-text-muted")} />;
    case "error":
      return <AlertTriangle className={cn(cls, "text-danger")} />;
    case "recover":
      return <RefreshCw className={cn(cls, "text-warning")} />;
    default:
      return <Info className={cn(cls, "text-success")} />;
  }
}

export function stepLabel(kind: StepKind): string {
  switch (kind) {
    case "plan":
      return "Plan";
    case "write_code":
      return "Write";
    case "run_tool":
      return "Tool";
    case "error":
      return "Error";
    case "recover":
      return "Recover";
    default:
      return "Info";
  }
}
