import type { APIRoute } from 'astro';
import { PINATA_JWT } from 'astro:env/server';
import { MAX_ALIAS, validarRecuerdo } from '../../lib/ipfs';
import type { Recuerdo } from '../../lib/tipos';

export const prerender = false;

const PINATA = 'https://api.pinata.cloud/pinning';
const MAX_BODY_BYTES = 2.5 * 1024 * 1024;
const VENTANA_MS = 10 * 60 * 1000;
const MAX_SUBIDAS = 10;

const subidas = new Map<string, number[]>();

function limiteSuperado(ip: string): boolean {
  const ahora = Date.now();
  const lista = (subidas.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (lista.length >= MAX_SUBIDAS) {
    subidas.set(ip, lista);
    return true;
  }
  lista.push(ahora);
  subidas.set(ip, lista);
  if (subidas.size > 1000) {
    for (const [clave, ts] of subidas) if (!ts.some((t) => ahora - t < VENTANA_MS)) subidas.delete(clave);
  }
  return false;
}

async function esImagenReal(archivo: File): Promise<boolean> {
  const bytes = new Uint8Array(await archivo.slice(0, 12).arrayBuffer());
  if (bytes.length < 4) return false;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const webp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  return jpg || png || webp;
}

function responder(cuerpo: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
}

async function pinear(ruta: string, cuerpo: BodyInit, jwt: string, json = false): Promise<string> {
  const res = await fetch(`${PINATA}/${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Pinata respondió ${res.status}`);
  const { IpfsHash } = (await res.json()) as { IpfsHash?: string };
  if (!IpfsHash) throw new Error('Pinata no devolvió un CID');
  return IpfsHash;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (limiteSuperado(clientAddress)) {
    return responder({ error: 'Demasiadas subidas en poco tiempo. Esperá unos minutos y probá de nuevo.' }, 429);
  }
  const largo = Number(request.headers.get('content-length') ?? 0);
  if (largo > MAX_BODY_BYTES) {
    return responder({ error: 'El envío es demasiado grande. La imagen puede pesar hasta 2 MB.' }, 413);
  }

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
  if (imagen && !(await esImagenReal(imagen))) {
    return responder({ error: 'El archivo no es una imagen JPG, PNG o WEBP válida.' }, 400);
  }
  if (!PINATA_JWT) return responder({ error: 'La subida a IPFS no está configurada en el servidor (falta PINATA_JWT).' }, 503);

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
