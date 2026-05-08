-- ============================================================
-- Migration : shop_orders + shop_order_items + shop_deliveries
-- Dépend de la migration 0004 (shop_products + shop_product_variants).
--
-- Toutes ces tables sont privées : pas de policy publique. Seul le serveur
-- (secret key) y accède via le bypass RLS — typiquement depuis les server
-- actions de /shop/admin.
-- ============================================================

-- ---------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------
create table if not exists public.shop_orders (
  id              bigserial primary key,
  ref             text unique not null,
  status          text not null default 'pending'
                  check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  customer_email  text,
  customer_name   text,
  shipping        jsonb,
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  total_cents     integer not null check (total_cents >= 0),
  currency        text not null default 'EUR',
  -- Flag pour distinguer les commandes simulées (mockup) des vraies. Tant que
  -- Stripe n'est pas activé, tout reste à true.
  mock            boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists shop_orders_status_idx on public.shop_orders(status);
create index if not exists shop_orders_created_idx on public.shop_orders(created_at desc);

drop trigger if exists shop_orders_updated_at on public.shop_orders;
create trigger shop_orders_updated_at
  before update on public.shop_orders
  for each row execute function public.shop_set_updated_at();

alter table public.shop_orders enable row level security;
-- Aucune policy publique : seul le serveur lit/écrit.

-- ---------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------
create table if not exists public.shop_order_items (
  id                bigserial primary key,
  order_id          bigint not null references public.shop_orders(id) on delete cascade,
  product_id        bigint references public.shop_products(id) on delete set null,
  variant_id        bigint references public.shop_product_variants(id) on delete set null,
  -- Snapshot des champs au moment de la commande (résiste à un rename produit ulterieur)
  code              text not null,
  name              text not null,
  size              text not null,
  quantity          integer not null check (quantity > 0),
  unit_price_cents  integer not null check (unit_price_cents >= 0)
);

create index if not exists shop_order_items_order_id_idx on public.shop_order_items(order_id);

alter table public.shop_order_items enable row level security;

-- ---------------------------------------------------------------
-- DELIVERIES (1-1 avec orders, créée quand on bascule en "shipped")
-- ---------------------------------------------------------------
create table if not exists public.shop_deliveries (
  id              bigserial primary key,
  order_id        bigint unique not null references public.shop_orders(id) on delete cascade,
  carrier         text,
  tracking_number text,
  status          text not null default 'preparing'
                  check (status in ('preparing', 'shipped', 'in_transit', 'delivered', 'exception')),
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists shop_deliveries_status_idx on public.shop_deliveries(status);

drop trigger if exists shop_deliveries_updated_at on public.shop_deliveries;
create trigger shop_deliveries_updated_at
  before update on public.shop_deliveries
  for each row execute function public.shop_set_updated_at();

alter table public.shop_deliveries enable row level security;
