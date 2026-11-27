export type EstadoCampania = 'Activa' | 'Financiada' | 'Completada' | 'Fallida';

export interface Campania {
  estado: EstadoCampania;
  meta: bigint;
  recaudado: bigint;
  fechaLimite: number;
  hitoActual: number;
  hitos: bigint[];
  filas: number;
  columnas: number;
  precioLadrillo: bigint;
}

export interface Ladrillo {
  id: number;
  donante: string;
  monto: bigint;
  recuerdoCid: string;
  fecha: number;
}

export interface Recuerdo {
  version: 1;
  texto: string;
  imagenCid?: string;
  alias?: string;
  creado: string;
}

export const DECIMALES_USDC = 7;
export const UNIDAD_USDC = 10_000_000n;

export function formatearUsdc(monto: bigint): string {
  const entero = monto / UNIDAD_USDC;
  const decimales = (monto % UNIDAD_USDC).toString().padStart(DECIMALES_USDC, '0').slice(0, 2);
  return `${entero.toLocaleString('es-AR')},${decimales} USDC`;
}
