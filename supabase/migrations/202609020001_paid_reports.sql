create table if not exists public.report_purchases (
  id uuid primary key default gen_random_uuid(),
  report_folio text not null unique default ('RMS-LAB-LIQ-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8))),
  calculator_type text not null check (calculator_type in ('liquidacion')),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency = 'MXN'),
  payment_provider text not null check (payment_provider = 'stripe'),
  provider_checkout_id text unique,
  provider_payment_id text unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  report_status text not null default 'pending' check (report_status in ('pending','authorized','generating','generated','failed')),
  report_version text not null,
  calculator_version text not null,
  calculation_snapshot jsonb not null,
  access_token_hash text not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  generation_started_at timestamptz,
  generated_at timestamptz,
  downloaded_at timestamptz,
  download_count integer not null default 0 check (download_count >= 0)
);

-- Las sentencias siguientes también hacen segura la reaplicación si las tablas
-- ya existían por una ejecución parcial de esta migración.
alter table public.report_purchases
  add column if not exists generation_started_at timestamptz;

alter table public.report_purchases
  drop constraint if exists report_purchases_report_status_check;
alter table public.report_purchases
  add constraint report_purchases_report_status_check
  check (report_status in ('pending','authorized','generating','generated','failed'));

alter table public.report_purchases
  drop constraint if exists report_purchases_access_token_hash_check;
alter table public.report_purchases
  add constraint report_purchases_access_token_hash_check
  check (access_token_hash ~ '^[0-9a-f]{64}$');

create unique index if not exists report_purchases_access_token_hash_uidx
  on public.report_purchases (access_token_hash);
create index if not exists report_purchases_payment_status_idx
  on public.report_purchases (payment_status, created_at desc);
create index if not exists report_purchases_report_status_idx
  on public.report_purchases (report_status, generation_started_at);

create table if not exists public.report_files (
  purchase_id uuid primary key references public.report_purchases(id) on delete cascade,
  storage_path text not null unique,
  checksum text not null,
  created_at timestamptz not null default now()
);

alter table public.report_files
  drop constraint if exists report_files_checksum_check;
alter table public.report_files
  add constraint report_files_checksum_check
  check (checksum ~ '^[0-9a-f]{64}$');

alter table public.report_purchases enable row level security;
alter table public.report_files enable row level security;

-- Sin políticas públicas: anon/authenticated no pueden leer ni modificar compras.
revoke all on public.report_purchases from anon, authenticated;
revoke all on public.report_files from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('paid-reports', 'paid-reports', false, 5242880, array['application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects es administrada por Supabase y ya opera con RLS.
-- No se altera su definición ni ownership desde esta migración.

comment on table public.report_purchases is
  'Compras de reportes ROMANUS. Solo accesible mediante Edge Functions con service role.';
