import { LIBRARY_ITEMS, CATEGORY_LABEL, type LibraryCategory } from "@/lib/architect/library";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, BookOpen } from "lucide-react";

const CATEGORIES: LibraryCategory[] = ["model", "local", "framework", "infra"];

export default function LibraryPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Models &amp; agent library</h1>
      <p className="mt-1 max-w-2xl text-sm text-text-muted">
        Architect is model-agnostic end to end — every provider and framework below drops into
        the same model dropdown or framework picker you already use when starting a project.
        Bring your own key in Settings, and nothing else about your project changes. The
        &ldquo;Context &amp; infrastructure&rdquo; section below is different: those describe real
        optimizations designed into Architect&apos;s production architecture (see
        ARCHITECTURE.md), not features running live in this demo.
      </p>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-text-faint">
            {CATEGORY_LABEL[cat]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIBRARY_ITEMS.filter((i) => i.category === cat).map((item) => (
              <Card key={item.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text">{item.name}</h3>
                    <p className="text-xs text-text-faint">{item.vendor}</p>
                  </div>
                  {item.category === "infra" ? (
                    <Badge tone="blue" className="shrink-0">
                      <BookOpen className="size-3" /> in architecture
                    </Badge>
                  ) : (
                    item.available && (
                      <Badge tone="success" className="shrink-0">
                        <Check className="size-3" /> ready
                      </Badge>
                    )
                  )}
                </div>

                <p className="mt-3 text-sm text-text">{item.tagline}</p>
                <p className="mt-1.5 text-sm text-text-muted">{item.why}</p>

                <div className="mt-4 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-faint">
                    {item.category === "infra" ? "How to try it" : "How to use it here"}
                  </p>
                  <ol className="mt-2 space-y-1.5">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-xs text-text-muted">
                        <span className="shrink-0 font-mono text-text-faint">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <a
                  href={item.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  Official docs <ExternalLink className="size-3" />
                </a>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
