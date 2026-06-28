-- Run this in the Supabase SQL editor for your project.

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  client_id text unique not null,
  name text not null,
  picks jsonb not null default '{}'::jsonb,
  phase text not null default 'intro'
    check (phase in ('intro', 'predict', 'result')),
  champion text,
  picks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists predictions_updated_at_idx
  on public.predictions (updated_at desc);

create index if not exists predictions_champion_idx
  on public.predictions (champion);

alter table public.predictions enable row level security;
