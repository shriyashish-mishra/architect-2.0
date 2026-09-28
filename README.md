# Architect 2.0

A vibe-coding platform for both non-technical builders and engineers: describe an app in plain
language and watch it get planned, built, and previewed live — or drop into a real file tree,
terminal, and agent trace and take over yourself. One project, two front doors.

Built for the Lyzr "Architect 2.0" hiring assignment (Technical Product Manager · Architect).

**Live:** [architect-20-ten.vercel.app](https://architect-20-ten.vercel.app)
**Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`architecture-diagram.svg`](./architecture-diagram.svg)

## What's real vs. simulated

This is a product/UX prototype, not a production agent platform — the assignment explicitly
allows (and rewards) dummy flows, so here's exactly where the line is:

**Real and working:**
- Auth — email/password and anonymous "guest" sign-in, via Supabase Auth
- A real Postgres database (Supabase) with Row Level Security: every project and every chat/agent
  trace message is actually written and read per-user, not mocked in local component state
- The full navigation, every screen, and every flow in the assignment's feature list

**Simulated (by design — see `src/lib/architect/agent-sim.ts`):**
- The agent's plan/build/error/recover trace, the generated file tree and code, the live preview,
  GitHub connect/commit, and deploy — these are deterministic, client-driven simulations that
  make every flow genuinely interactive, standing in for the real backend described in
  `ARCHITECTURE.md` (real sandboxes, a real agent harness, a real model gateway, a real GitHub
  App, a real deploy pipeline).

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Supabase** — Postgres, Auth, Row Level Security
- Deployed on **Vercel**

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project's URL + anon key
npm run dev
```

Requires a Supabase project with the schema in `supabase/schema.sql` applied (or run the
`apply_migration` call in that file's header comment against a fresh project via the Supabase
CLI/MCP).

## Project structure

```
src/
  app/
    page.tsx                  marketing / landing page
    auth/                     sign-in, sign-up, server actions
    app/
      page.tsx                homepage — prompt box + project list
      projects/[id]/page.tsx  the workspace
      settings/                account, model keys, GitHub
  components/
    workspace/                 chat, preview, code, agent, github, deploy panels
    ui/                        shared primitives (button, badge, card)
  lib/
    architect/                 domain types + the build simulation
    supabase/                  browser/server/middleware Supabase clients
```

## Design

"Blueprint" — a dark, technical-drafting-table aesthetic (faint cyan grid, warm amber accent for
anything you can act on) chosen deliberately over the generic AI-purple-gradient look, since the
product is literally about drafting software. See `src/app/globals.css` for the token set.

## Why a non-technical user would pick this over Replit/Lovable/Emergent

Those tools are built prompt-first and treat "view the code" as an escape hatch. Architect treats
**both** audiences as first-class from the start: the same project a non-technical founder built
in Vibe mode is immediately a real, well-structured codebase an engineer can open in Pro mode —
no rewrite, no "now hand this to a developer to actually finish."

## Why a technical user would pick this over Claude Code/Codex/Cursor

Those are terminal/IDE-native — powerful, but every teammate needs to be comfortable in a
terminal to collaborate on the same project. Architect gives an engineer the same real file tree,
terminal, and agent trace, in the same project a PM or founder can drive from chat — so the
handoff between "someone described what they wanted" and "an engineer is now iterating on it" is
one URL, not an export.

## Author

**Shriyashish Mishra** — Product Manager, 3+ years building AI-powered and B2B SaaS products.
[LinkedIn](https://linkedin.com/in/shriyashish-mishra) · [Portfolio](https://shriyashish.lovable.app) · [GitHub](https://github.com/shriyashish-mishra)

Built for the Lyzr **Architect 2.0** hiring assignment (Technical Product Manager · Architect).
