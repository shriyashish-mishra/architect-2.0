import { Logo } from "@/components/logo";
import { Link2, GitFork, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-text-faint sm:flex-row">
        <Logo />
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p>
            Built by <span className="text-text-muted">Shriyashish Mishra</span> for the Lyzr
            Architect 2.0 hiring assignment.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/shriyashish-mishra/architect-2.0"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-text"
            >
              <GitFork className="size-3.5" /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/shriyashish-mishra"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-text"
            >
              <Link2 className="size-3.5" /> LinkedIn
            </a>
            <a
              href="https://shriyashish.lovable.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-text"
            >
              <Globe className="size-3.5" /> Portfolio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
