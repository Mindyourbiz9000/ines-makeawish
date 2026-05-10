-- ============================================================
-- Migration : shop_settings (clé/valeur générique, privé)
-- À exécuter dans Supabase → SQL Editor → New query
--
-- Table key/value pour les paramètres admin (SMTP, marque, etc.).
-- Aucune lecture publique : seul le serveur (secret key) accède.
-- ============================================================

create table if not exists public.shop_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

drop trigger if exists shop_settings_updated_at on public.shop_settings;
create trigger shop_settings_updated_at
  before update on public.shop_settings
  for each row execute function public.shop_set_updated_at();

alter table public.shop_settings enable row level security;

-- Aucune policy publique : tout accès passe par le serveur (secret key).
