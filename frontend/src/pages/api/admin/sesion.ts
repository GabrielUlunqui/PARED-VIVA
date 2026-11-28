import type { APIRoute } from 'astro';
import { ADMIN_CLAVE } from 'astro:env/server';
import { adminHabilitado, json, noExiste } from '../../../lib/admin/guard';
import { claveCorrecta, cerrarSesion, cookieDeCierre, cookieDeSesion, crearSesion, loginLimitado, tokenDePeticion } from '../../../lib/admin/sesion';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!adminHabilitado()) return noExiste();
  if (loginLimitado(clientAddress)) {
    return json({ error: 'Demasiados intentos. Probá de nuevo en una hora.' }, 429);
  }
  const cuerpo = (await request.json().catch(() => ({}))) as { clave?: unknown };
  if (typeof cuerpo.clave !== 'string' || !ADMIN_CLAVE || !claveCorrecta(cuerpo.clave, ADMIN_CLAVE)) {
    return json({ error: 'La clave no es correcta.' }, 401);
  }
  const token = crearSesion();
  return json({ ok: true }, 200, { 'Set-Cookie': cookieDeSesion(token) });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const token = tokenDePeticion(request);
  if (token) cerrarSesion(token);
  return json({ ok: true }, 200, { 'Set-Cookie': cookieDeCierre() });
};
