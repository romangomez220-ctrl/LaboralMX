import { describe, expect, it } from 'vitest'
import { evaluarObligacionResicoAnual } from './resicoAnual'

const base = {
  pagosMensualesCompletos: true,
  permanecioTodoElAnoEnResico: true,
  noExcedioTopeAnual: true,
  sinIngresosFueraDeResico: true,
  tieneIngresosEnCopropiedad: false,
  esAgapes: false,
  tuvoSuspensionActividades: false,
  fueExcluidoAMitadDeAno: false,
}

describe('evaluarObligacionResicoAnual', () => {
  it('reconoce la liberación cuando se cumplen las condiciones', () => {
    expect(evaluarObligacionResicoAnual(base).resultado).toBe('no_obligado')
  })

  it('marca obligación por otros ingresos o pagos mensuales incompletos', () => {
    expect(evaluarObligacionResicoAnual({ ...base, sinIngresosFueraDeResico: false }).resultado).toBe('obligado')
    expect(evaluarObligacionResicoAnual({ ...base, pagosMensualesCompletos: false }).resultado).toBe('obligado')
  })

  it('reserva para revisión los supuestos especiales no modelados', () => {
    expect(evaluarObligacionResicoAnual({ ...base, esAgapes: true }).resultado).toBe('zona_gris')
  })
})
