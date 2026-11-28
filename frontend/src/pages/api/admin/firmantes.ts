import type { APIRoute } from 'astro';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { adminHabilitado, json, noExiste, rechazoSiNoAdmin } from '../../../lib/admin/guard';
import { agregarFirmante, listaFirmantes } from '../../../lib/admin/registro';
import { fondearConFriendbot, leerSaldos } from '../../../lib/stellar/saldos';
import { traducirError } from '../../../lib/stellar/errores';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  const firmantes = await Promise.all(
    listaFirmantes().map(async (f) => {
      let saldoXlm: string | null = null;
      try {
        const { xlm } = await leerSaldos(f.direccion);
        saldoXlm = xlm === null ? null : (Number(xlm) / 10_000_000).toFixed(2);
      } catch {
        saldoXlm = null;
      }
      return { direccion: f.direccion, nombre: f.nombre, tieneClave: f.tieneClave, saldoXlm };
    }),
  );
  return json({ firmantes });
};

export const POST: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  const cuerpo = (await request.json().catch(() => ({}))) as { nombre?: unknown; direccion?: unknown };
  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : '';
  if (!nombre) return json({ error: 'El firmante necesita un nombre.' }, 400);
  try {
    if (typeof cuerpo.direccion === 'string' && cuerpo.direccion.trim()) {
      const direccion = cuerpo.direccion.trim();
      if (!StrKey.isValidEd25519PublicKey(direccion)) return json({ error: 'Esa dirección no es válida.' }, 400);
      const registrado = agregarFirmante(direccion, nombre);
      return json({ ...registrado });
    }
    // Sin dirección: genera una cuenta nueva, la fondea y guarda la clave en el servidor.
    const par = Keypair.random();
    await fondearConFriendbot(par.publicKey());
    const registrado = agregarFirmante(par.publicKey(), nombre, par.secret());
    return json({ ...registrado });
  } catch (e) {
    console.error('[admin/firmantes]', e instanceof Error ? e.message : 'error');
    return json({ error: traducirError(e) }, 502);
  }
};
