import type { ValidatorsRepository } from '../validatorsRepository'
import {
  crearValidador,
  eliminarValidador,
  guardarValidador,
  listarValidadores,
  obtenerValidadorPorId,
  obtenerValidadorPorUsuario,
} from '../../labs-portal/storage/localStore'

export const localValidatorsRepository: ValidatorsRepository = {
  async listar() {
    return listarValidadores()
  },
  async obtenerPorId(id) {
    return obtenerValidadorPorId(id)
  },
  async obtenerPorUsuario(usuario) {
    return obtenerValidadorPorUsuario(usuario)
  },
  async crear(datos) {
    return crearValidador(datos)
  },
  async guardar(validador) {
    guardarValidador(validador)
  },
  async eliminar(id) {
    eliminarValidador(id)
  },
}
