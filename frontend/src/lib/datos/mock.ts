import type { Campania, EstadoCampania, Ladrillo, MiAporte } from '../tipos';
import { APROBACIONES_NECESARIAS, UNIDAD_USDC } from '../tipos';
import { construirHitos } from './hitos';
import type { FuenteDatos } from './tipos';

const FILAS = 20;
const COLUMNAS = 30;
const MINIMO = 1n * UNIDAD_USDC;
const META = 1000n * UNIDAD_USDC;
const HITOS = [400n * UNIDAD_USDC, 300n * UNIDAD_USDC, 300n * UNIDAD_USDC];
const MONTOS_EJEMPLO = [1n, 2n, 5n, 5n, 10n, 25n].map((m) => m * UNIDAD_USDC);
const OCUPADOS_INICIALES = 120;

export type EscenarioMock = 'activa' | 'financiada' | 'fallida';
const CLAVE_ESCENARIO = 'pv:mock-escenario';

export function escenarioMock(): EscenarioMock {
  const valor = typeof localStorage === 'undefined' ? null : localStorage.getItem(CLAVE_ESCENARIO);
  return valor === 'financiada' || valor === 'fallida' ? valor : 'activa';
}

export function fijarEscenarioMock(escenario: EscenarioMock): void {
  localStorage.setItem(CLAVE_ESCENARIO, escenario);
}

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

const firmantes = [direccionFalsa(9001), direccionFalsa(9002), direccionFalsa(9003)];
const aprobaciones: string[][] = HITOS.map(() => []);
const reembolsados = new Set<string>();
let hitoActual = 0;
if (escenarioMock() === 'financiada') aprobaciones[0].push(firmantes[0]);

function campania(): Campania {
  const escenario = escenarioMock();
  const sumado = [...ladrillos.values()].reduce((total, l) => total + l.monto, 0n);
  const ahora = Math.floor(Date.now() / 1000);
  let estado: EstadoCampania = 'Activa';
  if (escenario === 'financiada') estado = hitoActual >= HITOS.length ? 'Completada' : 'Financiada';
  if (escenario === 'fallida') estado = 'Fallida';
  return {
    estado,
    meta: META,
    recaudado: escenario === 'financiada' && sumado < META ? META : sumado,
    fechaLimite: escenario === 'fallida' ? ahora - 24 * 3600 : ahora + 14 * 24 * 3600,
    hitoActual,
    hitos: HITOS,
    filas: FILAS,
    columnas: COLUMNAS,
    aporteMinimo: MINIMO,
  };
}

// Modo prueba: la wallet conectada pasa a ser el firmante 3 y la dueña de 3 ladrillos, para poder probar B6 y B7.
export function usarDireccionDePrueba(direccion: string): void {
  firmantes[2] = direccion;
  if ([...ladrillos.values()].some((l) => l.donante === direccion)) return;
  [...ladrillos.keys()]
    .sort((a, b) => a - b)
    .slice(0, 3)
    .forEach((id) => (ladrillos.get(id)!.donante = direccion));
}

export function registrarDonacionMock(id: number, donante: string, recuerdoCid: string, monto: bigint): Ladrillo {
  if (campania().estado !== 'Activa') throw new Error('Error(Contract, #1)');
  if (ladrillos.has(id)) throw new Error('Error(Contract, #2)');
  if (id < 0 || id >= FILAS * COLUMNAS) throw new Error('Error(Contract, #3)');
  if (monto < MINIMO) throw new Error('Error(Contract, #20)');
  const nuevo: Ladrillo = { id, donante, monto, recuerdoCid, fecha: Math.floor(Date.now() / 1000) };
  ladrillos.set(id, nuevo);
  return nuevo;
}

export function aprobarHitoMock(firmante: string, hito: number): void {
  if (campania().estado !== 'Financiada') throw new Error('Error(Contract, #7)');
  if (!firmantes.includes(firmante)) throw new Error('Error(Contract, #4)');
  if (hito !== hitoActual) throw new Error('Error(Contract, #6)');
  if (aprobaciones[hito].includes(firmante)) throw new Error('Error(Contract, #5)');
  aprobaciones[hito].push(firmante);
  if (aprobaciones[hito].length >= APROBACIONES_NECESARIAS) hitoActual++;
}

export function reembolsarMock(donante: string): bigint {
  if (campania().estado !== 'Fallida') throw new Error('Error(Contract, #8)');
  const total = aporteDe(donante).total;
  if (total <= 0n) throw new Error('Error(Contract, #9)');
  reembolsados.add(donante);
  return total;
}

function aporteDe(direccion: string): MiAporte {
  const propios = [...ladrillos.values()].filter((l) => l.donante === direccion).sort((a, b) => b.fecha - a.fecha);
  const total = reembolsados.has(direccion) ? 0n : propios.reduce((suma, l) => suma + l.monto, 0n);
  return { total, ladrillos: propios, guardian: propios.length > 0 };
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
      if (campania().estado !== 'Activa') return;
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
  async obtenerHitos() {
    return construirHitos(campania(), aprobaciones);
  },
  async obtenerFirmantes() {
    return [...firmantes];
  },
  async obtenerAporte(direccion) {
    return aporteDe(direccion);
  },
};
