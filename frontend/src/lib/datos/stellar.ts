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
  async obtenerHitos() {
    throw new Error('TODO [B3] obtenerHitos: estado() + aprobaciones(hito) → construirHitos');
  },
  async obtenerFirmantes() {
    throw new Error('TODO [B3] obtenerFirmantes: firmantes()');
  },
  async obtenerAporte() {
    throw new Error('TODO [B3] obtenerAporte: aporte(d) + es_guardian(d) + ladrillos() filtrados');
  },
};
