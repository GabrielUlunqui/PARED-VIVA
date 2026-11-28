import type { APIRoute } from 'astro';
import { ADMIN_CLAVE } from 'astro:env/server';
import { createHash } from 'node:crypto';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { adminHabilitado, json, noExiste } from '../../../lib/admin/guard';
import { claveCorrecta, cerrarSesion, consumirDesafio, cookieDeCierre, cookieDeSesion, crearSesion, desafiosActivos, loginLimitado, tokenDePeticion } from '../../../lib/admin/sesion';
import { direccionesAdmin } from './desafio';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!adminHabilitado()) return noExiste();
  if (loginLimitado(clientAddress)) {
    return json({ error: 'Demasiados intentos. Probá de nuevo en una hora.' }, 429);
  }
  const cuerpo = (await request.json().catch(() => ({}))) as { clave?: unknown; direccion?: unknown; firma?: unknown };

  // Entrada con clave (respaldo, si está configurada).
  if (typeof cuerpo.clave === 'string') {
    if (!ADMIN_CLAVE || !claveCorrecta(cuerpo.clave, ADMIN_CLAVE)) {
      return json({ error: 'La clave no es correcta.' }, 401);
    }
    const token = crearSesion();
    return json({ ok: true }, 200, { 'Set-Cookie': cookieDeSesion(token) });
  }

  // Entrada con billetera: firma del desafío de un solo uso. El cliente manda solo
  // { direccion, firma }: el servidor prueba la firma contra los desafíos activos.
  if (typeof cuerpo.direccion === 'string' && typeof cuerpo.firma === 'string') {
    if (!StrKey.isValidEd25519PublicKey(cuerpo.direccion)) {
      return json({ error: 'La dirección no es válida.' }, 400);
    }
    if (!direccionesAdmin().includes(cuerpo.direccion)) {
      return json({ error: 'Esta billetera no tiene acceso al panel.' }, 403);
    }
    const desafioFirmado = desafiosActivos().find((texto) => firmaValida(cuerpo.direccion as string, texto, cuerpo.firma as string));
    if (!desafioFirmado) {
      return json({ error: 'La firma no es válida o el desafío venció. Volvé a intentarlo.' }, 401);
    }
    consumirDesafio(desafioFirmado);
    const token = crearSesion();
    return json({ ok: true }, 200, { 'Set-Cookie': cookieDeSesion(token) });
  }

  return json({ error: 'Faltan datos para entrar.' }, 400);
};

/**
 * Verifica la firma en las dos formas que producen las billeteras soportadas:
 * (a) billetera del navegador: firma directa del texto del desafío;
 * (b) Freighter (SEP-53): firma del sha256 de "Stellar Signed Message:
" + texto.
 */
function firmaValida(direccion: string, desafio: string, firmaBase64: string): boolean {
  let firma: Buffer;
  try {
    firma = Buffer.from(firmaBase64, 'base64');
  } catch {
    return false;
  }
  if (firma.length !== 64) return false;
  const par = Keypair.fromPublicKey(direccion);
  try {
    if (par.verify(Buffer.from(desafio, 'utf8'), firma)) return true;
    const digest = createHash('sha256').update(`Stellar Signed Message:
${desafio}`, 'utf8').digest();
    return par.verify(digest, firma);
  } catch {
    return false;
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const token = tokenDePeticion(request);
  if (token) cerrarSesion(token);
  return json({ ok: true }, 200, { 'Set-Cookie': cookieDeCierre() });
};
