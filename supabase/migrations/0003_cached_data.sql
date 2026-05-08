-- ============================================================
-- Migration: cached_data
-- À exécuter dans Supabase → SQL Editor → New query
--
-- Table générique clé/valeur pour cacher des données externes
-- (SullyGnome stats, plus tard d'autres trucs si besoin).
-- Les écritures se font uniquement via la cron côté serveur (secret key).
-- ============================================================

create table if not exists public.cached_data (
  key         text primary key,
  payload     jsonb not null,
  fetched_at  timestamptz not null default now()
);

alter table public.cached_data enable row level security;

-- Lecture publique (pour les server components qui utilisent l'anon key)
drop policy if exists "read_cached_data" on public.cached_data;
create policy "read_cached_data"
  on public.cached_data
  for select
  to anon, authenticated
  using (true);

-- Pas de policy pour insert/update/delete : seul le serveur (secret key)
-- peut écrire, et il bypass RLS automatiquement.
