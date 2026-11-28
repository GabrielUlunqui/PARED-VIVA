import type { APIRoute } from 'astro';
import { ADMIN_SECRETO } from 'astro:env/server';
import { Client } from '../../../contracts/pared-viva/src/index';
import { CONTRATOS, RED } from '../../../contracts/config';
import { adminHabilitado, json, noExiste, rechazoSiNoAdmin } from '../../../lib/admin/guard';
import { agregarCampania, leerRegistro } from '../../../lib/admin/registro';
import { desplegarCampania, hashWasmParcheado, validarParametros, wasmHashDeInstancia, type ParametrosCampania } from '../../../lib/admin/despliegue';
import { traducirError } from '../../../lib/stellar/errores';

export const prerender = false;

async function leerEstado(id: string) {
  try {
    const cliente = new Client({ contractId: id, rpcUrl: RED.rpcUrl, networkPassphrase: RED.passphrase });
    const [{ result: resumen }, { result: firmantes }] = await Promise.all([cliente.estado(), cliente.firmantes()]);
    return {
      estado: {
        estado: resumen.estado.tag,
        meta: resumen.meta.toString(),
        recaudado: resumen.recaudado.toString(),
        fechaLimite: Number(resumen.fecha_limite),
        hitoActual: resumen.hito_actual,
        hitos: resumen.hitos.map((h) => h.toString()),
      },
      firmantes: firmantes as string[],
    };
  } catch {
    return { estado: null, firmantes: [] as string[] };
  }
}

export const GET: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  const registro = leerRegistro();
  let hashParcheado = '';
  try {
    hashParcheado = hashWasmParcheado();
  } catch {
    hashParcheado = '';
  }
  const campanias = await Promise.all(
    registro.campanias.map(async (c) => {
      const { estado, firmantes } = await leerEstado(c.id);
      const hashInstancia = await wasmHashDeInstancia(c.id);
      return {
        id: c.id,
        nombre: c.nombre,
        creada: c.creada,
        origen: c.origen,
        estado,
        firmantes,
        permiteRotar: !!hashParcheado && hashInstancia === hashParcheado,
      };
    }),
  );
  return json({ activa: registro.activa, campanias });
};

export const POST: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  if (!ADMIN_SECRETO) {
    return json({ error: 'Falta configurar ADMIN_SECRETO en el servidor: es la cuenta que firma los despliegues.' }, 503);
  }
  const cuerpo = (await request.json().catch(() => ({}))) as Partial<ParametrosCampania>;
  const parametros = {
    nombre: String(cuerpo.nombre ?? ''),
    metaUsdc: String(cuerpo.metaUsdc ?? ''),
    hitosUsdc: Array.isArray(cuerpo.hitosUsdc) ? cuerpo.hitosUsdc.map(String) : [],
    filas: Number(cuerpo.filas),
    columnas: Number(cuerpo.columnas),
    aporteMinimoUsdc: String(cuerpo.aporteMinimoUsdc ?? ''),
    dias: Number(cuerpo.dias),
    restaurador: String(cuerpo.restaurador ?? ''),
    firmantes: (Array.isArray(cuerpo.firmantes) ? cuerpo.firmantes.map(String) : []) as [string, string, string],
  };
  const invalido = validarParametros(parametros);
  if (invalido) return json({ error: invalido }, 400);
  try {
    const { id, hash } = await desplegarCampania(parametros, ADMIN_SECRETO);
    agregarCampania({ id, nombre: parametros.nombre.trim(), creada: Math.floor(Date.now() / 1000), origen: 'admin' });
    return json({ id, hash });
  } catch (e) {
    console.error('[admin/campanias]', e instanceof Error ? e.message : 'error');
    return json({ error: traducirError(e) }, 502);
  }
};
