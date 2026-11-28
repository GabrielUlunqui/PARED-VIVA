import type { APIRoute } from 'astro';
import { ADMIN_SECRETO } from 'astro:env/server';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { adminHabilitado, noExiste, rechazoSiNoAdmin, json } from '../../../lib/admin/guard';
import { hashWasmParcheado, restauradorDeOficial, wasmInstaladoEnRed } from '../../../lib/admin/despliegue';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  let admin = '';
  if (ADMIN_SECRETO && StrKey.isValidEd25519SecretSeed(ADMIN_SECRETO)) {
    admin = Keypair.fromSecret(ADMIN_SECRETO).publicKey();
  }
  let wasmHash = '';
  let wasmInstalado = false;
  let avisoWasm: string | null = null;
  try {
    wasmHash = hashWasmParcheado();
    wasmInstalado = await wasmInstaladoEnRed(wasmHash);
  } catch (err) {
    avisoWasm = err instanceof Error ? err.message : 'No se pudo leer el wasm del contrato.';
  }
  const restaurador = (await restauradorDeOficial()) ?? process.env.RESTAURADOR_DIRECCION ?? '';
  return json({ activo: true, admin, wasmHash, wasmInstalado, avisoWasm, restaurador });
};
