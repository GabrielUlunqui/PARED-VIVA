import type { Campania, Hito } from '../tipos';

export function construirHitos(campania: Campania, aprobaciones: string[][]): Hito[] {
  return campania.hitos.map((monto, indice) => {
    const aprobadoPor = aprobaciones[indice] ?? [];
    const estado = indice < campania.hitoActual ? 'Pagado' : aprobadoPor.length > 0 ? 'EnAprobacion' : 'Pendiente';
    return { indice, monto, aprobadoPor, estado };
  });
}
