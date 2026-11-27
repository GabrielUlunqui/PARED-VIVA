import type { Campania, Ladrillo } from '../tipos';
import { UNIDAD_USDC } from '../tipos';
import type { FuenteDatos } from './tipos';

const FILAS = 20;
const COLUMNAS = 30;
const MINIMO = 1n * UNIDAD_USDC;
const MONTOS_EJEMPLO = [1n, 2n, 5n, 5n, 10n, 25n].map((m) => m * UNIDAD_USDC);
const OCUPADOS_INICIALES = 120;

function aleatorio(semilla: number): () => number {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function direccionFalsa(n: number): string {
  return `G${n.toString(36).toUpperCase().padStart(55, 'A')}`;
}

function crearLadrillo(id: number, n: number, monto: bigint): Ladrillo {
  return {
    id,
    donante: direccionFalsa(n),
    monto,
    recuerdoCid: `mock-${id}`,
    fecha: Math.floor(Date.now() / 1000) - (OCUPADOS_INICIALES - n) * 3600,
  };
}

const ladrillos = new Map<number, Ladrillo>();
const rnd = aleatorio(42);
while (ladrillos.size < OCUPADOS_INICIALES) {
  const id = Math.floor(rnd() * FILAS * COLUMNAS);
  const monto = MONTOS_EJEMPLO[Math.floor(rnd() * MONTOS_EJEMPLO.length)];
  if (!ladrillos.has(id)) ladrillos.set(id, crearLadrillo(id, ladrillos.size, monto));
}

function campania(): Campania {
  return {
    estado: 'Activa',
    meta: 1000n * UNIDAD_USDC,
    recaudado: [...ladrillos.values()].reduce((total, l) => total + l.monto, 0n),
    fechaLimite: Math.floor(Date.now() / 1000) + 14 * 24 * 3600,
    hitoActual: 0,
    hitos: [400n * UNIDAD_USDC, 300n * UNIDAD_USDC, 300n * UNIDAD_USDC],
    filas: FILAS,
    columnas: COLUMNAS,
    aporteMinimo: MINIMO,
  };
}

export function registrarDonacionMock(id: number, donante: string, recuerdoCid: string, monto: bigint): Ladrillo {
  if (ladrillos.has(id)) throw new Error('Error(Contract, #2)');
  if (id < 0 || id >= FILAS * COLUMNAS) throw new Error('Error(Contract, #3)');
  if (monto < MINIMO) throw new Error('Error(Contract, #20)');
  const nuevo: Ladrillo = { id, donante, monto, recuerdoCid, fecha: Math.floor(Date.now() / 1000) };
  ladrillos.set(id, nuevo);
  return nuevo;
}

export const fuenteMock: FuenteDatos = {
  async obtenerCampania() {
    return campania();
  },
  async obtenerLadrillos() {
    return [...ladrillos.values()];
  },
  async obtenerLadrillo(id) {
    return ladrillos.get(id) ?? null;
  },
  suscribirDonaciones(cb) {
    const intervalo = setInterval(() => {
      const libres = Array.from({ length: FILAS * COLUMNAS }, (_, i) => i).filter((i) => !ladrillos.has(i));
      if (libres.length === 0) return;
      const id = libres[Math.floor(Math.random() * libres.length)];
      const monto = MONTOS_EJEMPLO[Math.floor(Math.random() * MONTOS_EJEMPLO.length)];
      const nuevo = crearLadrillo(id, ladrillos.size, monto);
      nuevo.fecha = Math.floor(Date.now() / 1000);
      ladrillos.set(id, nuevo);
      cb(nuevo);
    }, 5000);
    return () => clearInterval(intervalo);
  },
};
