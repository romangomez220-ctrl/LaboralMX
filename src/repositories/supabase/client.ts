/**
 * repositories/supabase/client.ts
 * -----------------------------------------------------------------------------
 * Dos clientes, a propósito:
 *
 *   - `supabase`: el cliente normal, con sesión persistente — lo usa toda
 *     la app para leer/escribir datos y para el login normal.
 *
 *   - `crearClienteDesechable()`: un cliente NUEVO, sin sesión persistente,
 *     usado SOLO para que el admin pueda crear la cuenta de un validador
 *     (Supabase Auth `signUp`) sin que esa operación reemplace la sesión
 *     activa del propio admin en el navegador. Sin esto, dar de alta a un
 *     validador desde el panel de admin terminaría iniciando sesión como
 *     ESE validador en la pestaña del admin — un problema conocido de usar
 *     Supabase Auth solo con la llave pública, sin backend propio.
 *
 * Ninguna de las dos instancias usa la llave de servicio (`service_role`)
 * — esa llave NUNCA debe existir en código que se ejecuta en el navegador,
 * porque ignora por completo las políticas de RLS.
 * -----------------------------------------------------------------------------
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ROMANUS Labs no podrá conectarse a Supabase ' +
      'hasta que se configuren las variables de entorno — ver RESUMEN-v7.0.md, sección "Variables de entorno".',
  )
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')

export function crearClienteDesechable(): SupabaseClient {
  return createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      // Llave de almacenamiento única y distinta a la del cliente
      // principal. `persistSession: false` debería bastar para que este
      // cliente nunca escriba ni comparta sesión — pero darle también una
      // storageKey propia elimina por completo cualquier posibilidad de
      // que una sincronización de sesión entre instancias del mismo
      // origen "pise" la sesión del admin en el cliente principal mientras
      // se da de alta a un nuevo validador.
      storageKey: 'romanus-labs-alta-temporal',
    },
  })
}
