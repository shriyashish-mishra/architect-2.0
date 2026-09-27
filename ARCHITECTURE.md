# Architect 2.0 — Technical Architecture

This document explains how I would actually build Architect 2.0 in the real world: every
service, why it exists, how the pieces talk to each other, and what happens between a user
typing a prompt and their app running live. It pairs with `architecture-diagram.svg` in this
repo.

The demo app in this repo (`/`, deployed live) is the **product surface** — the UI/UX and every
flow described below. It is intentionally *not* wired to a real agent, real sandboxes, or a real
model gateway (the assignment explicitly allows dummy flows for this). What follows is the
system I'd build behind that UI to make every one of those flows real.

---

## 1. The shape of the system

Six planes, each independently scalable and independently replaceable:

| Plane | Job | Built from |
|---|---|---|
| **Client** | The UI in this repo | Next.js (React), deployed to Vercel's edge network |
| **Control plane** | Auth, project/user metadata, orchestration API | Next.js Route Handlers + Postgres (Supabase) |
| **Realtime/Proxy** | Routes the browser to the right sandbox; streams agent output | A gateway service (Node, on the same fleet as the orchestrator) |
| **Agent plane** | Plans, writes code, runs tools, recovers from errors | Durable workflow workers (Temporal) + a model-agnostic LLM gateway |
| **Execution plane** | Where the user's app actually runs while being built | Firecracker microVMs (sandboxes), one per active project |
| **Delivery plane** | Turns a sandbox's files into a real, running, deployed app | Container build + Cloud Run / Fly.io / Vercel, plus GitHub |

I picked this split because the two hardest, most different problems in a system like this —
"run an LLM agent reliably for minutes at a time with retries" and "run untrusted, constantly
-changing code with near-instant feedback" — have almost opposite infrastructure needs (durable
queues vs. fast-booting VMs), and conflating them is where these platforms get expensive and
fragile. Keeping them as separate services that talk over a narrow API means either one can be
rebuilt or swapped without touching the other.

---

## 2. Sandboxes — where a user's app actually runs

**Choice: Firecracker microVMs**, one per active project, provisioned through a sandbox service
(architecturally identical to what E2B, Fly Machines, and Vercel Sandbox already offer as a
managed product — I'd start on one of those rather than operating Firecracker myself, and only
build in-house if usage justified the ops cost).

**Why microVMs over plain containers:** the code running here is agent-generated and, later,
user-edited — effectively untrusted. A container shares the host kernel; a microVM gets its own
kernel with hardware-virtualization isolation, while still booting in ~125ms (fast enough to feel
instant) because it only virtualizes what's needed to run one process tree, not a full OS. That's
the same trade-off AWS Lambda made when it built Firecracker in the first place.

**What each sandbox gets:**
- A base image per framework (Next.js, Python/FastAPI, plain Node, etc.) with the toolchain
  pre-installed and warm, so `npm install` isn't done from a cold cache every time.
- A writable filesystem, checkpointed to object storage (S3/R2) after every agent turn so a
  sandbox can be **paused and resumed** rather than kept running 24/7 — this is the main cost
  lever at scale (see §7).
- No public IP or inbound internet exposure. It only speaks to the proxy over an internal
  network; the proxy is the only thing that can reach its dev-server port or its file/exec API.

**Lifecycle:** create on first prompt → stay warm while the user is actively iterating → suspend
(snapshot + stop billing compute) after ~10 minutes idle → resume from snapshot in ~1-2s when the
user reopens the project or sends a new prompt.

---

## 3. The agent harness — plan, write, run, recover

The harness is a **durable workflow**, not a single long-lived function call, because builds can
take minutes, involve dozens of tool calls, and must survive a worker crashing mid-run. I'd use
**Temporal** (or an equivalent durable-execution framework) specifically because it checkpoints
each step: if a worker dies after step 7 of 12, a new worker resumes at step 8, not step 1.

One workflow execution = one agent turn. Its loop:

1. **Plan.** The model is given the user's message, the current file tree, and a summary of
   recent history (not the full transcript — see cost note below) and asked to produce a short
   step plan before touching anything. This plan is what streams into the chat panel first.
2. **Act.** For each step, the model is given a fixed tool surface — `read_file`, `write_file`,
   `list_files`, `run_command`, `search_docs` — and picks one. The workflow executes it against
   the sandbox through the proxy's exec API and returns the real result (stdout/stderr, a diff,
   a file's new contents) as the next message.
3. **Observe & recover.** Build/type errors are not failures of the workflow — they're expected
   tool results fed straight back to the model with the actual error text, which is what lets it
   self-correct (this is the `error` → `recover` step visible in the demo's Agent trace tab).
   The workflow enforces a bounded retry count per step (e.g. 3) so a genuinely stuck loop
   surfaces to the user instead of burning tokens forever.
4. **Checkpoint.** After every tool result, the workflow persists (a) the updated file diff to
   the sandbox's snapshot and (b) a trace row to Postgres, which is what the UI's chat/agent
   panels are actually reading — the "agent trace" you see in the demo is a real, replayable
   event log in production, not a chat transcript.
5. **Finish.** Once the plan's steps are done and a build/health-check passes, the workflow marks
   the run complete, and (if GitHub is connected) kicks off a commit as a separate, non-blocking
   step.

**Context management:** rather than replaying the whole conversation to the model every turn
(expensive and eventually exceeds context limits), the harness keeps a rolling summary of the
project plus only the diffs since the last turn, and re-reads specific files on demand via
`read_file` when the model asks — the same pattern real coding agents (Claude Code, Cursor) use.

---

## 4. Model-agnostic by construction

Nothing in the harness calls a provider SDK directly. It calls one internal interface —
`generate(messages, tools) → stream of tokens | tool_calls` — implemented by a small **model
gateway** service sitting behind the proxy, with one adapter per provider:

- Anthropic (Claude) via the Messages API
- OpenAI (GPT) via the Responses API
- Google (Gemini) via the Gemini API
- Self-hosted/open-source models via an OpenAI-compatible endpoint (vLLM/TGI), so anything that
  speaks that wire format works without a new adapter

This is the same shape as the Vercel AI SDK's provider abstraction or a LiteLLM proxy — I'd use
one of those rather than write it from scratch. Because every adapter normalizes to the same
tool-calling and streaming interface, the harness code (plan/act/observe/recover) never changes
when a user switches models in Settings; only which adapter the gateway routes to changes. This
also gives me one place to do cost tracking, per-provider rate-limit back-pressure, and
provider-outage fallback (if Claude's API is degraded, retry the same tool-call request against
GPT without the harness knowing anything happened).

---

## 5. Frontend ↔ sandbox ↔ backend, and the live preview

The browser **never talks to a sandbox directly** — sandboxes have no public address. Three
channels, all through the proxy:

1. **Control API** (`api.architect.app`) — normal request/response for CRUD: create a project,
   list projects, update settings. Backed by the Next.js control plane + Postgres.
2. **Realtime channel** (WebSocket, via the proxy, backed by Postgres logical replication /
   Supabase Realtime) — the harness's checkpoints (trace rows, file diffs, status changes) are
   inserted into Postgres, and the browser is subscribed to that project's rows. This is what
   makes the chat/agent panels update live without polling.
3. **Preview** — once a sandbox's dev server is up and passes a health check, the proxy exposes
   it at a per-project subdomain: `{project-slug}-{hash}.preview.architect.app`. That subdomain
   is a reverse-proxy route the gateway resolves to the sandbox's internal port. The workspace's
   preview iframe just points at that URL — it's a real HTTP connection to a real running dev
   server, with real hot-reload, not a static rendering.

## 6. Where the proxy sits, and what it does

The proxy is the single ingress point in front of both the realtime channel and every preview
subdomain (`*.preview.architect.app`). Concretely it:

- Terminates TLS for every wildcard preview subdomain and maps `{slug}-{hash}` → the sandbox's
  internal IP:port, so sandboxes stay on a private network with zero inbound exposure.
- Checks the request's Supabase session cookie against the project's `user_id` before proxying
  — a preview URL is only reachable by its owner (or, later, collaborators explicitly invited),
  even though the hostname itself is guessable.
- Multiplexes the exec/file-sync WebSocket the harness uses to run tool calls, so the sandbox's
  actual protocol (SSH-like exec, file watch) is never exposed to the public internet either.
- Applies per-project and per-user rate limits and concurrency caps (e.g. one active build per
  project at a time; N concurrent sandboxes per user on the free tier).

## 7. GitHub integration

A **GitHub App** (not OAuth-app + personal access tokens) installed per user/org, scoped to only
the repos they grant. Installation tokens are short-lived and scoped, so nothing long-lived sits
in the database. Two directions:

- **Architect → GitHub:** after a successful agent run, the harness writes the changed files as
  a real commit using the Git Data API (create blobs → a tree → a commit → move the branch ref)
  rather than running `git` inside the sandbox — this avoids needing git credentials inside a
  sandbox at all, and works identically whether or not a sandbox is currently warm.
- **GitHub → Architect:** a webhook on `push` lets Architect notice if someone pushed changes
  outside the tool (e.g. an engineer editing directly in their IDE) and pull them into the
  sandbox before the next agent run, so the two never silently diverge.
- **Import existing repo:** cloning a repo the user already has is the same GitHub App
  installation token, a shallow clone into a fresh sandbox, and then the harness treats it like
  any other project — this is also how "Import an existing project" from the homepage works.

## 8. Deploying — the user's app, and Architect 2.0 itself

**Deploying a user's app** is a separate, explicit step from building it (see the Deploy tab):
the harness builds an OCI image from the sandbox's current filesystem (Nixpacks/Buildpacks
auto-detect the framework so there's no Dockerfile the user has to think about, though a
technical user can supply one), pushes it to a registry, and deploys it to a target that fits the
app: static/Next.js apps to an edge platform (Vercel-like), arbitrary long-running services to a
container platform (Cloud Run / Fly.io). Env vars set in the Deploy tab are injected at this
step. The result is a stable production URL, distinct from the ephemeral `preview.architect.app`
sandbox URL, which keeps iterating.

**Deploying Architect 2.0 itself:**
- Client + control-plane API → **Vercel** (Next.js, edge + regional functions close to users).
- Auth + primary database → **Supabase** (managed Postgres, connection pooling via Supavisor,
  Row Level Security as the primary authorization boundary — every table policy is `auth.uid() =
  user_id`, so a leaked API key alone can't read another user's projects).
- Agent workers + model gateway + proxy/gateway service → containers on **Fly.io or AWS
  ECS/Fargate**, deployed in the same region as the Supabase project to keep the realtime
  round-trip fast.
- Sandbox fleet → the sandbox provider's own regions (E2B/Fly Machines), picked per-project to be
  close to the user.
- Durable workflow queue → **Temporal Cloud** (or self-hosted Temporal) fronting the agent plane.
- Object storage → **S3/R2** for sandbox filesystem snapshots and build artifacts.
- Everything emits structured logs/traces (OpenTelemetry) tagged with project + run id, so one
  stuck build is debuggable without grepping raw logs.

## 9. Scaling to thousands of concurrent users

The client and control-plane API are stateless and scale horizontally for free on Vercel. The
real scaling problems are the other two planes:

- **Sandboxes:** keep a small **warm pool** of pre-booted, un-assigned microVMs per framework so
  a new project doesn't pay a cold-boot penalty; bin-pack sandboxes across worker hosts; enforce
  hard per-user concurrency and resource quotas; aggressively suspend idle sandboxes (§2) — at
  thousands of users, most sandboxes are idle at any given moment, and paying compute only for
  the ones actively being worked on is what keeps this affordable.
- **Agent workers:** stateless, horizontally scaled behind the Temporal queue — adding capacity
  is adding workers, and because the workflow state lives in Temporal (not in worker memory), a
  worker can pick up any project's in-flight run.
- **Model calls:** the gateway holds keys/quota across multiple provider accounts and routes
  around whichever is near its rate limit, with request queuing and back-pressure so a burst of
  users doesn't 429 everyone at once.
- **Database:** Postgres connection pooling (Supavisor) is mandatory once there are more
  concurrent workers/sandboxes than Postgres' native connection limit; read replicas for
  dashboard/list queries once the primary is busy serving the agent plane's writes.
- **Isolation:** per-organization resource quotas and (for enterprise) dedicated sandbox pools,
  so one tenant's traffic spike can't starve another's.

---

## 10. Walkthrough: from a prompt to a live app

1. User types a prompt, hits send. The browser POSTs it to the control-plane API, which writes
   the message to Postgres and enqueues an agent-run workflow (project id, prompt, chosen model).
2. The API returns immediately; the browser is already subscribed to that project's realtime
   channel and starts showing "Architect is working…".
3. A Temporal worker picks up the workflow. If the project has no warm sandbox, it requests one
   from the sandbox service (resume from snapshot, or boot fresh from the framework's base image).
4. The workflow calls the model gateway with the prompt, file tree, and tool definitions. The
   gateway routes to the selected provider's adapter and streams back a plan, then tool calls.
5. Each tool call executes against the sandbox through the proxy's exec/file API; results (file
   diffs, command output) are checkpointed to Postgres as trace rows, which push to the browser
   over the realtime channel — this is the live plan → write → run → error → recover sequence in
   the chat and Agent tab.
6. Once the dev server passes a health check inside the sandbox, the proxy starts routing
   `{slug}.preview.architect.app` to it — the workspace's Preview tab is now looking at a real,
   live, hot-reloading app.
7. If GitHub is connected, the workflow commits the changed files via the Git Data API as a final,
   non-blocking step.
8. The project's status flips to `ready` in Postgres, which the dashboard and workspace both
   reflect immediately over the same realtime subscription.
9. When the user clicks Deploy, a separate (also durable) workflow builds an image from the
   sandbox's current files and ships it to the target platform, returning the production URL
   shown in the Deploy tab.

---

## What this repo actually demonstrates

- Every screen and flow described in the assignment (auth → homepage → chat → agent trace →
  preview → code view → GitHub → deploy), designed from first principles for both a
  non-technical builder (**Vibe mode**) and an engineer (**Pro mode**, same project).
- Real, working auth and a real, persisted database (Supabase: Postgres + Auth + Row Level
  Security) — projects and the full chat/agent trace are actually written and read per user, not
  mocked in local state. See `src/lib/supabase/*` and the `projects` / `project_messages` tables.
- A deterministic client-side simulation (`src/lib/architect/agent-sim.ts`) standing in for the
  real agent harness described above, so every flow is genuinely interactive rather than a static
  mockup.
