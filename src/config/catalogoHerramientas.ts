/**
 * Catálogo central de herramientas del ecosistema Laboral Suite / ROMANUS.
 *
 * Esto es infraestructura preparatoria (Mejora 6): hoy NO se consume en
 * ningún componente visible (Navbar, Home, etc. siguen con sus propios
 * arreglos locales, sin cambios de comportamiento). El objetivo es tener
 * un único lugar de referencia para cuando se decida centralizar esas
 * listas, y para dar de alta nuevas herramientas con metadata consistente
 * sin tener que re-diseñar la estructura desde cero.
 */

export type EstadoHerramienta = 'disponible' | 'planeada'

export interface HerramientaCatalogo {
  id: string
  nombre: string
  estado: EstadoHerramienta
  /** Ruta dentro de Laboral Suite; null si todavía no existe la página. */
  ruta: string | null
  descripcion: string
}

export const CATALOGO_HERRAMIENTAS: HerramientaCatalogo[] = [
  {
    id: 'finiquito',
    nombre: 'Finiquito',
    estado: 'disponible',
    ruta: '/productos/laboralmx/finiquito',
    descripcion: 'Cálculo de finiquito por renuncia, mutuo acuerdo u otros supuestos.',
  },
  {
    id: 'liquidacion',
    nombre: 'Liquidación',
    estado: 'disponible',
    ruta: '/productos/laboralmx/liquidacion',
    descripcion: 'Finiquito más indemnización constitucional en despido injustificado.',
  },
  {
    id: 'aguinaldo',
    nombre: 'Aguinaldo',
    estado: 'disponible',
    ruta: '/productos/laboralmx/aguinaldo',
    descripcion: 'Estimación de aguinaldo proporcional al 31 de diciembre.',
  },
  {
    id: 'vacaciones',
    nombre: 'Vacaciones y prima vacacional',
    estado: 'disponible',
    ruta: '/productos/laboralmx/vacaciones',
    descripcion: 'Días de vacaciones pendientes según antigüedad, y su prima.',
  },
  {
    id: 'sdi',
    nombre: 'Salario Diario Integrado (SDI)',
    estado: 'disponible',
    ruta: '/productos/laboralmx/sdi',
    descripcion: 'SDI estimado con prestaciones mínimas de ley.',
  },
  {
    id: 'prima-antiguedad-avanzada',
    nombre: 'Prima de antigüedad avanzada',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Cálculo de prima de antigüedad como herramienta independiente, con más supuestos.',
  },
  {
    id: 'horas-extra',
    nombre: 'Horas extra',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Horas extra dobles y triples, conforme a los Art. 66-68 LFT.',
  },
  {
    id: 'ptu',
    nombre: 'PTU',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Participación de los trabajadores en las utilidades.',
  },
  {
    id: 'indemnizacion-constitucional',
    nombre: 'Indemnización constitucional',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Indemnización de 90 días como herramienta independiente, fuera de Liquidación.',
  },
  {
    id: 'salarios-caidos',
    nombre: 'Salarios caídos',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Estimación de salarios vencidos durante un juicio laboral.',
  },
  {
    id: 'isr-estimado',
    nombre: 'ISR estimado',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Retención de ISR estimada sobre nómina.',
  },
  {
    id: 'calculos-imss',
    nombre: 'Cálculos IMSS',
    estado: 'planeada',
    ruta: null,
    descripcion: 'Cuotas obrero-patronales y prestaciones relacionadas con el IMSS.',
  },
]
