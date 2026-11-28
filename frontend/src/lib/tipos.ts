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
  if (match[2] && match[2].length > DECIMALES_USDC) return null; // más de 7 decimales: usar errorMontoUsdc para el mensaje
  return BigInt(match[1]) * UNIDAD_USDC + BigInt((match[2] ?? '').padEnd(DECIMALES_USDC, '0'));
}

export function formatearMonto(monto: bigint, codigo: string, decimales = 2): string {
  const entero = (monto / UNIDAD_USDC).toLocaleString('es-AR');
  const fraccion = (monto % UNIDAD_USDC).toString().padStart(DECIMALES_USDC, '0').slice(0, decimales);
  const numero = decimales ? `${entero},${fraccion}` : entero;
  return codigo ? `${numero} ${codigo}` : numero;
}

/** Mensaje específico para un monto que parsearUsdc rechazó (o null si es válido). */
export function errorMontoUsdc(texto: string): string | null {
  const limpio = texto.trim().replace(',', '.');
  const decimales = limpio.split('.')[1];
  if (decimales && decimales.length > DECIMALES_USDC) return 'USDC tiene hasta 7 decimales. Redondeá el monto.';
  if (!/^(\d+)(\.\d{1,7})?$/.test(limpio)) return 'Ingresá un monto válido, por ejemplo 5 o 2,50.';
  return null;
}

/** Monto USDC como texto editable para inputs (coma decimal, sin ceros de más ni sufijo). */
export function usdcATexto(monto: bigint): string {
  const entero = (monto / UNIDAD_USDC).toString();
  const decimales = (monto % UNIDAD_USDC).toString().padStart(DECIMALES_USDC, '0').replace(/0+$/, '');
  return decimales ? `${entero},${decimales}` : entero;
}


export function formatearUsdc(monto: bigint): string {
  if (monto > 0n && monto < 100_000n) {
    // Menos de un centavo: mostrar decimales significativos en vez de "0,00".
    const fino = (Number(monto) / Number(UNIDAD_USDC)).toFixed(DECIMALES_USDC).replace(/0+$/, '').replace(/\.$/, '');
    return `${fino.replace('.', ',')} USDC`;
  }
  const centavos = (monto + 50_000n) / 100_000n; // redondeo a centavos, no truncado
  const entero = centavos / 100n;
  const decimales = (centavos % 100n).toString().padStart(2, '0');
  return `${entero.toLocaleString('es-AR')},${decimales} USDC`;
}
