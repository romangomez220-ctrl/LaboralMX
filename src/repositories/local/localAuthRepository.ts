import type { AuthRepository, ResultadoLogin, ResultadoLoginAdmin } from '../authRepository'
import {
  cerrarSesionAdmin,
  cerrarSesionValidador,
  guardarValidador,
  haySesionAdminActiva,
  iniciarSesionAdmin,
  iniciarSesionValidador,
  obtenerSesionValidadorId,
  obtenerValidadorPorUsuario,
  registrarActividad,
} from '../../labs-portal/storage/localStore'
import { validarCredencialesAdmin } from '../../labs-portal/storage/seedData'
import type { Validador } from '../../labs-portal/types'

export const localAuthRepository: AuthRepository = {
  async loginValidador(usuario, password): Promise<ResultadoLogin> {
    const encontrado = obtenerValidadorPorUsuario(usuario)
    if (!encontrado) {
      return { ok: false, error: 'Usuario no encontrado.' }
    }
    if (encontrado.estado === 'inactivo') {
      return { ok: false, error: 'Esta cuenta de validador está desactivada. Contacta al administrador.' }
    }
    if (encontrado.passwordTemporal !== password) {
      return { ok: false, error: 'Contraseña incorrecta.' }
    }
    const actualizado: Validador = { ...encontrado, ultimoAcceso: new Date().toISOString() }
    guardarValidador(actualizado)
    iniciarSesionValidador(actualizado.id)
    registrarActividad({ validadorId: actualizado.id, tipo: 'login', herramientaId: null, duracionAproxSegundos: null })
    return { ok: true, validador: actualizado }
  },

  async logoutValidador(validadorId) {
    registrarActividad({ validadorId, tipo: 'logout', herramientaId: null, duracionAproxSegundos: null })
    cerrarSesionValidador()
  },

  async obtenerSesionValidadorId() {
    return obtenerSesionValidadorId()
  },

  async loginAdmin(usuario, password): Promise<ResultadoLoginAdmin> {
    if (!validarCredencialesAdmin(usuario, password)) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }
    iniciarSesionAdmin()
    return { ok: true }
  },

  async logoutAdmin() {
    cerrarSesionAdmin()
  },

  async haySesionAdminActiva() {
    return haySesionAdminActiva()
  },

  async solicitarRestablecerPassword() {
    return { ok: false, error: 'No disponible en la implementación local — requiere Supabase Auth.' }
  },
}
