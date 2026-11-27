import type { APIRoute } from 'astro';
import { PINATA_JWT } from 'astro:env/server';
import { MAX_ALIAS, validarRecuerdo } from '../../lib/ipfs';
import type { Recuerdo } from '../../lib/tipos';

export const prerender = false;

const PINATA = 'https://api.pinata.cloud/pinning';

function responder(cuerpo: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}

async function pinear(ruta: string, cuerpo: BodyInit, jwt: string, json = false): Promise<string> {
  const res = await fetch(`${PINATA}/${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo,
  });
  if (!res.ok) throw new Error(`Pinata respondió ${res.status}`);
  const { IpfsHash } = (await res.json()) as { IpfsHash?: string };
  if (!IpfsHash) throw new Error('Pinata no devolvió un CID');
  return IpfsHash;
}

export const POST: APIRoute = async ({ request }) => {
  if (!PINATA_JWT) return responder({ error: 'La subida a IPFS no está configurada en el servidor (falta PINATA_JWT).' }, 503);

  let formulario: FormData;
  try {
    formulario = await request.formData();
  } catch {
    return responder({ error: 'Formulario inválido.' }, 400);
  }

  const texto = String(formulario.get('texto') ?? '').trim();
  const alias = String(formulario.get('alias') ?? '').trim().slice(0, MAX_ALIAS);
  const archivo = formulario.get('imagen');
  const imagen = archivo instanceof File && archivo.size > 0 ? archivo : null;
  const error = validarRecuerdo(texto, imagen, alias);
  if (error) return responder({ error }, 400);

  try {
    let imagenCid: string | undefined;
    if (imagen) {
      const datosImagen = new FormData();
      datosImagen.set('file', imagen, imagen.name || 'recuerdo');
      datosImagen.set('pinataMetadata', JSON.stringify({ name: `pared-viva-imagen-${Date.now()}` }));
      imagenCid = await pinear('pinFileToIPFS', datosImagen, PINATA_JWT);
    }
    const recuerdo: Recuerdo = {
      version: 1,
      texto,
      ...(imagenCid ? { imagenCid } : {}),
      ...(alias ? { alias } : {}),
      creado: new Date().toISOString(),
    };
    const cid = await pinear(
      'pinJSONToIPFS',
      JSON.stringify({ pinataContent: recuerdo, pinataMetadata: { name: `pared-viva-recuerdo-${Date.now()}` } }),
      PINATA_JWT,
      true,
    );
    return responder({ cid });
  } catch {
    return responder({ error: 'No se pudo guardar el recuerdo en IPFS. Probá de nuevo en un rato.' }, 502);
  }
};
