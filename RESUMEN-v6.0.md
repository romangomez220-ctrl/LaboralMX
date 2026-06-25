# ROMANUS v6.0 — Programa de Validadores + Portal Labs + Panel Administrativo

## Advertencia que debes leer antes de usar esto con validadores reales

Este sistema usa **únicamente `localStorage`**, tal como pediste. Eso significa que **no ofrece
seguridad real**:

- Cualquier persona con acceso al navegador (DevTools → Application → Local Storage) puede leer
  los usuarios, las "contraseñas temporales" y la sesión activa de cualquier validador o del
  administrador — en texto plano.
- No hay servidor que valide nada. Toda la "autenticación" es una comparación de strings que
  corre en el navegador del propio usuario.
- Las cuentas no se sincronizan entre dispositivos ni navegadores: un validador que entre desde su
  laptop y su celular verá dos sesiones independientes, sin relación entre sí.

Esto es aceptable únicamente como **prototipo funcional para una fase interna con validadores de
confianza** — exactamente lo que pediste —, nunca para datos reales de clientes ni como base de
producción pública. Lo dejé documentado sin ambigüedad en el código (`types.ts`,
`localStore.ts`) para que nadie en el futuro lo confunda con un sistema seguro.

## Arquitectura implementada

### Los tres niveles separados, como pediste

1. **ROMANUS Público** — sin cambios. Laboral Suite, Con Causa, todas las rutas públicas siguen
   exactamente igual, sin registro.
2. **ROMANUS Labs** — ahora requiere sesión de validador. Las 6 herramientas que ya existían
   (RESICO, XML CFDI, y las 4 de Contable Suite v5.0) quedaron envueltas en un guard de
   autenticación, sin tocar su lógica interna ni sus rutas.
3. **ROMANUS Admin** — portal completamente separado, con su propia sesión, su propio login, y su
   propia navegación lateral.

### La capa que hace esto "preparado para Supabase sin rehacer la arquitectura"

Todo el proyecto llama a funciones de un único archivo, `src/labs-portal/storage/localStore.ts`
(`listarValidadores`, `crearAsignacion`, `registrarActividad`, etc.) — ningún componente toca
`localStorage` directamente. El día que migren a Supabase, **ese es el único archivo que se
reescribe**: las mismas funciones, mismo nombre, mismos parámetros, pero haciendo
`await supabase.from('validadores')...` en vez de leer/escribir un array en `localStorage`. Los
componentes (páginas, hooks de sesión) no necesitan cambios de lógica — solo de sintaxis
(agregar `await` donde hoy es síncrono).

Los tipos en `src/labs-portal/types.ts` están diseñados para mapear 1:1 a futuras tablas:
`validadores`, `herramientas`, `asignaciones`, `feedback`, `actividad`.

## Portal del Validador (`/labs/login` → `/labs`)

Al iniciar sesión, el validador ve un dashboard real (no una página de links): nombre, perfil
profesional, especialidad, nivel, último acceso, sus herramientas asignadas con estado
(pendiente/en revisión/completada, y puede cambiarlo él mismo), sus comentarios enviados con el
estado de cada uno, y su historial de actividad reciente. Cada herramienta de Labs, al abrirse,
muestra una barra superior con su nombre y un botón de "Enviar feedback" que abre un modal
(tipo, calificación 1-5, comentario) — sin necesidad de tocar ninguna de las 6 páginas de
herramientas existentes.

## Panel Administrativo (`/labs/admin/login` → `/labs/admin/...`)

5 secciones, cada una con su propia ruta:
- **Resumen** — las métricas mínimas pedidas (validadores activos, herramientas activas/pendientes,
  feedback, errores, ideas) + actividad reciente de todo el sistema.
- **Validadores** — listado completo con todo lo pedido (especialidad, profesión, nivel, estado,
  último acceso, herramientas asignadas, cantidad de feedback, calificación interna, notas). Crear,
  desactivar/activar, eliminar, cambiar nivel, asignar/desasignar herramientas — todo desde la
  misma pantalla.
- **Herramientas** — metadata completa de cada una (suite, versión, estado, categoría, ruta, perfil
  recomendado, nivel mínimo, visibilidad pública, disponibilidad en Labs), editable en línea.
- **Feedback** — todo centralizado, con filtros por estado y por tipo, y cambio de estado en un
  clic.
- **Estadísticas** — herramientas más revisadas, herramientas con más errores, especialidades con
  mayor participación, herramientas listas para salir de Labs.

## Sistema de niveles

Implementado como metadata pura, sin lógica de permisos todavía (tal como pediste): Validador
Beta, Validador Especialista, Validador Senior, Miembro Fundador, Consejo Técnico ROMANUS — listos
en `NIVELES_VALIDADOR` (`types.ts`), asignables desde el panel admin, mostrados en el portal del
validador. Ningún comportamiento del sistema cambia todavía según el nivel.

## Seguimiento de actividad

Se registra automáticamente, sin que el validador tenga que hacer nada: inicio de sesión, cierre
de sesión, apertura de cada herramienta (con duración aproximada calculada al salir de ella), y
feedback enviado. Visible tanto en el portal del propio validador como en el panel admin.

## Credenciales de prueba

**Validador demo** (ya tiene 3 herramientas asignadas):
- Usuario: `validador.demo`
- Contraseña: `Romanus2026!`

**Administrador demo:**
- Usuario: `admin.romanus`
- Contraseña: `RomanusAdmin2026!`

Ambas viven en `src/labs-portal/storage/seedData.ts` — cámbialas ahí antes de invitar a
validadores reales, ya que (ver advertencia arriba) cualquiera puede leerlas desde el código fuente
del sitio.

## Archivos nuevos

```
src/labs-portal/
  types.ts
  storage/{localStore,seedData}.ts
  auth/{useValidatorSession,useAdminSession}.ts
  components/{RequireValidatorAuth,RequireAdminAuth,EstadoBadge,FeedbackModal}.tsx
  pages/{ValidadorLoginPage,ValidadorPortalPage}.tsx
  admin/{AdminLoginPage,AdminLayout,AdminDashboardPage,AdminValidadoresPage,
         AdminHerramientasPage,AdminFeedbackPage,AdminEstadisticasPage}.tsx
```

## Archivos modificados

- `src/App.tsx` — todas las rutas de Labs envueltas en `RequireValidatorAuth`; 7 rutas nuevas de
  login/admin; el guard se agregó como capa exterior a los `LabsErrorBoundary` ya existentes, sin
  tocarlos.
- `src/components/InputField.tsx` — ya tenía soporte de `disabled` desde v5.0; sin cambios nuevos
  esta ronda.

## Archivos eliminados

- `src/pages/LabsLandingPage.tsx` — su contenido (tarjetas de herramientas) quedó reemplazado por
  la sección "Herramientas asignadas" del nuevo `ValidadorPortalPage`. Confirmé que ningún otro
  archivo lo importaba antes de eliminarlo.

**Nota:** `src/components/EcosystemCard.tsx` quedó sin usar (era usado solo por la página
eliminada), pero lo dejé intacto — es un componente genérico reutilizable, no código roto, y
podría servir cuando Contable Suite salga de Labs al público.

**Sin tocar:** `laborCalculations.ts`, `resicoCalculations.ts`, Con Causa, `WhatsAppConsentModal`,
Analytics global, Error Boundaries existentes, Layout principal, rutas públicas de Laboral Suite,
y la lógica interna de las 6 herramientas de Labs (solo se envolvieron en el guard, no se
modificó ninguna).

## Qué queda preparado para la migración futura a backend real

- **Supabase/Postgres:** los 5 "stores" de `localStore.ts` mapean directo a 5 tablas.
- **Autenticación real:** ambos hooks de sesión (`useValidatorSession`, `useAdminSession`) ya
  separan "verificar credenciales" de "qué hace el componente con el resultado" — solo se
  reescribe el cuerpo de `iniciarSesion`.
- **Permisos por nivel:** la metadata de niveles y `nivelMinimoRequerido` por herramienta ya
  existe; falta la lógica que compare uno contra otro (deliberadamente no implementada, como
  pediste).
- **Correos/invitaciones:** no implementado; el campo `usuario` de `Validador` puede convertirse en
  email sin cambiar la forma del tipo.
- **Analytics/tickets/versionado:** la tabla de `actividad` y el campo `version` en `Herramienta`
  ya dejan el lugar para crecer ahí, sin necesitar una migración de esquema mayor.

## Build

Verificación estática de tipos de TypeScript sobre el proyecto completo: cero errores nuevos.
Único hallazgo: el artefacto ya conocido en `SelectField.tsx`, no relacionado. Cero rutas
duplicadas. `npm install && npm run build` reales quedan pendientes de tu lado.

```bash
npm install
npm run build
git add .
git commit -m "v6.0: Portal de Validadores + Panel Administrativo ROMANUS Labs"
git push origin main
```
