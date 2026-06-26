/**
 * repositories/authRepository.ts
 * -----------------------------------------------------------------------------
 * Contrato de autenticación. Todos los métodos son async desde hoy, aunque
 * la implementación local de abajo envuelva llamadas síncronas a
 * localStorage — esto es deliberado: el día que se active la
 * implementación de Supabase (Fase 3), ningún componente que ya use
 * `await authRepository.loginValidador(...)` necesita cambiar una sola
 * línea, porque la forma de la llamada ya era async.
 * -----------------------------------------------------------------------------
 */

import type { Validador } from '../labs-portal/types'

export type ResultadoLogin =
  | { ok: true; validador: Validador }
  | { ok: false; error: string }

export type ResultadoLoginAdmin = { ok: true } | { ok: false; error: string }

export interface AuthRepository {
  loginValidador(usuario: string, password: string): Promise<ResultadoLogin>
  logoutValidador(validadorId: string): Promise<void>
  obtenerSesionValidadorId(): Promise<string | null>

  loginAdmin(usuario: string, password: string): Promise<ResultadoLoginAdmin>
  logoutAdmin(): Promise<void>
  haySesionAdminActiva(): Promise<boolean>

  /**
   * Envía un correo de recuperación de contraseña al validador. No existe
   * una forma segura de "forzar" una contraseña nueva sin pasar por este
   * flujo, salvo que se use la llave de servicio de Supabase desde un
   * backend propio — algo que deliberadamente no existe todavía (ver
   * RESUMEN-v7.0.md, sección de limitaciones).
   */
  solicitarRestablecerPassword(correo: string): Promise<{ ok: boolean; error?: string }>
}
