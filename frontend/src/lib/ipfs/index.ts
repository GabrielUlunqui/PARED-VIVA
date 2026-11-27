import type { Recuerdo } from '../tipos';

export const MAX_IMAGEN_BYTES = 2 * 1024 * 1024;
export const MAX_TEXTO = 280;
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// TODO [C4]: enviar a /api/subir. Mientras tanto devuelve un CID falso para que B pueda probar el flujo.
export async function subirRecuerdo(texto: string, imagen?: File, alias?: string): Promise<string> {
  void imagen;
  void alias;
  return `mock-${Date.now()}-${texto.length}`;
}

// TODO [C4]: leer el JSON desde el gateway. Los CIDs "mock-*" devuelven un recuerdo de ejemplo.
export async function leerRecuerdo(cid: string): Promise<Recuerdo> {
  if (cid.startsWith('mock-')) {
    return {
      version: 1,
      texto: 'Acá jugábamos a la pelota todas las tardes, con el mural de fondo.',
      alias: 'Vecina del barrio',
      creado: new Date().toISOString(),
    };
  }
  const res = await fetch(urlGateway(cid));
  if (!res.ok) throw new Error(`No se pudo leer el recuerdo ${cid}`);
  return res.json();
}

export function urlGateway(cid: string): string {
  return `${GATEWAY}${cid}`;
}
