import type { APIRoute } from 'astro';
import { FIRMA_DEMO, FIRMANTE1_SECRETO, FIRMANTE2_SECRETO, FIRMANTE3_SECRETO } from 'astro:env/server';
import { Keypair, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';
import { Client } from '../../contracts/pared-viva/src/index';
import { RED } from '../../contracts/config';
import { campaniaActivaServidor, claveDeFirmante } from '../../lib/admin/registro';
import { traducirError } from '../../lib/stellar/errores';

export const prerender = false;

const SECRETOS_ENV = [FIRMANTE1_SECRETO, FIRMANTE2_SECRETO, FIRMANTE3_SECRETO];
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

/**
 * Clave disponible para el firmante que ocupa la posición N (1..3) en el contrato:
 * primero las variables FIRMANTE{N}_SECRETO si apuntan a esa dirección, después el registro.
 */
function secretoPara(direccion: string, numero: number): string | null {
  const deEnv = SECRETOS_ENV[numero - 1];
  if (deEnv && StrKey.isValidEd25519SecretSeed(deEnv) && Keypair.fromSecret(deEnv).publicKey() === direccion) {
    return deEnv;
  }
  // Cualquier variable de entorno que apunte a esa dirección también sirve.
  for (const secreto of SECRETOS_ENV) {
    if (secreto && StrKey.isValidEd25519SecretSeed(secreto) && Keypair.fromSecret(secreto).publicKey() === direccion) {
      return secreto;
    }
  }
  return claveDeFirmante(direccion);
}

async function firmantesDelContrato(): Promise<string[]> {
  const contrato = await campaniaActivaServidor();
  const cliente = new Client({ contractId: contrato, rpcUrl: RED.rpcUrl, networkPassphrase: RED.passphrase });
  const { result } = await cliente.firmantes();
  return result as string[];
}

/** Firmantes del contrato activo cuya clave tiene el servidor, numerados por posición. */
async function firmantesConClave(): Promise<{ numero: number; direccion: string; secreto: string }[]> {
  const firmantes = await firmantesDelContrato().catch(() => [] as string[]);
  return firmantes.slice(0, 3).flatMap((direccion, i) => {
    const secreto = secretoPara(direccion, i + 1);
    return secreto ? [{ numero: i + 1, direccion, secreto }] : [];
  });
}

export const GET: APIRoute = async () => {
  if (!FIRMA_DEMO) return responder({ activo: false });
  const disponibles = await firmantesConClave();
  if (!disponibles.length) return responder({ activo: false });
  return responder({ activo: true, firmantes: disponibles.map(({ numero, direccion }) => ({ numero, direccion })) });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!FIRMA_DEMO) {
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
  if (limiteSuperado(clientAddress)) {
    return responder({ error: 'Se aprobaron demasiadas veces desde esta conexión. Probá de nuevo en una hora.' }, 429);
  }

  try {
    const contrato = await campaniaActivaServidor();
    const cliente = new Client({ contractId: contrato, rpcUrl: RED.rpcUrl, networkPassphrase: RED.passphrase });
    const [{ result: firmantes }, { result: resumen }] = await Promise.all([cliente.firmantes(), cliente.estado()]);
    const direccion = firmantes[numero - 1] as string | undefined;
    if (!direccion) {
      return responder({ error: `La campaña no tiene un firmante en la posición ${numero}.` }, 409);
    }
    const secreto = secretoPara(direccion, numero);
    if (!secreto) {
      return responder({ error: `El servidor no tiene la clave del firmante ${numero}.` }, 503);
    }
    if (resumen.estado.tag !== 'Financiada') {
      return responder({ error: 'Los hitos se pueden aprobar solo cuando la campaña alcanzó la meta.' }, 409);
    }
    if (hito !== resumen.hito_actual) {
      return responder({ error: `Ahora toca aprobar el hito ${resumen.hito_actual + 1}, no el ${hito + 1}.` }, 409);
    }

    const par = Keypair.fromSecret(secreto);
    const envio = cola.then(async () => {
      const clienteFirma = new Client({
        contractId: contrato,
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
