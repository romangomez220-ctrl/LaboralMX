-- =============================================================================
-- ROMANUS Labs — corrección: permisos base faltantes + RPC para crear validador
-- -----------------------------------------------------------------------------
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql (no lo
-- reemplaza, lo complementa). Corrige: "permission denied for table X" al
-- crear/editar/eliminar validadores, asignar herramientas, enviar
-- feedback, etc.
--
-- CAUSA: activar RLS y escribir políticas NO otorga por sí solo los
-- permisos base (GRANT) sobre la tabla al rol `authenticated` — son dos
-- capas independientes en Postgres. schema.sql activó RLS y las políticas,
-- pero nunca emitió los GRANT. Sin el GRANT base, Postgres rechaza la
-- operación antes incluso de evaluar la política de RLS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Permisos base para el rol `authenticated`
-- -----------------------------------------------------------------------------
-- Se otorgan de forma amplia (SELECT/INSERT/UPDATE/DELETE) a propósito:
-- las políticas de RLS ya existentes en schema.sql son las que realmente
-- restringen QUIÉN puede hacer QUÉ sobre CADA FILA — este GRANT solo abre
-- la puerta para que esa evaluación de RLS pueda ocurrir en absoluto.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.validators to authenticated;
grant select, insert, update, delete on public.tools_state to authenticated;
grant select, insert, update, delete on public.validator_tool_assignments to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select on public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- 2. RPC SECURITY DEFINER para crear el perfil de un validador
-- -----------------------------------------------------------------------------
-- Capa adicional de seguridad para esta operación específica, tal como se
-- sugirió: en vez de depender únicamente del GRANT + política de RLS para
-- el INSERT, esta función corre con los privilegios de quien la creó
-- (normalmente el propietario de las tablas), y verifica el permiso de
-- administrador EXPLÍCITAMENTE adentro, con su propio mensaje de error.
-- Así, aunque algún GRANT se desconfigure en el futuro, esta operación en
-- particular sigue protegida de las dos formas.

create or replace function public.crear_perfil_validador(
  p_id uuid,
  p_usuario text,
  p_nombre text,
  p_profesion text,
  p_especialidad text,
  p_nivel text,
  p_estado text,
  p_calificacion_interna int,
  p_notas_admin text
)
returns public.validators
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.validators;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede crear perfiles de validador.';
  end if;

  insert into public.validators
    (id, usuario, nombre, profesion, especialidad, nivel, estado, calificacion_interna, notas_admin)
  values
    (p_id, p_usuario, p_nombre, p_profesion, p_especialidad, p_nivel, p_estado, p_calificacion_interna, p_notas_admin)
  returning * into fila;

  return fila;
end;
$$;

-- =============================================================================
-- FIN. Después de ejecutar esto, vuelve a intentar crear un validador desde
-- el panel admin — debería funcionar sin desactivar RLS en ningún momento.
-- =============================================================================
