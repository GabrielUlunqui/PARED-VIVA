import { rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { CONTRATOS, RED } from '../../contracts/config';
import type { Ladrillo } from '../tipos';

export const INTERVALO_POLLING_MS = 4000;

const servidor = new rpc.Server(RED.rpcUrl);
const TOPIC_DONACION = xdr.ScVal.scvSymbol('donacion').toXDR('base64');

function convertirEvento(ev: rpc.Api.EventResponse): Ladrillo | null {
  const topic = ev.topic.map((t) => scValToNative(t));
  if (topic[0] !== 'donacion') return null;
  const datos = scValToNative(ev.value) as [string, bigint, string];
  if (!Array.isArray(datos) || datos.length < 3) return null;
  return {
    id: Number(topic[1]),
    donante: String(datos[0]),
    monto: BigInt(datos[1]),
    recuerdoCid: String(datos[2]),
    fecha: Math.floor(new Date(ev.ledgerClosedAt).getTime() / 1000),
  };
}

// Poller compartido: un solo getEvents cada INTERVALO_POLLING_MS por página,
// sin importar cuántos componentes se suscriban.
const suscriptores = new Set<(l: Ladrillo) => void>();
const vistos = new Set<string>();
let cursor: string | undefined;
let ledgerInicial: number | undefined;
let temporizador: ReturnType<typeof setTimeout> | undefined;
let sondeando = false;

function procesar(eventos: rpc.Api.EventResponse[]): void {
  for (const ev of eventos) {
    if (vistos.has(ev.id)) continue;
    vistos.add(ev.id);
    const ladrillo = convertirEvento(ev);
    if (ladrillo) for (const cb of suscriptores) cb(ladrillo);
  }
}

async function sondear(): Promise<void> {
  if (suscriptores.size === 0 || sondeando) return;
  sondeando = true;
  try {
    const filtros = [{ type: 'contract' as const, contractIds: [CONTRATOS.paredViva], topics: [[TOPIC_DONACION, '*']] }];
    if (cursor === undefined) {
      if (ledgerInicial === undefined) ledgerInicial = (await servidor.getLatestLedger()).sequence;
      const respuesta = await servidor.getEvents({ startLedger: ledgerInicial, filters: filtros, limit: 100 });
      cursor = respuesta.cursor;
      procesar(respuesta.events);
    } else {
      const respuesta = await servidor.getEvents({ cursor, filters: filtros, limit: 100 });
      if (respuesta.cursor) cursor = respuesta.cursor;
      procesar(respuesta.events);
    }
  } catch (e) {
    console.warn('No se pudieron leer eventos del contrato; se reintenta', e);
  } finally {
    sondeando = false;
  }
  programar();
}

function programar(): void {
  if (suscriptores.size > 0 && temporizador === undefined) {
    temporizador = setTimeout(() => {
      temporizador = undefined;
      void sondear();
    }, INTERVALO_POLLING_MS);
  }
}

export function escucharDonacionesRed(cb: (l: Ladrillo) => void): () => void {
  const primero = suscriptores.size === 0;
  suscriptores.add(cb);
  if (primero) void sondear();
  return () => {
    suscriptores.delete(cb);
    if (suscriptores.size === 0 && temporizador !== undefined) {
      clearTimeout(temporizador);
      temporizador = undefined;
    }
  };
}
