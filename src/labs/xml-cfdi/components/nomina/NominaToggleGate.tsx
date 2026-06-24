/**
 * components/nomina/NominaToggleGate.tsx
 * -----------------------------------------------------------------------------
 * Si converterConfig.nominaEnabled es false, no monta nada de este subárbol.
 * No es una ocultación con CSS (display:none) — el componente ni se renderiza,
 * así que tampoco corre lógica de nómina innecesaria.
 * -----------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';
import { converterConfig } from '../../config';

export function NominaToggleGate({ children }: { children: ReactNode }) {
  if (!converterConfig.nominaEnabled) {
    return null;
  }
  return <>{children}</>;
}
