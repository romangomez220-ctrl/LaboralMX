import type { FeedbackRepository } from '../feedbackRepository'
import { supabase } from './client'
import { filaAFeedback } from './mappers'

export const supabaseFeedbackRepository: FeedbackRepository = {
  async listar() {
    const { data, error } = await supabase.from('feedback').select('*').order('fecha', { ascending: false })
    if (error || !data) return []
    return data.map(filaAFeedback)
  },

  async crear(datos) {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        herramienta_id: datos.herramientaId,
        validador_id: datos.validadorId,
        calificacion: datos.calificacion,
        tipo: datos.tipo,
        comentario: datos.comentario,
      })
      .select()
      .single()
    if (error || !data) {
      throw new Error(`No se pudo enviar el feedback: ${error?.message ?? 'error desconocido'}`)
    }
    return filaAFeedback(data)
  },

  async actualizarEstado(id, estado) {
    await supabase.from('feedback').update({ estado }).eq('id', id)
  },
}
