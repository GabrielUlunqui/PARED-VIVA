import { clienteParedViva } from '../stellar/cliente';
import { escucharDonacionesRed } from '../stellar/eventos-red';
import type { Campania, EstadoCampania, Ladrillo } from '../tipos';
import { construirHitos } from './hitos';
import type { FuenteDatos } from './tipos';

type LadrilloRed = {
  id: number;
  donante: string;
  monto: bigint;
  recuerdo: string;
  fecha: bigint;
};

function convertirLadrillo(l: LadrilloRed): Ladrillo {
  return { id: l.id, donante: l.donante, monto: l.monto, recuerdoCid: l.recuerdo, fecha: Number(l.fecha) };
}

async function campaniaRed(): Promise<Campania> {
  const cliente = await clienteParedViva();
  const { result: r } = await cliente.estado();
  return {
    estado: r.estado.tag as EstadoCampania,
    meta: r.meta,
    recaudado: r.recaudado,
    fechaLimite: Number(r.fecha_limite),
    hitoActual: r.hito_actual,
    hitos: r.hitos,
    filas: r.filas,
    columnas: r.columnas,
    aporteMinimo: r.aporte_minimo,
  };
}

async function ladrillosRed(): Promise<Ladrillo[]> {
  const cliente = await clienteParedViva();
  const { result } = await cliente.ladrillos();
  return result.map(convertirLadrillo).sort((a, b) => a.id - b.id);
}

export const fuenteStellar: FuenteDatos = {
  obtenerCampania: campaniaRed,
  obtenerLadrillos: ladrillosRed,
  async obtenerLadrillo(id) {
    const cliente = await clienteParedViva();
    const { result } = await cliente.ladrillo({ id });
    return result ? convertirLadrillo(result) : null;
  },
  suscribirDonaciones(cb) {
    return escucharDonacionesRed(cb);
  },
  async obtenerHitos() {
    const cliente = await clienteParedViva();
    const campania = await campaniaRed();
    const aprobaciones = await Promise.all(
      campania.hitos.map(async (_, hito) => (await cliente.aprobaciones({ hito })).result),
    );
    return construirHitos(campania, aprobaciones);
  },
  async obtenerFirmantes() {
    const cliente = await clienteParedViva();
    return (await cliente.firmantes()).result;
  },
  async obtenerAporte(direccion) {
    const cliente = await clienteParedViva();
    const [aporte, guardian, ladrillos] = await Promise.all([
      cliente.aporte({ donante: direccion }),
      cliente.es_guardian({ direccion }),
      ladrillosRed(),
    ]);
    return {
      total: aporte.result,
      guardian: guardian.result,
      ladrillos: ladrillos.filter((l) => l.donante === direccion).sort((a, b) => b.fecha - a.fecha),
    };
  },
};
