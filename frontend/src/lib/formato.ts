/** Helpers de formato compartidos. MuralGrid/Progreso (de otro Devin) pueden migrar a estos. */

export function formatearFecha(segundos: number, estilo: 'corta' | 'larga' = 'larga'): string {
  return new Date(segundos * 1000).toLocaleDateString(
    'es-AR',
    estilo === 'larga' ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' },
  );
}

export function porcentajeCampania(recaudado: bigint, meta: bigint): number {
  return meta > 0n ? Math.min(100, Number((recaudado * 100n) / meta)) : 0;
}

/** "GDJK…XYZ1" — versión corta de una dirección Stellar para mostrar. */
export function acortarDireccion(direccion: string): string {
  return direccion.length > 12 ? `${direccion.slice(0, 4)}…${direccion.slice(-4)}` : direccion;
}
