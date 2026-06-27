-- =============================================================================
-- ROMANUS Labs — esquema de Supabase (Fase 4)
-- -----------------------------------------------------------------------------
-- Ejecutar completo, en orden, en el SQL Editor de tu proyecto de Supabase
-- (dashboard.supabase.com → tu proyecto → SQL Editor → New query → pegar todo
-- este archivo → Run).
--
-- Cubre: validators, admins, tools_state, validator_tool_assignments,
-- feedback, activity_logs, y las políticas mínimas de RLS descritas en la
-- solicitud original (Fase 4).
--
-- NO crea tablas de "users/profiles" genéricas de identidad — ese modelo
-- completo (Persona + AsignaciónDeRol) es el de la Constitución Técnica a
-- largo plazo, pero construirlo hoy sería sobre-construir para el problema
-- real ("los validadores no se sincronizan"). Esta es la simplificación
-- deliberada y documentada: `validators` y `admins` son tablas separadas
-- por ahora, referenciando ambas a `auth.users` (Supabase Auth) para la
-- credencial, nunca guardando contraseñas aquí.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA: admins
-- -----------------------------------------------------------------------------
-- Lista de quién es administrador. id = el UID de Supabase Auth de esa
-- persona (auth.users.id). No tiene contraseña ni datos de perfil — la
-- credencial vive en Supabase Auth, este registro solo dice "esta cuenta
-- de Auth tiene permisos de administrador".

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  usuario text not null,
  fecha_creacion timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: validators
-- -----------------------------------------------------------------------------
-- id = el UID de Supabase Auth de ese validador. Igual que admins: cero
-- contraseñas aquí.

create table if not exists public.validators (
  id uuid primary key references auth.users(id) on delete cascade,
  usuario text not null unique,                 -- correo usado para iniciar sesión
  nombre text not null,
  profesion text not null default '',
  especialidad text not null default '',
  nivel text not null default 'validador_beta'
    check (nivel in ('validador_beta','validador_especialista','validador_senior','miembro_fundador','consejo_tecnico')),
  estado text not null default 'activo' check (estado in ('activo','inactivo')),
  fecha_creacion timestamptz not null default now(),
  ultimo_acceso timestamptz,
  calificacion_interna int check (calificacion_interna between 1 and 5),
  notas_admin text not null default ''
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: tools_state (estado operativo de herramientas)
-- -----------------------------------------------------------------------------
-- herramienta_id usa los mismos id estables del Registro Central de código
-- (src/catalog/registry.ts, ej. 'tool_resico') — NO hay tabla de
-- "herramientas" en Supabase, porque la estructura de cada herramienta es
-- código, no datos (ver Constitución Técnica, documento 3 de la serie de
-- arquitectura). Esta tabla solo guarda lo editable en vivo.

create table if not exists public.tools_state (
  herramienta_id text primary key,
  estado text not null default 'en_validacion'
    check (estado in ('pendiente','en_validacion','lista_para_publico','publicada')),
  visible_publicamente boolean not null default false,
  disponible_solo_labs boolean not null default true,
  nivel_minimo_requerido text
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: validator_tool_assignments
-- -----------------------------------------------------------------------------

create table if not exists public.validator_tool_assignments (
  id uuid primary key default gen_random_uuid(),
  validador_id uuid not null references public.validators(id) on delete cascade,
  herramienta_id text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_revision','completada')),
  fecha_asignacion timestamptz not null default now(),
  fecha_actualizacion timestamptz,
  unique (validador_id, herramienta_id)
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: feedback
-- -----------------------------------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  herramienta_id text not null,
  validador_id uuid not null references public.validators(id) on delete cascade,
  fecha timestamptz not null default now(),
  calificacion int not null check (calificacion between 1 and 5),
  tipo text not null check (tipo in ('error','idea','comentario_general')),
  comentario text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_revision','resuelto'))
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: activity_logs
-- -----------------------------------------------------------------------------

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  validador_id uuid not null references public.validators(id) on delete cascade,
  tipo text not null check (tipo in ('login','logout','herramienta_abierta','feedback_enviado')),
  fecha timestamptz not null default now(),
  herramienta_id text,
  duracion_aprox_segundos int
);

-- -----------------------------------------------------------------------------
-- 7. Función auxiliar: ¿la sesión actual es de un admin?
-- -----------------------------------------------------------------------------
-- security definer + search_path fijo: evita que esta función se pueda
-- usar para colarse de otros esquemas, y permite que se use dentro de
-- políticas de RLS sobre las tablas que el rol normal no podría leer.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- 7b. RPC para crear el perfil de un validador (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
-- Crear un validador combina dos pasos: el alta en Supabase Auth (la app la
-- hace con un cliente desechable, ver src/repositories/supabase/client.ts)
-- y la creación de este perfil. Esta función hace el segundo paso con
-- privilegios propios, verificando is_admin() explícitamente adentro — así
-- esta operación queda protegida incluso si el GRANT de la sección 8 se
-- desconfigurara en el futuro.

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

grant execute on function public.crear_perfil_validador(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  int,
  text
) to authenticated;

-- -----------------------------------------------------------------------------
-- 8. Activar RLS en todas las tablas (negar todo por defecto)
-- -----------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.validators enable row level security;
alter table public.tools_state enable row level security;
alter table public.validator_tool_assignments enable row level security;
alter table public.feedback enable row level security;
alter table public.activity_logs enable row level security;

-- -----------------------------------------------------------------------------
-- 8b. Permisos base para el rol `authenticated`
-- -----------------------------------------------------------------------------
-- IMPORTANTE: activar RLS y escribir políticas NO otorga por sí solo los
-- permisos base (GRANT) sobre una tabla — son dos capas independientes en
-- Postgres. Sin este GRANT, toda operación falla con "permission denied
-- for table X" ANTES de que las políticas de RLS de abajo lleguen a
-- evaluarse. Las políticas de RLS siguen siendo las que de verdad
-- restringen qué fila puede tocar cada quien — este GRANT solo abre la
-- puerta para que esa evaluación ocurra.

grant usage on schema public to authenticated;
grant usage on schema public to anon;
grant select, insert, update, delete on public.validators to authenticated;
grant select, insert, update, delete on public.tools_state to authenticated;
grant select on public.tools_state to anon;
grant select, insert, update, delete on public.validator_tool_assignments to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select on public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- 9. Políticas — admins
-- -----------------------------------------------------------------------------
-- Solo un admin puede leer la lista de admins (para que el panel pueda
-- mostrarla si algún día se necesita). Nadie puede crear/editar/borrar
-- admins desde el navegador — eso se hace manualmente desde el SQL Editor
-- (ver instrucciones de configuración), justamente para que la promoción a
-- administrador nunca pueda hacerse desde la app con solo la llave pública.

create policy "admins_select_solo_admin" on public.admins
  for select using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 10. Políticas — validators
-- -----------------------------------------------------------------------------
-- Un validador puede ver y actualizar SOLO su propia fila (ej. para que la
-- app pueda actualizar su último acceso). El admin puede todo.
-- Importante: un validador suspendido ('inactivo') sigue pudiendo hacer
-- SELECT de su propia fila (la app necesita leerla para mostrar el mensaje
-- de "cuenta desactivada" y cerrar la sesión) — el bloqueo real de acceso a
-- TODO LO DEMÁS pasa por las políticas de assignments/feedback/activity de
-- abajo, que sí exigen estado = 'activo'.

create policy "validators_select_propio_o_admin" on public.validators
  for select using (id = auth.uid() or public.is_admin());

create policy "validators_update_propio_o_admin" on public.validators
  for update using (id = auth.uid() or public.is_admin());

create policy "validators_insert_solo_admin" on public.validators
  for insert with check (public.is_admin());

create policy "validators_delete_solo_admin" on public.validators
  for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 11. Políticas — tools_state
-- -----------------------------------------------------------------------------
-- Cualquier validador activo puede LEER el estado operativo (lo necesita
-- para saber, por ejemplo, si una herramienta sigue disponible). Solo el
-- admin puede modificarlo.

create policy "tools_state_select_validador_activo_o_admin" on public.tools_state
  for select using (
    public.is_admin()
    or exists (select 1 from public.validators v where v.id = auth.uid() and v.estado = 'activo')
  );

create policy "tools_state_select_publicadas" on public.tools_state
  for select using (
    visible_publicamente = true
    and disponible_solo_labs = false
    and estado in ('lista_para_publico', 'publicada')
  );

create policy "tools_state_write_solo_admin" on public.tools_state
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 12. Políticas — validator_tool_assignments
-- -----------------------------------------------------------------------------
-- Esta es la regla explícitamente pedida: "un validador solo ve sus
-- herramientas asignadas". Solo puede ver/actualizar SUS PROPIAS
-- asignaciones, y solo si su cuenta está activa. Crear/eliminar
-- asignaciones es solo del admin.

create policy "asignaciones_select_propias_activo_o_admin" on public.validator_tool_assignments
  for select using (
    public.is_admin()
    or (
      validador_id = auth.uid()
      and exists (select 1 from public.validators v where v.id = auth.uid() and v.estado = 'activo')
    )
  );

create policy "asignaciones_update_propias_activo_o_admin" on public.validator_tool_assignments
  for update using (
    public.is_admin()
    or (
      validador_id = auth.uid()
      and exists (select 1 from public.validators v where v.id = auth.uid() and v.estado = 'activo')
    )
  );

create policy "asignaciones_insert_solo_admin" on public.validator_tool_assignments
  for insert with check (public.is_admin());

create policy "asignaciones_delete_solo_admin" on public.validator_tool_assignments
  for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 13. Políticas — feedback
-- -----------------------------------------------------------------------------
-- Un validador activo puede crear feedback propio y ver SU PROPIO
-- feedback. Solo el admin puede ver todo el feedback (de todos los
-- validadores) y cambiar su estado.

create policy "feedback_select_propio_o_admin" on public.feedback
  for select using (public.is_admin() or validador_id = auth.uid());

create policy "feedback_insert_propio_activo" on public.feedback
  for insert with check (
    validador_id = auth.uid()
    and exists (select 1 from public.validators v where v.id = auth.uid() and v.estado = 'activo')
  );

create policy "feedback_update_solo_admin" on public.feedback
  for update using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 14. Políticas — activity_logs
-- -----------------------------------------------------------------------------

create policy "actividad_select_propia_o_admin" on public.activity_logs
  for select using (public.is_admin() or validador_id = auth.uid());

create policy "actividad_insert_propia_activo" on public.activity_logs
  for insert with check (
    validador_id = auth.uid()
    and exists (select 1 from public.validators v where v.id = auth.uid() and v.estado = 'activo')
  );

-- =============================================================================
-- FIN DEL ESQUEMA. Después de ejecutar esto, sigue:
--   1. Crear tu primer administrador (ver instrucciones en RESUMEN-v7.0.md,
--      sección "Pasos exactos para configurar Supabase", paso 4).
--   2. Sembrar tools_state con las herramientas de Labs (mismo documento,
--      paso 5) — opcional, la app usa un valor por default si una fila no
--      existe todavía.
-- =============================================================================
