import type { APIRoute } from 'astro';

export const prerender = false;

// TODO [C4]: validar imagen/texto, subir imagen + JSON Recuerdo a Pinata con import.meta.env.PINATA_JWT y devolver { cid }.
export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'TODO [C4] subida a IPFS no implementada' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
};
