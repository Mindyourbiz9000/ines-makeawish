-- ============================================================
-- Migration : bucket Storage pour les images produit
-- Dépend des migrations 0004/0005.
--
-- Crée un bucket public 'shop-images' où le serveur (secret key) upload
-- les images uploadées depuis /shop/admin/products. Lecture publique pour
-- que <img src="..."> fonctionne sans signature.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('shop-images', 'shop-images', true)
on conflict (id) do update set public = excluded.public;

-- Lecture publique des objets dans ce bucket
drop policy if exists "Public read shop-images" on storage.objects;
create policy "Public read shop-images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'shop-images');

-- Pas de policy d'écriture publique : seul le serveur (secret key) écrit,
-- et il bypasse RLS automatiquement.
