# LaboralMX

Calculadora laboral mexicana para estimar **finiquito** y **liquidación** de forma rápida y clara. 100% frontend, sin backend, sin login, sin base de datos.

> Esta herramienta ofrece una estimación informativa basada en prestaciones mínimas de la Ley Federal del Trabajo. No sustituye asesoría legal profesional.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router (navegación entre páginas)
- jsPDF (generación de PDF en el navegador)
- Sin backend, sin base de datos — deploy estático en Vercel

## Instalación

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Abre la URL que muestre la terminal (normalmente `http://localhost:5173`).

## Compilar para producción

```bash
npm run build
npm run preview   # para probar el build localmente
```

## Desplegar en Vercel

**Opción A — desde la web de Vercel:**
1. Sube este proyecto a un repositorio de GitHub/GitLab/Bitbucket.
2. Entra a [vercel.com](https://vercel.com) → "Add New Project" → importa el repositorio.
3. Vercel detecta automáticamente que es un proyecto Vite. Configuración por defecto:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Da clic en "Deploy".

**Opción B — desde la terminal:**
```bash
npm install -g vercel
vercel login
vercel        # despliegue de prueba
vercel --prod # despliegue a producción
```

## Estructura del proyecto

```
src/
  components/   Layout, Navbar, Disclaimer, ResultCard, InputField, SelectField
  pages/        Home, FiniquitoCalculator, LiquidacionCalculator, ResultPage, HowItWorks, LegalNotice
  utils/        laborCalculations, dateUtils, formatCurrency, pdfGenerator
  types/        labor.ts
```

## Alcance de esta versión (V1)

No incluye: IA, login, pagos, base de datos, CRM, chat, salarios caídos, horas extra, PTU, jurisprudencia ni gestor de expedientes.

## Limitaciones conocidas (pendientes para v2)

Identificadas en auditoría legal/técnica. No bloquean el uso de la herramienta como estimador informativo, pero quedan documentadas para una futura versión:

- **Vacaciones vencidas de años anteriores no contempladas.** El motor solo prorratea el año laboral *en curso* (desde el último aniversario hasta la fecha de salida). Si el trabajador tiene vacaciones de años completos anteriores que nunca disfrutó, esa deuda no se refleja en el resultado.
- **Edge case del 29 de febrero.** Si la fecha de ingreso es un 29 de febrero y el año del aniversario no es bisiesto, `Date.UTC` recorre la fecha al 1 de marzo (no hay corrección manual a 28 de febrero). Bajo impacto: solo afecta contrataciones hechas exactamente en años bisiestos un 29 de febrero.
- **Aguinaldo sin ajuste por año bisiesto.** El divisor de la fórmula es fijo en 365 días, sin distinguir años de 366 días. Diferencia de centésimas de día, alineado con la práctica de mercado.
- **Salario diario simple, no Salario Diario Integrado (SDI).** Todos los conceptos usan salario mensual ÷ 30, sin incorporar comisiones, bonos o prestaciones en especie recurrentes (Art. 84 LFT). Ya está advertido en el aviso legal general.
