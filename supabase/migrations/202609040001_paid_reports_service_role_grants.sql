-- Edge Functions use the service_role JWT. RLS bypass alone does not grant
-- table privileges, so grant only the backend role the operations it needs.
grant select, insert, update, delete
  on table public.report_purchases
  to service_role;

grant select, insert, update, delete
  on table public.report_files
  to service_role;

-- Keep browser roles explicitly locked out.
revoke all on table public.report_purchases from anon, authenticated;
revoke all on table public.report_files from anon, authenticated;
