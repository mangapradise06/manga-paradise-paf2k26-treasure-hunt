-- =============================================================
--  PAF 2K26 — Chasse au Trésor Manga Paradise
--  Migration initiale : tables, index, RLS, policies.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- PARTICIPANTS ----------
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  first_name        text      not null,
  last_name         text      not null,
  email             text      not null,
  pseudo            text      not null,
  rgpd_consent      boolean   not null default false,
  newsletter_consent boolean  not null default false,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz,
  final_anime_guess text,
  is_winner_eligible boolean  not null default false
);

create unique index if not exists participants_email_key on public.participants (lower(email));
create index if not exists participants_created_at_idx on public.participants (created_at desc);
create index if not exists participants_is_winner_eligible_idx on public.participants (is_winner_eligible);

-- ---------- STANDS ----------
create table if not exists public.stands (
  id              integer primary key,
  order_index     integer not null unique,
  name            text    not null,
  code            text,
  hint_1          text    not null,
  hint_2          text    not null,
  character_name  text    not null,
  anime_name      text    not null,
  initial         text    not null,
  map_x           numeric not null,
  map_y           numeric not null
);

create index if not exists stands_order_idx on public.stands (order_index);

-- ---------- PROGRESS ----------
create table if not exists public.progress (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  stand_id        integer not null references public.stands(id) on delete cascade,
  validated_at    timestamptz not null default now(),
  unique (participant_id, stand_id)
);

create index if not exists progress_participant_idx on public.progress (participant_id);
create index if not exists progress_stand_idx on public.progress (stand_id);

-- ---------- ATTEMPTS ----------
create table if not exists public.attempts (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  stand_id        integer not null references public.stands(id) on delete cascade,
  count           integer not null default 0,
  updated_at      timestamptz not null default now(),
  unique (participant_id, stand_id)
);

create index if not exists attempts_participant_idx on public.attempts (participant_id);

-- ---------- CONFIG ----------
create table if not exists public.config (
  key    text primary key,
  value  text not null
);

-- =============================================================
--  RLS : activée partout, accès restreint au service_role.
--  Les API routes côté Next passent par la SERVICE_ROLE key et
--  bypassent la RLS. Le client n'a AUCUN accès direct à ces tables.
-- =============================================================

alter table public.participants enable row level security;
alter table public.stands       enable row level security;
alter table public.progress     enable row level security;
alter table public.attempts     enable row level security;
alter table public.config       enable row level security;

-- Policies "service_role full access"
-- (service_role bypasse de toute façon la RLS ; on ajoute une policy
--  explicite pour documenter l'intention)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='participants' and policyname='service_role_all') then
    create policy "service_role_all" on public.participants
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='stands' and policyname='service_role_all') then
    create policy "service_role_all" on public.stands
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='progress' and policyname='service_role_all') then
    create policy "service_role_all" on public.progress
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='attempts' and policyname='service_role_all') then
    create policy "service_role_all" on public.attempts
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='config' and policyname='service_role_all') then
    create policy "service_role_all" on public.config
      for all to service_role using (true) with check (true);
  end if;
end
$$;

-- Aucune policy pour anon/authenticated → aucun accès direct client.
