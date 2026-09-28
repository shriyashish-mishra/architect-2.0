import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Boxes,
  Code2,
  GitFork,
  Rocket,
  Sparkles,
  Terminal,
  Users,
  GitBranch,
  Workflow,
} from "lucide-react";

const AUDIENCES = [
  {
    icon: Sparkles,
    title: "Never written code",
    body:
      "Describe the app you want in plain language. Architect plans it, builds it, and hands you a live preview — no terminal, no config, ever.",
  },
  {
    icon: Code2,
    title: "Ship code for a living",
    body:
      "Same project, Pro mode: a real file tree, an inline editor, a terminal, and full agent tool-call logs. Take over any file the agent wrote.",
  },
];

const FEATURES = [
  {
    icon: Workflow,
    title: "Prompt to full app",
    body: "One chat turns into pages, components, data models, and the agents your app needs — not just a static mockup.",
  },
  {
    icon: Boxes,
    title: "Bring your own project",
    body: "Import an existing repo and Architect keeps working inside it, respecting the structure that's already there.",
  },
  {
    icon: Terminal,
    title: "Any framework, any model",
    body: "Next.js, Python, plain Node, or your own agent framework — paired with Claude, GPT, Gemini, or a self-hosted model.",
  },
  {
    icon: GitFork,
    title: "GitHub-native",
    body: "Every project is a real repo from the first commit. Branch, review, and merge the agent's changes like a teammate's.",
  },
  {
    icon: Rocket,
    title: "One-click deploy",
    body: "Ship to a production URL the moment it's ready, then keep iterating against the live app.",
  },
  {
    icon: Users,
    title: "Built for teams",
    body: "Non-technical PMs and engineers work in the same project, each in the view that fits them.",
  },
];

const STEPS = [
  { n: "01", title: "Describe it", body: "Tell Architect what you want to build, in your own words." },
  { n: "02", title: "Watch it get built", body: "See the plan, the files, and the agent's reasoning in real time." },
  { n: "03", title: "Refine or take over", body: "Keep prompting, or drop into the code — same project, either way." },
  { n: "04", title: "Ship it", body: "Push to GitHub and deploy to a live URL in one flow." },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
            <a href="#features" className="hover:text-text">Features</a>
            <a href="#audiences" className="hover:text-text">Who it&apos;s for</a>
            <a href="#architecture" className="hover:text-text">Architecture</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Start building <ArrowRight className="size-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bp-grid bp-glow relative border-b border-border-subtle">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-28 text-center">
          <Badge tone="accent" className="mb-6">
            <Sparkles className="size-3" /> Now building agentic apps, not just pages
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Build software by <span className="text-accent">talking to it</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-muted text-balance">
            Architect 2.0 is a vibe-coding platform for everyone — from a founder who&apos;s
            never opened a terminal to an engineer who lives in one.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg">Start building free <ArrowRight className="size-4" /></Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button size="lg" variant="outline">I have an account</Button>
            </Link>
          </div>

          <Card className="mt-16 w-full max-w-3xl overflow-hidden text-left shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-danger/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
              <span className="ml-2 font-mono text-xs text-text-faint">architect · new project</span>
            </div>
            <div className="p-5 font-mono text-sm">
              <p className="text-text-muted">&gt; Build a waitlist landing page with a Supabase-backed signup form and an admin view of signups.</p>
              <p className="mt-3 flex items-center gap-2 text-blue">
                <span className="pulse-dot size-1.5 rounded-full bg-blue" />
                Planning: pages, signup form, admin table, one agent for spam-checking emails
              </p>
              <p className="mt-1 text-text-faint">writing app/page.tsx, components/SignupForm.tsx, app/admin/page.tsx…</p>
              <p className="mt-1 text-success">✓ Build passed · preview live</p>
            </div>
          </Card>
        </div>
      </section>

      <section id="audiences" className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className="text-center text-sm font-medium uppercase tracking-wider text-text-faint">
          One platform, two front doors
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <Card key={a.title} className="p-8">
              <a.icon className="size-6 text-accent" />
              <h3 className="mt-4 text-xl font-semibold">{a.title}</h3>
              <p className="mt-2 text-text-muted">{a.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-border-subtle bg-bg-raised/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-24">
          <h2 className="text-3xl font-semibold tracking-tight">Everything a build needs</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <f.icon className="size-5 text-blue" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className="text-3xl font-semibold tracking-tight">From idea to live URL</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-mono text-sm text-accent">{s.n}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" className="border-t border-border-subtle bg-bg-raised/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-24 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <GitBranch className="size-6 text-blue" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Curious how this actually runs?
            </h2>
            <p className="mt-2 max-w-lg text-text-muted">
              Sandboxes, the agent harness, model-agnostic routing, the GitHub sync, deploys,
              scaling — the full architecture is written up, diagram included.
            </p>
          </div>
          <a href="https://github.com/shriyashish-mishra/architect-2.0/blob/main/ARCHITECTURE.md" target="_blank" rel="noreferrer">
            <Button variant="outline" size="lg">Read the architecture doc</Button>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
