import { cn } from "@/lib/utils";

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M12 2 2 20h5.2L12 11l4.8 9H22L12 2Z"
          fill="currentColor"
          className="text-accent"
        />
        <path d="M12 11 8.6 20H15.4L12 11Z" fill="currentColor" className="text-accent-foreground" opacity="0.001" />
      </svg>
      {!mark && (
        <span>
          Architect<span className="text-accent">2.0</span>
        </span>
      )}
    </span>
  );
}
