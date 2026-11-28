import type { APIRoute } from 'astro';
import { FIRMA_DEMO, FIRMANTE1_SECRETO, FIRMANTE2_SECRETO, FIRMANTE3_SECRETO } from 'astro:env/server';
import { Keypair, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';
import { Client } from '../../contracts/pared-viva/src/index';
import { CONTRATOS, RED } from '../../contracts/config';
import { clienteParedViva } from '../../lib/stellar/cliente';
import { traducirError } from '../../lib/stellar/errores';

export const prerender = false;

const SECRETOS = [FIRMANTE1_SECRETO, FIRMANTE2_SECRETO, FIRMANTE3_SECRETO];
const VENTANA_MS = 60 * 60 * 1000;
const MAX_POR_IP = 20;

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

function responder(cuerpo: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Keypair del firmante N (1..3) si hay clave válida configurada; null si falta o está mal formada. */
function parDe(numero: number): Keypair | null {
  const secreto = SECRETOS[numero - 1];
  if (!secreto || !StrKey.isValidEd25519SecretSeed(secreto)) return null;
  return Keypair.fromSecret(secreto);
}

function demoActiva(): boolean {
  return FIRMA_DEMO && SECRETOS.some((s) => s && StrKey.isValidEd25519SecretSeed(s));
}

export const GET: APIRoute = async () => {
  if (!demoActiva()) return responder({ activo: false });
  const firmantes = SECRETOS.map((_, i) => {
    const par = parDe(i + 1);
    return par ? { numero: i + 1, direccion: par.publicKey() } : null;
  }).filter((f) => f !== null);
  return responder({ activo: true, firmantes });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!demoActiva()) {
    return responder({ error: 'La firma de demo no está activa en este servidor.' }, 503);
  }
  const cuerpo = (await request.json().catch(() => ({}))) as { firmante?: unknown; hito?: unknown };
  const numero = cuerpo.firmante;
  const hito = cuerpo.hito;
  if (typeof numero !== 'number' || ![1, 2, 3].includes(numero)) {
    return responder({ error: 'El firmante tiene que ser 1, 2 o 3.' }, 400);
  }
  if (typeof hito !== 'number' || !Number.isInteger(hito) || hito < 0) {
    return responder({ error: 'El número de hito no es válido.' }, 400);
  }
  if (!SECRETOS[numero - 1]) {
    return responder({ error: `La clave del firmante ${numero} no está configurada en el servidor.` }, 503);
  }
  const par = parDe(numero);
  if (!par) {
    return responder({ error: `La clave del firmante ${numero} configurada en el servidor no es válida.` }, 503);
  }
  if (limiteSuperado(clientAddress)) {
    return responder({ error: 'Se aprobaron demasiadas veces desde esta conexión. Probá de nuevo en una hora.' }, 429);
  }

  try {
    const cliente = await clienteParedViva();
    const [{ result: firmantes }, { result: resumen }] = await Promise.all([cliente.firmantes(), cliente.estado()]);
    const direccion = par.publicKey();
    if (!firmantes.includes(direccion)) {
      return responder({ error: `La cuenta del firmante ${numero} no es firmante de esta campaña.` }, 409);
    }
    if (resumen.estado.tag !== 'Financiada') {
      return responder({ error: 'Los hitos se pueden aprobar solo cuando la campaña alcanzó la meta.' }, 409);
    }
    if (hito !== resumen.hito_actual) {
      return responder({ error: `Ahora toca aprobar el hito ${resumen.hito_actual + 1}, no el ${hito + 1}.` }, 409);
    }

    const envio = cola.then(async () => {
      const clienteFirma = new Client({
        contractId: CONTRATOS.paredViva,
        rpcUrl: RED.rpcUrl,
        networkPassphrase: RED.passphrase,
        publicKey: direccion,
        signTransaction: async (xdrTx: string) => {
          const tx = TransactionBuilder.fromXdr(xdrTx, RED.passphrase);
          tx.sign(par);
          return { signedTxXdr: tx.toXdr(), signerAddress: direccion };
        },
      });
      const tx = await clienteFirma.aprobar_hito({ firmante: direccion, hito });
      await tx.sign();
      const enviada = await tx.send();
      const respuesta = enviada.getTransactionResponse;
      if (respuesta && 'status' in respuesta && respuesta.status !== 'SUCCESS') {
        throw new Error(`La transacción se incluyó en la red pero falló (${respuesta.status}).`);
      }
      return enviada.sendTransactionResponse?.hash ?? '';
    });
    cola = envio.catch(() => undefined);
    return responder({ hash: await envio });
  } catch (e) {
    console.error('[firmar-demo]', e instanceof Error ? e.message : 'error');
    return responder({ error: traducirError(e) }, 502);
  }
};
