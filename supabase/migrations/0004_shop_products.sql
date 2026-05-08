-- ============================================================
-- Migration : shop_products + shop_product_variants
-- À exécuter dans Supabase → SQL Editor → New query
--
-- Tables qui sous-tendent le catalogue boutique. Lisibles publiquement
-- (pour les server components qui rendent /shop) mais écriture impossible
-- côté client — toutes les mutations passent par des server actions
-- /shop/admin avec la secret key.
-- ============================================================

-- Helper trigger : maintient updated_at automatiquement.
create or replace function public.shop_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------
create table if not exists public.shop_products (
  id            bigserial primary key,
  slug          text unique not null,
  code          text not null,
  name          text not null,
  description   text,
  image_src     text,
  price_cents   integer not null,
  sort_order    integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists shop_products_updated_at on public.shop_products;
create trigger shop_products_updated_at
  before update on public.shop_products
  for each row execute function public.shop_set_updated_at();

alter table public.shop_products enable row level security;

drop policy if exists "read_active_shop_products" on public.shop_products;
create policy "read_active_shop_products"
  on public.shop_products
  for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------
-- VARIANTS (un produit a plusieurs tailles, chacune avec son stock)
-- ---------------------------------------------------------------
create table if not exists public.shop_product_variants (
  id          bigserial primary key,
  product_id  bigint not null references public.shop_products(id) on delete cascade,
  size        text not null,
  stock       integer not null default 0 check (stock >= 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, size)
);

create index if not exists shop_product_variants_product_id_idx
  on public.shop_product_variants(product_id);

drop trigger if exists shop_variants_updated_at on public.shop_product_variants;
create trigger shop_variants_updated_at
  before update on public.shop_product_variants
  for each row execute function public.shop_set_updated_at();

alter table public.shop_product_variants enable row level security;

drop policy if exists "read_active_shop_variants" on public.shop_product_variants;
create policy "read_active_shop_variants"
  on public.shop_product_variants
  for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------
-- SEED — les 6 produits SLAY existants (mockup), avec sizes + stock 10
-- ---------------------------------------------------------------
insert into public.shop_products (slug, code, name, description, image_src, price_cents, sort_order)
values
  ('t-shirt-noir', 'T-shirt', 'SLAY',
    'T-shirt noir 100% coton avec gros logo SLAY centré. Coupe regular, façonné pour durer.',
    '/shop/placeholder/tshirt-noir.jpg', 2500, 1),
  ('t-shirt-cropped', 'T-shirt cropped', 'SLAY',
    'T-shirt cropped bordeaux, logo SLAY discret côté cœur. Coupe ajustée, idéal layering.',
    '/shop/placeholder/tshirt-cropped.jpg', 2700, 2),
  ('sweat-blanc', 'Sweat', 'SLAY',
    'Sweat blanc oversize avec gros logo SLAY rose néon. Molleton gratté intérieur.',
    '/shop/placeholder/sweat-blanc.jpg', 4900, 3),
  ('sweat-rose', 'Sweat rosé', 'SLAY',
    'Sweat rose poudré avec logo SLAY noir et petit cœur sur le Y. Confort signature.',
    '/shop/placeholder/sweat-rose.jpg', 4900, 4),
  ('hoodie-noir', 'Hoodie', 'SLAY',
    'Hoodie noir oversize, logo SLAY côté cœur. Matière lourde, capuche doublée.',
    '/shop/placeholder/hoodie-noir.jpg', 6500, 5),
  ('hoodie-creme', 'Hoodie crème', 'SLAY',
    'Hoodie crème oversize, logo SLAY discret en serif. Toucher peach skin.',
    '/shop/placeholder/hoodie-creme.jpg', 6500, 6)
on conflict (slug) do nothing;

-- Variants — sizes par produit (cf. lib/shop/products.ts)
with seed as (
  select p.id as product_id, s.size, 10 as stock
  from public.shop_products p
  cross join lateral (
    select unnest(case p.slug
      when 't-shirt-noir' then array['XS','S','M','L','XL','XXL']
      when 't-shirt-cropped' then array['XS','S','M','L','XL']
      when 'sweat-blanc' then array['S','M','L','XL','XXL']
      when 'sweat-rose' then array['S','M','L','XL']
      when 'hoodie-noir' then array['S','M','L','XL','XXL']
      when 'hoodie-creme' then array['S','M','L','XL','XXL']
      else array[]::text[]
    end) as size
  ) s
)
insert into public.shop_product_variants (product_id, size, stock)
select product_id, size, stock from seed
on conflict (product_id, size) do nothing;
