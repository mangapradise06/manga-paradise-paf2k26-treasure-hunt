-- =============================================================
--  PAF 2K26 — Refonte v2
--  - narrative_role sur stands (pour le puzzle ANGEL BEATS)
--  - reset_used sur participants (1 reset autonome max)
--  - onboarding_seen sur participants (flag 1re connexion)
--  - ip_address sur participants + index pour détection doublons
--    côté admin (optionnel, nullable).
-- =============================================================

-- Colonnes de la refonte v2
alter table public.stands
  add column if not exists narrative_role text;

alter table public.participants
  add column if not exists reset_used boolean not null default false;

alter table public.participants
  add column if not exists onboarding_seen boolean not null default false;

alter table public.participants
  add column if not exists ip_address text;

-- Index utile côté admin (détection doublons IP).
-- On ne matérialise l'index que sur les lignes non-null pour éviter
-- l'overhead sur les participants sans IP enregistrée.
create index if not exists idx_participants_ip
  on public.participants(ip_address)
  where ip_address is not null;

comment on column public.stands.narrative_role is
  'Rôle narratif du personnage (ex: "Le stratège", "L''assassin"). Sert à reconstituer ANGEL BEATS à la fin.';
comment on column public.participants.reset_used is
  'True si le joueur a déjà utilisé son 1 reset autonome.';
comment on column public.participants.onboarding_seen is
  'True si le joueur a validé l''onboarding initial.';
comment on column public.participants.ip_address is
  'Adresse IP enregistrée à l''inscription (détection de doublons côté admin).';
