import type { Recuerdo } from '../tipos';
import { ErrorNegocio } from '../stellar/errores';

export const MAX_IMAGEN_BYTES = 2 * 1024 * 1024;
export const MAX_TEXTO = 280;
export const MAX_ALIAS = 40;
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const USAR_MOCK = import.meta.env.PUBLIC_USAR_MOCK !== 'false';

const RECUERDOS_EJEMPLO: Pick<Recuerdo, 'texto' | 'alias'>[] = [
  { texto: 'Acá jugábamos a la pelota todas las tardes, con el mural de fondo.', alias: 'Vecina del barrio' },
  { texto: 'Acá aprendí a andar en bici, con el mural de fondo.', alias: 'Marta' },
  { texto: 'Mi abuelo ayudó a pintarlo en 1988. Todavía se ve su firma en la esquina.', alias: 'Lucas' },
  { texto: 'Las murgas de carnaval siempre arrancaban acá.' },
  { texto: 'Nos dimos el primer beso debajo del sol amarillo.', alias: 'Caro y Nico' },
  { texto: 'Cada mañana lo miro cuando espero el colectivo. Me pone de buen humor.', alias: 'Don Héctor' },
  { texto: 'Para que mis hijos lo conozcan como lo conocí yo.', alias: 'Ana' },
  { texto: 'El club de barrio hacía las fotos de fin de año frente a esta pared.', alias: 'Club Unión' },
  { texto: 'Un ladrillo por cada año que viví en esta cuadra.', alias: 'Rubén' },
  { texto: 'Lo pintaron los pibes del taller de arte de la escuela.', alias: 'Profe Silvia' },
];

export function validarRecuerdo(texto: string, imagen?: File | null, alias?: string): string | null {
  const limpio = texto.trim();
  if (!limpio) return 'Escribí un recuerdo para tu ladrillo.';
  if (limpio.length > MAX_TEXTO) return `El recuerdo puede tener hasta ${MAX_TEXTO} caracteres.`;
  if (alias && alias.trim().length > MAX_ALIAS) return `El nombre puede tener hasta ${MAX_ALIAS} caracteres.`;
  if (imagen && imagen.size > 0) {
    if (!TIPOS_IMAGEN.includes(imagen.type)) return 'La imagen tiene que ser JPG, PNG o WEBP.';
    if (imagen.size > MAX_IMAGEN_BYTES) return 'La imagen puede pesar hasta 2 MB.';
  }
  return null;
}

export async function subirRecuerdo(texto: string, imagen?: File, alias?: string): Promise<string> {
  const error = validarRecuerdo(texto, imagen, alias);
  if (error) throw new ErrorNegocio(error);
  const formulario = new FormData();
  formulario.set('texto', texto.trim());
  if (alias?.trim()) formulario.set('alias', alias.trim());
  if (imagen && imagen.size > 0) formulario.set('imagen', imagen);

  let res: Response;
  try {
    res = await fetch('/api/subir', { method: 'POST', body: formulario });
  } catch {
    throw new ErrorNegocio('No hay conexión para guardar el recuerdo. Probá de nuevo.');
  }
  if (res.status === 503 && USAR_MOCK) return `mock-${Date.now()}-${texto.length}`;
  const cuerpo = (await res.json().catch(() => ({}))) as { cid?: string; error?: string };
  if (!res.ok || !cuerpo.cid) throw new ErrorNegocio(cuerpo.error ?? 'No se pudo guardar el recuerdo en IPFS.');
  return cuerpo.cid;
}

function recuerdoEjemplo(cid: string): Recuerdo {
  const numero = [...cid].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const ejemplo = RECUERDOS_EJEMPLO[numero % RECUERDOS_EJEMPLO.length];
  return { version: 1, ...ejemplo, creado: new Date().toISOString() };
}

const MAX_RECUERDO_BYTES = 64 * 1024;
const FORMATO_CID = /^[a-zA-Z0-9]{20,120}$/;

async function textoLimitado(res: Response, max: number): Promise<string> {
  const declarado = Number(res.headers.get('content-length') ?? 0);
  if (declarado > max) throw new Error('El recuerdo es demasiado grande');
  if (!res.body) return res.text();
  const lector = res.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await lector.cancel();
      throw new Error('El recuerdo es demasiado grande');
    }
    partes.push(value);
  }
  const bytes = new Uint8Array(total);
  let pos = 0;
  for (const parte of partes) {
    bytes.set(parte, pos);
    pos += parte.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function sanearRecuerdo(crudo: unknown, cid: string): Recuerdo {
  const r = crudo as Recuerdo;
  if (typeof r?.texto !== 'string' || !r.texto.trim()) throw new Error(`El recuerdo ${cid} no tiene un formato válido`);
  return {
    version: 1,
    texto: r.texto.slice(0, MAX_TEXTO),
    ...(typeof r.alias === 'string' && r.alias.trim() ? { alias: r.alias.slice(0, MAX_ALIAS) } : {}),
    ...(typeof r.imagenCid === 'string' && FORMATO_CID.test(r.imagenCid) ? { imagenCid: r.imagenCid } : {}),
    creado: typeof r.creado === 'string' ? r.creado : new Date().toISOString(),
  };
}

export async function leerRecuerdo(cid: string): Promise<Recuerdo> {
  if (cid.startsWith('mock-')) return recuerdoEjemplo(cid);
  const res = await fetch(urlGateway(cid), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`No se pudo leer el recuerdo ${cid}`);
  const recuerdo = JSON.parse(await textoLimitado(res, MAX_RECUERDO_BYTES)) as unknown;
  return sanearRecuerdo(recuerdo, cid);
}

export function urlGateway(cid: string): string {
  return `${GATEWAY}${cid}`;
}
