import type { ReactNode } from 'react'
import Disclaimer from '../components/Disclaimer'

const TABLA_VACACIONES = [
  { anio: '1', dias: 12 },
  { anio: '2', dias: 14 },
  { anio: '3', dias: 16 },
  { anio: '4', dias: 18 },
  { anio: '5', dias: 20 },
  { anio: '6 a 10', dias: 22 },
  { anio: '11 a 15', dias: 24 },
  { anio: '16 a 20', dias: 26 },
  { anio: '21 a 25', dias: 28 },
  { anio: '26 a 30', dias: 30 },
  { anio: '31 a 35', dias: 32 },
]

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="font-semibold text-primary mb-2">{titulo}</h2>
      <div className="text-sm text-gray-700 space-y-1">{children}</div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Cómo se calcula</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estas son las fórmulas que usa Laboral Suite, basadas en las prestaciones mínimas de la Ley
          Federal del Trabajo (LFT).
        </p>
      </div>

      <Bloque titulo="Salario diario">
        <p>Salario diario = salario mensual ÷ 30</p>
      </Bloque>

      <Bloque titulo="Aguinaldo proporcional">
        <p>Aguinaldo = salario diario × 15 × (días trabajados ÷ días reales del año: 365 o 366)</p>
        <p>Se calcula sobre los días trabajados dentro del año calendario en que ocurre la salida.</p>
      </Bloque>

      <Bloque titulo="Vacaciones y prima vacacional">
        <p>
          Los días de vacaciones que corresponden dependen de los años de antigüedad cumplidos,
          conforme a esta tabla:
        </p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b border-gray-200">Año de antigüedad</th>
                <th className="text-left p-2 border-b border-gray-200">Días de vacaciones</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_VACACIONES.map((fila) => (
                <tr key={fila.anio}>
                  <td className="p-2 border-b border-gray-100">{fila.anio}</td>
                  <td className="p-2 border-b border-gray-100">{fila.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2">
          Vacaciones pendientes = salario diario × (días devengados del último año completo +
          parte proporcional del periodo en curso − días ya disfrutados o pagados).
        </p>
        <p>Prima vacacional = vacaciones pendientes en dinero × 25%</p>
      </Bloque>

      <Bloque titulo="Salarios pendientes">
        <p>Salarios pendientes = salario diario × días trabajados pendientes de pago</p>
      </Bloque>

      <Bloque titulo="Prima de antigüedad">
        <p>Prima de antigüedad = salario diario × 12 × años de antigüedad (proporcional)</p>
        <p>
          El Art. 162 de la LFT limita el salario base de este cálculo al doble del salario
          mínimo general vigente en la zona correspondiente. Si tu salario diario excede ese
          tope, Laboral Suite usa el tope legal en lugar de tu salario real, tal como lo exige la ley.
        </p>
        <p>
          En caso de renuncia voluntaria, la ley exige 15 años o más de antigüedad para que sea
          exigible. En despido, no se requiere un mínimo de años.
        </p>
      </Bloque>

      <Bloque titulo="Indemnización constitucional (solo liquidación)">
        <p>Indemnización = salario diario integrado × 90 días</p>
        <p>
          Conforme a los Arts. 84 y 89 LFT, la base integra la cuota diaria y prestaciones
          habituales. Puedes capturarla; si no la conoces, se estima con aguinaldo y prima
          vacacional mínimos y el resultado lo advierte expresamente.
        </p>
        <p>Aplica únicamente en casos de despido injustificado.</p>
      </Bloque>

      <Bloque titulo="20 días por año (escenario informativo)">
        <p>20 días por año = salario diario integrado × 20 × años de antigüedad (proporcional)</p>
        <p>
          No procede automáticamente en todo despido injustificado. Se muestra separado porque su
          aplicación depende de los supuestos específicos de los Arts. 49 y 50 LFT.
        </p>
      </Bloque>

      <Bloque titulo="Incapacidad no profesional">
        <p>
          Cuando una incapacidad física o mental no derivada de riesgo de trabajo hace imposible
          prestar el servicio, se calcula un mes de salario más la prima de antigüedad de 12 días
          por año, conforme al Art. 54 LFT.
        </p>
        <p>Los riesgos de trabajo no se calculan en este módulo porque siguen reglas distintas.</p>
      </Bloque>

      <Disclaimer />
    </div>
  )
}
