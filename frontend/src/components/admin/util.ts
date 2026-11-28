// Utilidades del panel de administración: conversiones, validaciones y fetch JSON.
// Montos: el contrato usa unidades de 7 decimales; acá se convierte desde texto en USDC.

export const explorador = 'https://stellar.expert/explorer/testnet';

export function urlTx(hash: string): string {
  return `${explorador}/tx/${hash}`;
}

export function esDireccionValida(valor: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(valor.trim());
}

/** Convierte "123.45" USDC a unidades de 7 decimales (bigint). null si no es un número válido. */
export function aUnidades(usdc: string): bigint | null {
  const limpio = usdc.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,7})?$/.test(limpio)) return null;
  const [entero, decimales = ''] = limpio.split('.');
  return BigInt(entero) * 10_000_000n + BigInt(decimales.padEnd(7, '0') || '0');
}

/** De unidades de 7 decimales a texto USDC sin ceros de más. */
export function aUsdcTexto(unidades: bigint): string {
  const entero = unidades / 10_000_000n;
  const resto = unidades % 10_000_000n;
  if (resto === 0n) return entero.toString();
  const dec = resto.toString().padStart(7, '0').replace(/0+$/, '');
  return `${entero}.${dec}`;
}

export function toast(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info'): void {
  window.dispatchEvent(new CustomEvent('pv:toast', { detail: { mensaje, tipo } }));
}

async function pedir<T>(url: string, opciones?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    ...opciones,
  });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(datos.error ?? `Error ${res.status}: no se pudo completar.`);
  return datos;
}

export function getJSON<T>(url: string): Promise<T> {
  return pedir<T>(url);
}

export function postJSON<T>(url: string, cuerpo?: unknown, metodo = 'POST'): Promise<T> {
  return pedir<T>(url, { method: metodo, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
}

export function abreviar(direccion: string): string {
  return direccion.length > 12 ? `${direccion.slice(0, 6)}…${direccion.slice(-4)}` : direccion;
}
