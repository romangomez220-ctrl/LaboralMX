import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type CrearValidadorPayload = {
  usuario?: string
  passwordTemporal?: string
  nombre?: string
  profesion?: string
  especialidad?: string
  nivel?: string
  estado?: string
  calificacionInterna?: number | null
  notasAdmin?: string
}

type SupabaseAdminClient = ReturnType<typeof createClient>

type PerfilValidadorRpc = {
  p_id: string
  p_usuario: string
  p_nombre: string
  p_profesion: string
  p_especialidad: string
  p_nivel: string
  p_estado: string
  p_calificacion_interna: number | null
  p_notas_admin: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function pareceUsuarioExistente(error: { message?: string; status?: number } | null) {
  const mensaje = error?.message?.toLowerCase() ?? ''
  return error?.status === 422 || mensaje.includes('already') || mensaje.includes('exist') || mensaje.includes('registered')
}

async function buscarUsuarioAuthPorEmail(supabaseAdmin: SupabaseAdminClient, email: string) {
  const emailNormalizado = email.toLowerCase()

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error

    const encontrado = data.users.find((user) => user.email?.toLowerCase() === emailNormalizado)
    if (encontrado) return encontrado
    if (!data.nextPage) return null
  }

  throw new Error('No se pudo verificar el usuario existente en Auth por paginacion.')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse({ error: 'La Edge Function no esta configurada correctamente.' }, 500)
  }

  const authorization = req.headers.get('Authorization')
  if (!authorization) {
    return jsonResponse({ error: 'Sesion requerida.' }, 401)
  }

  const supabaseUsuario = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: usuarioActual, error: errorUsuario } = await supabaseUsuario.auth.getUser()
  if (errorUsuario || !usuarioActual.user) {
    return jsonResponse({ error: 'Sesion invalida.' }, 401)
  }

  const { data: esAdmin, error: errorAdmin } = await supabaseUsuario.rpc('is_admin')
  if (errorAdmin || !esAdmin) {
    return jsonResponse({ error: 'Esta cuenta no tiene permisos de administrador.' }, 403)
  }

  let payload: CrearValidadorPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Solicitud invalida.' }, 400)
  }

  const usuario = payload.usuario?.trim()
  const passwordTemporal = payload.passwordTemporal?.trim()
  const nombre = payload.nombre?.trim()

  if (!usuario || !passwordTemporal || !nombre) {
    return jsonResponse({ error: 'Faltan datos obligatorios para crear el validador.' }, 400)
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: altaAuth, error: errorAltaAuth } = await supabaseAdmin.auth.admin.createUser({
    email: usuario,
    password: passwordTemporal,
    email_confirm: true,
  })

  let authUser = altaAuth.user
  let usuarioFueCreadoAhora = true

  if (errorAltaAuth && pareceUsuarioExistente(errorAltaAuth)) {
    authUser = await buscarUsuarioAuthPorEmail(supabaseAdmin, usuario)
    usuarioFueCreadoAhora = false
  }

  if (errorAltaAuth && !authUser) {
    return jsonResponse(
      { error: `No se pudo crear la cuenta de autenticacion: ${errorAltaAuth?.message ?? 'error desconocido'}` },
      400,
    )
  }

  if (!authUser) {
    return jsonResponse({ error: 'No se pudo obtener el usuario de autenticacion.' }, 500)
  }

  const perfilPayload: PerfilValidadorRpc = {
    p_id: authUser.id,
    p_usuario: usuario,
    p_nombre: nombre,
    p_profesion: payload.profesion?.trim() ?? '',
    p_especialidad: payload.especialidad?.trim() ?? '',
    p_nivel: payload.nivel ?? 'validador_beta',
    p_estado: payload.estado ?? 'activo',
    p_calificacion_interna: payload.calificacionInterna ?? null,
    p_notas_admin: payload.notasAdmin ?? '',
  }

  const { data: filaCreada, error: errorPerfil } = await supabaseUsuario
    .rpc('crear_perfil_validador', perfilPayload)
    .single()

  if (errorPerfil || !filaCreada) {
    if (usuarioFueCreadoAhora) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    }

    if (errorPerfil?.code === '23505') {
      return jsonResponse({ error: 'Este usuario ya tiene un perfil de validador.' }, 409)
    }

    return jsonResponse(
      { error: `Se creo la cuenta de acceso, pero no el perfil: ${errorPerfil?.message ?? 'error desconocido'}` },
      500,
    )
  }

  return jsonResponse(filaCreada)
})
