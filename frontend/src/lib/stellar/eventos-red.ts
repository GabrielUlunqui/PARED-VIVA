import type { Ladrillo } from '../tipos';

export const INTERVALO_POLLING_MS = 4000;

// TODO [B4]: polling a rpc.getEvents filtrando el contrato pared-viva y el topic "donacion".
export function escucharDonacionesRed(cb: (l: Ladrillo) => void): () => void {
  void cb;
  throw new Error('TODO [B4] escucharDonacionesRed');
}
