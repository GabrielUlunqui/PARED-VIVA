import type { APIRoute } from 'astro';
import { GRIFO_SECRETO } from 'astro:env/server';
import { Keypair, Operation, StrKey } from '@stellar/stellar-sdk';
import { enviarOperacion, MONTO_GRIFO_USDC, USDC } from '../../lib/stellar/clasicas';
import { leerSaldos } from '../../lib/stellar/saldos';
import { UNIDAD_USDC } from '../../lib/tipos';

export const prerender = false;

const SALDO_MAXIMO = 10n * UNIDAD_USDC;
const VENTANA_MS = 60 * 60 * 1000;
const MAX_POR_IP = 3;

const pedidos = new Map<string, number[]>();
let cola: Promise<unknown> = Promise.resolve();

function limiteSuperado(ip: string): boolean {
  const ahora = Date.now();
  const lista = (pedidos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  const superado = lista.length >= MAX_POR_IP;
  if (!superado) lista.push(ahora);
  pedidos.set(ip, lista);
  if (pedidos.size > 1000) {
    for (const [clave, ts] of pedidos) if (!ts.some((t) => ahora - t < VENTANA_MS)) pedidos.delete(clave);
  }
  return superado;
}

function responder(cuerpo: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const secreto = GRIFO_SECRETO;
  if (!secreto) return responder({ error: 'El grifo de USDC no está configurado en el servidor (falta GRIFO_SECRETO).' }, 503);
  const { direccion } = (await request.json().catch(() => ({}))) as { direccion?: unknown };
  if (typeof direccion !== 'string' || !StrKey.isValidEd25519PublicKey(direccion)) {
    return responder({ error: 'La dirección no es una cuenta Stellar válida.' }, 400);
  }

  const { xlm, usdc } = await leerSaldos(direccion);
  if (xlm === null) return responder({ error: 'La cuenta todavía no existe en testnet. Fondeala primero con Friendbot.' }, 400);
  if (usdc === null) return responder({ error: 'La wallet todavía no acepta USDC: falta agregar la trustline.' }, 400);
  if (usdc >= SALDO_MAXIMO) return responder({ error: 'Esta wallet ya tiene USDC de prueba suficiente.' }, 409);
  if (limiteSuperado(clientAddress)) {
    return responder({ error: 'Pediste USDC demasiadas veces. Probá de nuevo en una hora.' }, 429);
  }

  const envio = cola.then(() =>
    enviarOperacion(
      Keypair.fromSecret(secreto),
      Operation.payment({ destination: direccion, asset: USDC, amount: String(MONTO_GRIFO_USDC) }),
    ),
  );
  cola = envio.catch(() => undefined);
  try {
    return responder({ hash: await envio });
  } catch (e) {
    console.error('[grifo]', e);
    return responder({ error: 'No se pudo enviar el USDC de prueba. Probá de nuevo en un rato.' }, 502);
  }
};
