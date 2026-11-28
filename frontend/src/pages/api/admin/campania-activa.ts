import type { APIRoute } from 'astro';
import { StrKey } from '@stellar/stellar-sdk';
import { adminHabilitado, json, noExiste, rechazoSiNoAdmin } from '../../../lib/admin/guard';
import { establecerActiva } from '../../../lib/admin/registro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  const cuerpo = (await request.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof cuerpo.id === 'string' ? cuerpo.id.trim() : '';
  if (!StrKey.isValidContract(id)) return json({ error: 'Esa no es una dirección de contrato válida.' }, 400);
  if (!establecerActiva(id)) return json({ error: 'Esa campaña no está en el registro.' }, 404);
  return json({ id });
};
