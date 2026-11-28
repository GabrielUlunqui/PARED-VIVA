import type { APIRoute } from 'astro';
import { ADMIN_DIRECCIONES } from 'astro:env/server';
import { StrKey } from '@stellar/stellar-sdk';
import { adminHabilitado, json, noExiste } from '../../../lib/admin/guard';
import { crearDesafio } from '../../../lib/admin/sesion';

export const prerender = false;

/** Direcciones G... con acceso al panel, separadas por coma. */
export function direccionesAdmin(): string[] {
  return (ADMIN_DIRECCIONES ?? '')
    .split(',')
    .map((d) => d.trim())
    .filter((d) => StrKey.isValidEd25519PublicKey(d));
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!adminHabilitado()) return noExiste();
  const direccion = url.searchParams.get('direccion') ?? '';
  if (!StrKey.isValidEd25519PublicKey(direccion)) {
    return json({ error: 'La dirección no es válida.' }, 400);
  }
  if (!direccionesAdmin().includes(direccion)) {
    return json({ error: 'Esta billetera no tiene acceso al panel.' }, 403);
  }
  const host = request.headers.get('host') ?? url.host;
  return json({ desafio: crearDesafio(host) });
};
