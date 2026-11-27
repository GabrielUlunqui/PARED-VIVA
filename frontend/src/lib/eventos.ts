import type { Ladrillo } from './tipos';

export interface EventosPv {
  'pv:ladrillo-seleccionado': { id: number };
  'pv:donacion-confirmada': { ladrillo: Ladrillo; txHash: string };
  'pv:wallet-cambiada': { direccion: string | null };
}

export type NombreEvento = keyof EventosPv;

export function emitir<N extends NombreEvento>(nombre: N, detail: EventosPv[N]): void {
  window.dispatchEvent(new CustomEvent(nombre, { detail }));
}

export function escuchar<N extends NombreEvento>(
  nombre: N,
  cb: (detail: EventosPv[N]) => void,
): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<EventosPv[N]>).detail);
  window.addEventListener(nombre, handler);
  return () => window.removeEventListener(nombre, handler);
}
