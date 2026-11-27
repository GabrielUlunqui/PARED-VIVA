import type { Campania, Ladrillo } from '../tipos';

export interface FuenteDatos {
  obtenerCampania(): Promise<Campania>;
  obtenerLadrillos(): Promise<Ladrillo[]>;
  obtenerLadrillo(id: number): Promise<Ladrillo | null>;
  suscribirDonaciones(cb: (l: Ladrillo) => void): () => void;
}
