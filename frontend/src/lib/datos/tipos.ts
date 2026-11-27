import type { Campania, Hito, Ladrillo, MiAporte } from '../tipos';

export interface FuenteDatos {
  obtenerCampania(): Promise<Campania>;
  obtenerLadrillos(): Promise<Ladrillo[]>;
  obtenerLadrillo(id: number): Promise<Ladrillo | null>;
  suscribirDonaciones(cb: (l: Ladrillo) => void): () => void;
  obtenerHitos(): Promise<Hito[]>;
  obtenerFirmantes(): Promise<string[]>;
  obtenerAporte(direccion: string): Promise<MiAporte>;
}
