-- Amplía Paid Reports a todas las calculadoras públicas de Laboral Suite.
-- No cambia RLS, permisos, Storage ni datos de compras existentes.
alter table public.report_purchases
  drop constraint if exists report_purchases_calculator_type_check;

alter table public.report_purchases
  add constraint report_purchases_calculator_type_check
  check (calculator_type in ('liquidacion', 'finiquito', 'aguinaldo', 'vacaciones', 'sdi'));

alter table public.report_purchases
  alter column report_folio set default
  ('RMS-LAB-REP-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8)));
