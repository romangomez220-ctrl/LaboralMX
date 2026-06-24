/**
 * core/types.ts
 * -----------------------------------------------------------------------------
 * Tipos de los datos que el parser extrae del XML. No representan el XSD
 * completo del SAT — solo los campos que esta herramienta necesita mostrar
 * y exportar. Ampliar aquí cuando se agregue un campo nuevo a la hoja de Excel.
 * -----------------------------------------------------------------------------
 */

export type TipoCfdi = 'cfdi-estandar' | 'cfdi-nomina' | 'no-cfdi';

export interface ImpuestoConcepto {
  tipo: 'traslado' | 'retencion';
  impuesto: string; // clave SAT, ej. '002' = IVA
  tasaOCuota: string;
  importe: string;
}

export interface Concepto {
  claveProdServ: string;
  noIdentificacion?: string;
  cantidad: string;
  claveUnidad: string;
  unidad?: string;
  descripcion: string;
  valorUnitario: string;
  importe: string;
  descuento?: string;
  impuestos: ImpuestoConcepto[];
}

export interface ComprobanteBase {
  uuid?: string; // del TimbreFiscalDigital, si existe
  version: string;
  serie?: string;
  folio?: string;
  fecha: string;
  tipoDeComprobante: string; // I, E, T, N, P
  subTotal: string;
  descuento?: string;
  total: string;
  moneda: string;
  formaPago?: string;
  metodoPago?: string;
  lugarExpedicion: string;
  emisorRfc: string;
  emisorNombre?: string;
  emisorRegimenFiscal?: string;
  receptorRfc: string;
  receptorNombre?: string;
  receptorUsoCfdi?: string;
  receptorDomicilioFiscal?: string;
  conceptos: Concepto[];
}

export interface PercepcionNomina {
  tipoPercepcion: string;
  clave: string;
  concepto: string;
  importeGravado: string;
  importeExento: string;
}

export interface DeduccionNomina {
  tipoDeduccion: string;
  clave: string;
  concepto: string;
  importe: string;
}

export interface OtroPagoNomina {
  tipoOtroPago: string;
  clave: string;
  concepto: string;
  importe: string;
}

export interface ComplementoNomina {
  tipoNomina: 'O' | 'E' | string;
  fechaPago: string;
  fechaInicialPago: string;
  fechaFinalPago: string;
  numDiasPagados: string;
  totalPercepciones?: string;
  totalDeducciones?: string;
  totalOtrosPagos?: string;
  trabajadorCurp?: string;
  trabajadorNumSeguridadSocial?: string;
  trabajadorRegimenFiscal?: string;
  trabajadorPuesto?: string;
  percepciones: PercepcionNomina[];
  deducciones: DeduccionNomina[];
  otrosPagos: OtroPagoNomina[];
}

export interface CfdiParseado {
  archivo: string; // solo el nombre, nunca se envía a ningún lado fuera del navegador
  comprobante: ComprobanteBase;
  nomina?: ComplementoNomina;
}

export interface ArchivoConError {
  archivo: string;
  motivo: string;
}

export interface ResultadoBatch {
  exitosos: CfdiParseado[];
  errores: ArchivoConError[];
}
