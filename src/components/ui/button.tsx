import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-[var(--accent-strong)] shadow-[0_0_0_1px_rgba(242,169,59,0.4)]",
  secondary: "bg-bg-raised-2 text-text hover:bg-bg-overlay border border-border-strong",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-bg-raised-2",
  outline: "bg-transparent text-text border border-border-strong hover:bg-bg-raised-2",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-base gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
