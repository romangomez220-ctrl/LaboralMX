const ESTILOS: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pendiente' },
  en_revision: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En revisión' },
  completada: { bg: 'bg-success-light', text: 'text-success', label: 'Completada' },
  resuelto: { bg: 'bg-success-light', text: 'text-success', label: 'Resuelto' },
  activo: { bg: 'bg-success-light', text: 'text-success', label: 'Activo' },
  inactivo: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Inactivo' },
  publicada: { bg: 'bg-success-light', text: 'text-success', label: 'Publicada' },
  lista_para_publico: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Lista para público' },
  en_validacion: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En validación' },
}

export default function EstadoBadge({ estado }: { estado: string }) {
  const estilo = ESTILOS[estado] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: estado }
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${estilo.bg} ${estilo.text}`}>
      {estilo.label}
    </span>
  )
}
