-- ============================================================
-- Migration: donation_goals
-- À exécuter dans Supabase → SQL Editor → New query
-- ============================================================

create table if not exists public.donation_goals (
  id          bigserial primary key,
  amount      integer not null,
  label       text not null,
  completed   boolean not null default false,
  sort_order  integer not null,
  updated_at  timestamptz not null default now()
);

create unique index if not exists donation_goals_sort_order_key
  on public.donation_goals (sort_order);

-- Activer Row Level Security
alter table public.donation_goals enable row level security;

-- Lecture publique (pour l'anon key utilisée côté navigateur)
drop policy if exists "read_donation_goals" on public.donation_goals;
create policy "read_donation_goals"
  on public.donation_goals
  for select
  to anon, authenticated
  using (true);

-- Les écritures sont bloquées pour tout le monde.
-- Les mises à jour se font côté serveur via la secret key (qui bypass RLS).

-- Activer Realtime sur la table pour que les viewers voient les updates en direct
alter publication supabase_realtime add table public.donation_goals;

-- Seed (insère les paliers s'ils n'existent pas déjà)
insert into public.donation_goals (amount, label, sort_order) values
  (1,    'J''allume le micro',                                                        1),
  (50,   'Red Bull cul sec + concours de rot',                                        2),
  (200,  'J''appelle ma maman et je lui gratte un don',                               3),
  (500,  'Face reveal de Blasheer aka GP2',                                           4),
  (800,  '1v1 Just Dance avec Blasheer',                                              5),
  (1200, 'Premier tribunal des bannis de la chaîne',                                  6),
  (1500, 'J''apprends la choré de Jennie à Broocoline',                               7),
  (1800, 'Interview fin de carrière avec Broocoline',                                 8),
  (2000, 'Cosplay Jenna & Clara avec Broocoline',                                     9),
  (2500, 'J''appelle la personne la plus connue de mon téléphone',                   10),
  (3000, 'J''invite Booba (via un réel) pour une interview sur le milieu du stream', 11)
on conflict (sort_order) do nothing;
