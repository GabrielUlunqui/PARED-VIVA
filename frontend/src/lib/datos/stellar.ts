import type { FuenteDatos } from './tipos';

// TODO [B3] [B4]: implementar con el cliente de src/lib/stellar/cliente.ts
export const fuenteStellar: FuenteDatos = {
  async obtenerCampania() {
    throw new Error('TODO [B3] obtenerCampania');
  },
  async obtenerLadrillos() {
    throw new Error('TODO [B3] obtenerLadrillos');
  },
  async obtenerLadrillo() {
    throw new Error('TODO [B3] obtenerLadrillo');
  },
  suscribirDonaciones() {
    throw new Error('TODO [B4] suscribirDonaciones');
  },
};
