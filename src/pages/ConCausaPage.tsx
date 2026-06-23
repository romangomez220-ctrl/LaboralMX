/**
 * Landing institucional, sin formularios ni backend, tal como se pidió
 * explícitamente. Solo presenta la iniciativa; no recolecta datos.
 */
export default function ConCausaPage() {
  return (
    <div className="flex flex-col gap-6 text-center pt-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold text-primary">ROMANUS con Causa</h1>
      <p className="text-sm text-gray-700">
        Iniciativa social orientada a acercar orientación jurídica inicial a personas en
        situación vulnerable.
      </p>
      <span className="inline-block self-center text-xs font-semibold text-gold-dark uppercase tracking-widest border border-gold rounded-full px-3 py-1">
        Próximamente
      </span>
    </div>
  )
}
