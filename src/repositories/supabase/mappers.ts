/**
 * repositories/supabase/mappers.ts
 * -----------------------------------------------------------------------------
 * Supabase/Postgres usa snake_case por convención; los tipos de dominio de
 * ROMANUS usan camelCase. Estos mapeadores son el único lugar donde esa
 * traducción ocurre — así los repositorios de Supabase nunca devuelven
 * snake_case hacia los componentes, y el resto del proyecto no necesita
 * saber que la base de datos existe.
 * -----------------------------------------------------------------------------
 */

import type {
  Asignacion,
  EstadoOperativoHerramienta,
  Feedback,
  RegistroActividad,
  Validador,
} from '../../labs-portal/types'

export function filaASupabaseValidador(fila: any): Validador {
  return {
    id: fila.id,
    usuario: fila.usuario,
    passwordTemporal: '', // nunca se lee de la base — vive solo en Supabase Auth.
    nombre: fila.nombre,
    profesion: fila.profesion ?? '',
    especialidad: fila.especialidad ?? '',
    nivel: fila.nivel,
    estado: fila.estado,
    fechaCreacion: fila.fecha_creacion,
    ultimoAcceso: fila.ultimo_acceso,
    calificacionInterna: fila.calificacion_interna,
    notasAdmin: fila.notas_admin ?? '',
  }
}

export function validadorAFilaSupabase(v: Partial<Validador>) {
  return {
    ...(v.usuario !== undefined && { usuario: v.usuario }),
    ...(v.nombre !== undefined && { nombre: v.nombre }),
    ...(v.profesion !== undefined && { profesion: v.profesion }),
    ...(v.especialidad !== undefined && { especialidad: v.especialidad }),
    ...(v.nivel !== undefined && { nivel: v.nivel }),
    ...(v.estado !== undefined && { estado: v.estado }),
    ...(v.calificacionInterna !== undefined && { calificacion_interna: v.calificacionInterna }),
    ...(v.notasAdmin !== undefined && { notas_admin: v.notasAdmin }),
  }
}

export function filaAEstadoOperativo(fila: any): EstadoOperativoHerramienta {
  return {
    herramientaId: fila.herramienta_id,
    estado: fila.estado,
    visiblePublicamente: fila.visible_publicamente,
    disponibleSoloLabs: fila.disponible_solo_labs,
    nivelMinimoRequerido: fila.nivel_minimo_requerido,
  }
}

export function estadoOperativoAFila(e: EstadoOperativoHerramienta) {
  return {
    herramienta_id: e.herramientaId,
    estado: e.estado,
    visible_publicamente: e.visiblePublicamente,
    disponible_solo_labs: e.disponibleSoloLabs,
    nivel_minimo_requerido: e.nivelMinimoRequerido,
  }
}

export function filaAAsignacion(fila: any): Asignacion {
  return {
    id: fila.id,
    validadorId: fila.validador_id,
    herramientaId: fila.herramienta_id,
    estado: fila.estado,
    fechaAsignacion: fila.fecha_asignacion,
    fechaActualizacion: fila.fecha_actualizacion,
  }
}

export function filaAFeedback(fila: any): Feedback {
  return {
    id: fila.id,
    herramientaId: fila.herramienta_id,
    validadorId: fila.validador_id,
    fecha: fila.fecha,
    calificacion: fila.calificacion,
    tipo: fila.tipo,
    comentario: fila.comentario,
    estado: fila.estado,
  }
}

export function filaAActividad(fila: any): RegistroActividad {
  return {
    id: fila.id,
    validadorId: fila.validador_id,
    tipo: fila.tipo,
    fecha: fila.fecha,
    herramientaId: fila.herramienta_id,
    duracionAproxSegundos: fila.duracion_aprox_segundos,
  }
}
