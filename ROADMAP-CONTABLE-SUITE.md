# ROADMAP — Contable Suite Pro

Documento de planeación. **Nada de lo aquí descrito está implementado.** Es la base para
decisiones futuras de producto, no un compromiso de fechas ni de alcance.

---

## 1. Estructura de Labs (conceptual)

```
Labs (oculto, sin enlace en navegación principal — solo URL directa)
│
├── Contable Suite
│   ├── RESICO Beta            ← disponible en /labs/resico
│   ├── XML CFDI Beta          ← disponible en /labs/xml-cfdi (CFDI estándar y Nómina → Excel)
│   └── Retenciones Beta       ← placeholder, sin desarrollar
│
└── Laboral Suite (experimentos)
    ├── Liquidación Beta       ← placeholder, sin desarrollar
    └── SDI Beta                ← placeholder, sin desarrollar
```

Reglas de Labs:
- Toda herramienta nueva se desarrolla primero en Labs antes de migrar a un producto público.
- Labs permanece oculto para usuarios generales: sin enlace en navegación principal, footer ni
  catálogo de productos. Acceso solo por URL directa.
- Aviso obligatorio en la página de Labs: "Herramientas experimentales en fase de validación. No
  sustituyen asesoría profesional."

---

## 2. Contable Suite — Free vs. Pro

### Contable Suite Free (actual)
- RESICO (Diagnóstico Inteligente).
- Herramientas básicas adicionales que se vayan agregando.
- Resultados informativos, sin guardado ni exportación.

### Contable Suite Pro (futuro, no implementado)
- Guardar cálculos.
- Historial de cálculos anteriores.
- Exportar a PDF.
- Exportar a Excel.
- Herramientas avanzadas:
  - XML CFDI → Excel sin límite de lote (la versión básica, con tope de 50 archivos, ya está
    disponible en Labs).
  - Estado de cuenta → Excel.
  - Retenciones.
  - Simuladores fiscales.

---

## 3. Arquitectura futura de usuarios (documentación únicamente)

### Fases

1. **Fase 1 — Arquitectura.** Definir roles y planes (ver abajo) a nivel de modelo de datos,
   sin implementar autenticación todavía.
2. **Fase 2 — Autenticación.** Supabase Auth, registro, login.
3. **Fase 3 — Persistencia.** Guardado de cálculos asociado a una cuenta.
4. **Fase 4 — Exportaciones premium.** PDF/Excel avanzados, disponibles solo para cuentas Pro.
5. **Fase 5 — Monetización.** Suscripciones y pagos.

### Roles futuros
- `user`
- `pro`
- `admin`

### Planes futuros
- `free`
- `pro`

---

## 4. Backlog validado por contador (feedback de fase beta)

Ideas futuras para Contable Suite, sin implementar todavía:

1. ~~XML CFDI → Excel.~~ Implementado en Labs (`/labs/xml-cfdi`), versión básica con tope de 50 archivos por lote.
2. Estado de Cuenta PDF → Excel.
3. Calculadora de Facturación con Retenciones.
4. Simulador de Flujo Fiscal.
5. Herramientas para Contadores (uso profesional, no solo para el contribuyente final).

---

## 5. Backlog futuro adicional

Mejoras futuras para el formulario de RESICO (y posiblemente otras herramientas de Contable Suite),
sin implementar todavía:

- Fecha de inicio de actividades.
- Manejo de ejercicios irregulares (años fiscales incompletos).
- Tipo de actividad, con mayor granularidad:
  - Servicios profesionales.
  - Actividad empresarial.
  - Comercio.
  - Arrendamiento.
  - Otra.

---

## 6. Nota de alcance

Este documento se limita a planeación y arquitectura conceptual. Cualquier implementación real
de lo aquí descrito (autenticación, pagos, exportaciones, nuevas herramientas) requiere su propio
proceso de especificación, scoping y aprobación — no se debe asumir que algo listado aquí ya está
en desarrollo.
