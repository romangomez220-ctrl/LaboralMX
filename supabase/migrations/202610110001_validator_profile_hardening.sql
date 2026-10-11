-- Impide que un validador autenticado eleve su nivel, reactive su cuenta o
-- modifique datos administrativos mediante PostgREST. La política RLS permite
-- actualizar la fila propia para registrar `ultimo_acceso`; este trigger limita
-- esa actualización al único campo que necesita el flujo de login.

create or replace function public.proteger_campos_validador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_admin() and (
    new.id is distinct from old.id
    or new.usuario is distinct from old.usuario
    or new.nombre is distinct from old.nombre
    or new.profesion is distinct from old.profesion
    or new.especialidad is distinct from old.especialidad
    or new.nivel is distinct from old.nivel
    or new.estado is distinct from old.estado
    or new.fecha_creacion is distinct from old.fecha_creacion
    or new.calificacion_interna is distinct from old.calificacion_interna
    or new.notas_admin is distinct from old.notas_admin
  ) then
    raise exception 'Solo un administrador puede modificar campos protegidos del validador.';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_campos_validador on public.validators;
create trigger proteger_campos_validador
before update on public.validators
for each row execute function public.proteger_campos_validador();
