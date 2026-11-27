import type { Campania, Ladrillo } from '../tipos';
import { UNIDAD_USDC } from '../tipos';
import type { FuenteDatos } from './tipos';

const FILAS = 20;
const COLUMNAS = 30;
const PRECIO = 5n * UNIDAD_USDC;
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

function crearLadrillo(id: number, n: number): Ladrillo {
  return {
    id,
    donante: direccionFalsa(n),
    monto: PRECIO,
    recuerdoCid: `mock-${id}`,
    fecha: Math.floor(Date.now() / 1000) - (OCUPADOS_INICIALES - n) * 3600,
  };
}

const ladrillos = new Map<number, Ladrillo>();
const rnd = aleatorio(42);
while (ladrillos.size < OCUPADOS_INICIALES) {
  const id = Math.floor(rnd() * FILAS * COLUMNAS);
  if (!ladrillos.has(id)) ladrillos.set(id, crearLadrillo(id, ladrillos.size));
}

function campania(): Campania {
  return {
    estado: 'Activa',
    meta: 1000n * UNIDAD_USDC,
    recaudado: BigInt(ladrillos.size) * PRECIO,
    fechaLimite: Math.floor(Date.now() / 1000) + 14 * 24 * 3600,
    hitoActual: 0,
    hitos: [400n * UNIDAD_USDC, 300n * UNIDAD_USDC, 300n * UNIDAD_USDC],
    filas: FILAS,
    columnas: COLUMNAS,
    precioLadrillo: PRECIO,
  };
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
      const nuevo = crearLadrillo(id, ladrillos.size);
      nuevo.fecha = Math.floor(Date.now() / 1000);
      ladrillos.set(id, nuevo);
      cb(nuevo);
    }, 5000);
    return () => clearInterval(intervalo);
  },
};
