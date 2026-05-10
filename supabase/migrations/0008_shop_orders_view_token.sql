-- ============================================================
-- Migration : view_token sur shop_orders pour les liens de suivi
-- À exécuter dans Supabase → SQL Editor → New query
-- ============================================================

-- Ajoute la colonne (nullable d'abord pour ne pas casser les rows existantes)
alter table public.shop_orders
  add column if not exists view_token uuid;

-- Génère un token pour les rows existantes
update public.shop_orders
  set view_token = gen_random_uuid()
  where view_token is null;

-- Bascule en NOT NULL + DEFAULT pour les futures insertions
alter table public.shop_orders
  alter column view_token set not null;
alter table public.shop_orders
  alter column view_token set default gen_random_uuid();

-- Index unique pour les lookups rapides + interdire la collision
create unique index if not exists shop_orders_view_token_idx
  on public.shop_orders(view_token);
