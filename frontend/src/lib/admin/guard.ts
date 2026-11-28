/**
 * Guard compartido de los endpoints /api/admin/*: sin ADMIN_WEB activo todo es 404;
 * con él activo, todo exige sesión salvo el login.
 */
import { ADMIN_WEB } from 'astro:env/server';
import { sesionValida } from './sesion';

export function adminHabilitado(): boolean {
  return !!ADMIN_WEB;
}

export function json(cuerpo: Record<string, unknown>, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export const noExiste = () => json({ error: 'No encontrado.' }, 404);

/** null si puede continuar; Response de rechazo si no. */
export function rechazoSiNoAdmin(request: Request): Response | null {
  if (!adminHabilitado()) return noExiste();
  if (!sesionValida(request)) return json({ error: 'Tenés que iniciar sesión en el panel de administración.' }, 401);
  return null;
}
