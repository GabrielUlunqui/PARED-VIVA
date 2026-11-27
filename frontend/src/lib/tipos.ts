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
  aporteMinimo: bigint;
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

export const APROBACIONES_NECESARIAS = 2;

export type EstadoHito = 'Pendiente' | 'EnAprobacion' | 'Pagado';

export interface Hito {
  indice: number;
  monto: bigint;
  aprobadoPor: string[];
  estado: EstadoHito;
}

export interface MiAporte {
  total: bigint;
  ladrillos: Ladrillo[];
  guardian: boolean;
}

export const DECIMALES_USDC = 7;
export const UNIDAD_USDC = 10_000_000n;

export function parsearUsdc(texto: string): bigint | null {
  const limpio = texto.trim().replace(',', '.');
  const match = limpio.match(/^(\d+)(?:\.(\d{1,7}))?$/);
  if (!match) return null;
  return BigInt(match[1]) * UNIDAD_USDC + BigInt((match[2] ?? '').padEnd(DECIMALES_USDC, '0'));
}

export function formatearUsdc(monto: bigint): string {
  const entero = monto / UNIDAD_USDC;
  const decimales = (monto % UNIDAD_USDC).toString().padStart(DECIMALES_USDC, '0').slice(0, 2);
  return `${entero.toLocaleString('es-AR')},${decimales} USDC`;
}
