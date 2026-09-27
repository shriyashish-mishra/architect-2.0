-- Architect 2.0 core schema: real auth-backed projects + chat history.
-- Everything else in the product (agent trace, deploy pipeline, GitHub sync)
-- is a simulated flow layered on top of this real, persisted data.
--
-- Applied to the live project via the Supabase MCP `apply_migration` tool.
-- To reproduce on a fresh Supabase project: paste this whole file into the
-- SQL editor, or `supabase db push` it as a migration.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled project',
  description text,
  framework text not null default 'nextjs', -- nextjs | react | python | node | other
  mode text not null default 'vibe', -- vibe | pro
  model text not null default 'claude', -- claude | gpt | gemini | oss
  status text not null default 'draft', -- draft | building | ready | deployed | error
  github_repo text,
  deploy_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null, -- user | agent | system
  content text not null,
  step_kind text, -- plan | write_code | run_tool | error | recover | info (nullable for plain chat)
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.project_messages enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

create policy "messages_select_own" on public.project_messages
  for select using (auth.uid() = user_id);
create policy "messages_insert_own" on public.project_messages
  for insert with check (auth.uid() = user_id);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists project_messages_project_id_idx on public.project_messages(project_id);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
