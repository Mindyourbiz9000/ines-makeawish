-- ============================================================
-- Migration: add "On dévoile notre projet secret" goal (15000€)
-- À exécuter dans Supabase → SQL Editor → New query
-- ============================================================

insert into public.donation_goals (amount, label, sort_order) values
  (15000, 'On dévoile notre projet secret', 12)
on conflict (sort_order) do nothing;
