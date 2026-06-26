# ROMANUS v7.0 — ROMANUS Labs / Admin / Validadores migrado a Supabase

## Ajustes a la Constitución Técnica, hechos explícitos durante la implementación

Tal como pediste, me detuve y documento aquí cada vez que algo no se construyó exactamente como
el documento de arquitectura sugiere a largo plazo:

1. **No se construyó el modelo completo de Identity (`Persona` + `AsignaciónDeRol` + catálogo de
   roles).** `validators` y `admins` quedaron como tablas separadas, simples. Es la simplificación
   correcta para el problema real de esta ronda ("los validadores no se sincronizan"); el modelo
   completo se justifica cuando exista un segundo consumidor real (Marketplace) que necesite la
   generalidad de roles superpuestos.
2. **El Registro de Suites/Herramientas (Fase 1) es código, no una tabla.** El admin edita el
   *estado operativo* (tabla `tools_state`), no la estructura — eso solo cambia desplegando código
   nuevo. Es la distinción "el registro declara qué existe; el estado operativo declara su
   situación actual" de la Constitución, documento 3.
3. **`usuario` pasó de ser un nombre de usuario libre a tener que ser un correo electrónico.**
   Supabase Auth funciona nativamente con correo/contraseña — no hay una forma estándar de usar
   "nombre de usuario" sin correo sin construir un sistema de autenticación propio, que está fuera
   de alcance de esta ronda.
4. **"Restablecer contraseña" ahora envía un correo real** (el flujo de recuperación nativo de
   Supabase). No existe una forma segura de que el admin fuerce una contraseña nueva sin pasar por
   correo usando solo la llave pública — eso requeriría la llave de servicio, que nunca debe vivir
   en código de navegador.
5. **"Suspender" y "revocar acceso" son la misma operación** (`estado = 'inactivo'`), no dos
   estados distintos. Ambos bloquean el inicio de sesión de la misma forma; separarlos en dos
   estados distintos no cambiaba ningún comportamiento real en esta ronda.
6. **Eliminar un validador borra su perfil, no su cuenta de autenticación.** Borrar la cuenta de
   Supabase Auth requiere la llave de servicio (Admin API), que no existe en este proyecto todavía
   — ver limitaciones.

## 1. Archivos modificados

```
src/App.tsx                                          — rutas generadas desde el registro, nueva ruta de restablecer password
src/vite-env.d.ts                                     — tipos de las variables de entorno de Supabase
package.json                                          — + @supabase/supabase-js
src/labs-portal/types.ts                              — Herramienta → EstadoOperativoHerramienta
src/labs-portal/storage/localStore.ts                 — funciones de Herramienta reemplazadas
src/labs-portal/storage/seedData.ts                   — siembra estado operativo, no estructura
src/labs-portal/auth/useValidatorSession.ts           — usa repositories/
src/labs-portal/auth/useAdminSession.ts                — usa repositories/
src/labs-portal/components/RequireValidatorAuth.tsx    — async, usa repositories/
src/labs-portal/components/FeedbackModal.tsx           — async, usa repositories/
src/labs-portal/pages/ValidadorLoginPage.tsx            — login async, label "correo"
src/labs-portal/pages/ValidadorPortalPage.tsx            — reescrita, carga async
src/labs-portal/admin/AdminLoginPage.tsx                — login async, label "correo"
src/labs-portal/admin/AdminDashboardPage.tsx            — reescrita, carga async
src/labs-portal/admin/AdminValidadoresPage.tsx          — reescrita: async + restablecer password + actividad
src/labs-portal/admin/AdminHerramientasPage.tsx         — reescrita, separa registro de estado operativo
src/labs-portal/admin/AdminFeedbackPage.tsx             — reescrita, carga async
src/labs-portal/admin/AdminEstadisticasPage.tsx         — reescrita, carga async
```

## 2. Archivos creados

```
src/catalog/types.ts, registry.ts                       — Fase 1: Registro Central
src/repositories/{auth,validators,tools,assignments,feedback,activity}Repository.ts  — Fase 2: interfaces
src/repositories/index.ts                                — Fase 2/3: punto único de conmutación
src/repositories/toolsView.ts                             — vista combinada registro + estado operativo
src/repositories/local/local*Repository.ts (×6)           — Fase 2: implementación local (conservada)
src/repositories/supabase/client.ts                       — Fase 3: cliente normal + cliente desechable
src/repositories/supabase/mappers.ts                      — Fase 3: snake_case ↔ camelCase
src/repositories/supabase/supabase*Repository.ts (×6)     — Fase 3: implementación real
src/labs-portal/pages/RestablecerPasswordPage.tsx          — Fase 3: callback de recuperación
supabase/schema.sql                                       — Fase 4: tablas + RLS completas
supabase/seed_tools_state.sql                              — Fase 4: siembra opcional
.env.example                                              — plantilla de variables de entorno
```

**Sin tocar:** Laboral Suite pública, Con Causa, `WhatsAppConsentModal`, Analytics global, Error
Boundaries, Layout principal, `laborCalculations.ts`, `resicoCalculations.ts`, los 6 motores de
cálculo de Contable Suite, el diseño visual general.

## 3. SQL completo para Supabase

Ver `supabase/schema.sql` (tablas + RLS, obligatorio) y `supabase/seed_tools_state.sql` (opcional).

## 4. Variables de entorno necesarias

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Plantilla en `.env.example`. **Nunca** la llave `service_role` en ningún archivo del proyecto.

## 5. Pasos exactos para configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (gratis para empezar).
2. Dashboard → **SQL Editor** → New query → pega el contenido completo de `supabase/schema.sql` →
   Run.
3. (Opcional) Repite con `supabase/seed_tools_state.sql`.
4. **Crear tu primer administrador** (no se puede hacer desde la app, a propósito):
   - Dashboard → **Authentication** → **Users** → **Add user** → captura un correo y una
     contraseña → Create user. Copia el **UID** que se generó.
   - Dashboard → **SQL Editor** → ejecuta:
     ```sql
     insert into public.admins (id, usuario) values ('PEGA-EL-UID-AQUI', 'el-correo-que-usaste');
     ```
5. Dashboard → **Settings → API** → copia **Project URL** y **anon public key**.

## 6. Pasos exactos para probar en localhost

```bash
cp .env.example .env.local
# Edita .env.local con tu URL y anon key reales
npm install
npm run dev
```

Abre `http://localhost:5173/labs/admin/login` y entra con el correo/contraseña que creaste en el
paso 4 de arriba.

## 7. Pasos exactos para desplegar en Vercel

1. Vercel → tu proyecto → **Settings → Environment Variables**.
2. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores de tu `.env.local`.
3. Redeploy (o simplemente haz push — Vercel ya despliega automáticamente en este proyecto).

## 8. Cómo crear un validador

1. Entra al panel admin (`/labs/admin`) ya autenticado como admin.
2. Sección **Validadores** → llena el formulario "Crear nuevo validador" — el campo "Correo
   electrónico" es el que usará para iniciar sesión, junto con la contraseña temporal que tú
   escribas ahí mismo.
3. Clic en "Crear validador". Esto crea, en un solo paso desde la UI: su cuenta de acceso
   (Supabase Auth) y su perfil (tabla `validators`) — sin afectar tu propia sesión de admin.
4. Comparte el correo y la contraseña temporal con la persona, por el canal que prefieras (esto
   todavía no envía un correo de bienvenida automático).

## 9. Cómo probar que aparece en otro dispositivo

1. Crea un validador desde tu computadora (paso anterior).
2. Desde **otro dispositivo o navegador** (o una ventana de incógnito), entra a
   `/labs/admin/login` con tus credenciales de admin.
3. Ve a **Validadores** — el que acabas de crear debe aparecer en la lista, porque ahora vive en
   la base de datos de Supabase, no en el `localStorage` de tu primer dispositivo.

## 10. Cómo iniciar sesión como validador

`/labs/login` → correo y contraseña que el admin le compartió → entra directo al portal con sus
herramientas asignadas.

## 11. Cómo iniciar sesión como administrador

`/labs/admin/login` → el correo/contraseña que creaste en el paso 4 de la sección 5.

## 12. Limitaciones actuales

- **Eliminar un validador no elimina su cuenta de Auth**, solo su perfil — requeriría la llave de
  servicio. La cuenta de Auth "huérfana" puede borrarse manualmente desde el Dashboard si hace
  falta.
- **No hay invitación por correo automática al crear un validador** — el admin comparte la
  contraseña temporal por fuera de la app.
- **Cambios de sesión en otra pestaña no se reflejan en vivo** (ej. si el admin desactiva a un
  validador mientras ese validador ya tiene una pestaña abierta, el validador no se desconecta
  automáticamente hasta que recargue o navegue).
- **"Suspender" y "revocar acceso" son la misma operación** (ver ajuste #5 arriba).
- **Sin pruebas automatizadas** de los repositorios de Supabase contra una base de datos real —
  todo se verificó por tipos (TypeScript) en este entorno, que no tiene acceso a red para probar
  contra un proyecto de Supabase real. La primera prueba real ocurre cuando tú sigas los pasos de
  la sección 6.

## 13. Riesgos técnicos pendientes

- Si algún día se necesita borrar cuentas de Auth o forzar contraseñas sin pasar por correo, hace
  falta una Edge Function con la llave de servicio (nunca en el cliente) — no construida en esta
  ronda, fuera de alcance explícito ("no implementar IA, marketplace, pagos").
- El campo `usuario` de `validators` debe mantenerse sincronizado con el correo real de
  Supabase Auth si alguna vez se permite que un validador cambie su propio correo — hoy no hay UI
  para eso, así que no hay riesgo todavía, pero quedará pendiente si se agrega.
- Las políticas de RLS se diseñaron y se revisaron con cuidado, pero no fueron probadas contra una
  base de datos real con datos de prueba — verificar con cuidado en la primera ronda de pruebas
  reales, especialmente los casos de "validador inactivo" y "sin sesión".

## 14. Qué quedó implementado de la Constitución Técnica v1.0

- **Documento 3 (Registro Central de Suites y Herramientas):** implementado en su forma de código
  (Fase 1), con la separación estructura/estado operativo tal como se diseñó.
- **Principio de capa de infraestructura desacoplada** (documento 1, sección de organización del
  proyecto): implementado vía la capa de repositorios (Fase 2) — es la primera vez que ROMANUS
  separa explícitamente "qué hace la app" de "dónde viven los datos".
- **RLS como mecanismo real de seguridad** (documento 1, sección 11; documento 2, sección 6):
  implementado — es la primera vez que ROMANUS tiene control de acceso real, no solo "ocultar
  rutas".
- **Cuenta/Credencial separada de Perfil** (documento 2, sección 1 y 9): implementado — ninguna
  contraseña vive en las tablas de la aplicación, solo en Supabase Auth.

## 15. Qué queda para una siguiente fase

- El modelo completo de Identity (`Persona` + `AsignaciónDeRol` + catálogo de roles) — cuando
  exista un segundo consumidor real de esa generalidad.
- Niveles de validador con progresión automática por criterios objetivos (documento 4 de la serie
  de arquitectura) — hoy el nivel sigue siendo un campo que el admin cambia a mano.
- Reputación calculada a partir de eventos inmutables (documento 4) — hoy `calificacion_interna`
  sigue siendo un campo editable directamente por el admin, no un valor calculado.
- Edge Function con llave de servicio, para borrado real de cuentas y gestión administrativa más
  completa de Auth.
- Cualquier cosa explícitamente fuera de alcance de esta ronda: usuarios públicos generales,
  Marketplace, pagos, IA.

## Build

Verificación estática de tipos de TypeScript después de cada una de las 5 fases de código: cero
errores nuevos en cada una. Único hallazgo, constante en todas: el artefacto ya conocido en
`SelectField.tsx`, no relacionado. Cero rutas duplicadas. `npm install && npm run build` reales,
contra un proyecto de Supabase real, quedan pendientes de tu lado — ver sección 6.

```bash
npm install
npm run build
git add .
git commit -m "v7.0: ROMANUS Labs/Admin/Validadores migrado a Supabase (Fases 1-5 de la Constitución Técnica)"
git push origin main
```
