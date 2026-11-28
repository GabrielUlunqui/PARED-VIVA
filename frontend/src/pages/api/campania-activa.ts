import type { APIRoute } from 'astro';
import { json } from '../../lib/admin/guard';
import { campaniaActivaServidor } from '../../lib/admin/registro';

export const prerender = false;

// Pública: el frontend la usa para saber qué contrato leer. No expone nada sensible.
export const GET: APIRoute = async () => {
  return json({ id: campaniaActivaServidor() });
};
