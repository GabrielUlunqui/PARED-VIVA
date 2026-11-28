import type { APIRoute } from 'astro';
import { Address, BASE_FEE, Keypair, Operation, rpc, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';
import { Client } from '../../../contracts/pared-viva/src/index';
import { RED } from '../../../contracts/config';
import { adminHabilitado, json, noExiste, rechazoSiNoAdmin } from '../../../lib/admin/guard';
import { claveDeFirmante } from '../../../lib/admin/registro';
import { hashWasmParcheado, wasmHashDeInstancia } from '../../../lib/admin/despliegue';
import { traducirError } from '../../../lib/stellar/errores';

export const prerender = false;

const servidor = new rpc.Server(RED.rpcUrl);
let cola: Promise<unknown> = Promise.resolve();

const SIN_ROTACION = 'Esta campaña usa una versión anterior del contrato y no permite cambiar firmantes. Las campañas nuevas creadas desde el panel sí.';

export const POST: APIRoute = async ({ request }) => {
  if (!adminHabilitado()) return noExiste();
  const rechazo = rechazoSiNoAdmin(request);
  if (rechazo) return rechazo;
  const cuerpo = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const campania = String(cuerpo.campania ?? '').trim();
  const saliente = String(cuerpo.saliente ?? '').trim();
  const nuevo = String(cuerpo.nuevo ?? '').trim();
  const aprobador1 = String(cuerpo.aprobador1 ?? '').trim();
  const aprobador2 = String(cuerpo.aprobador2 ?? '').trim();

  if (!StrKey.isValidContract(campania)) return json({ error: 'La campaña no es una dirección de contrato válida.' }, 400);
  for (const [etiqueta, direccion] of [
    ['saliente', saliente],
    ['nuevo', nuevo],
    ['aprobador 1', aprobador1],
    ['aprobador 2', aprobador2],
  ] as const) {
    if (!StrKey.isValidEd25519PublicKey(direccion)) return json({ error: `La dirección del ${etiqueta} no es válida.` }, 400);
  }
  if (aprobador1 === aprobador2) return json({ error: 'Los dos aprobadores tienen que ser distintos.' }, 400);
  if (aprobador1 === saliente || aprobador2 === saliente) {
    return json({ error: 'El firmante saliente no puede aprobar su propio reemplazo.' }, 400);
  }
  if (nuevo === saliente) return json({ error: 'El firmante nuevo es el mismo que el saliente.' }, 400);

  const secreto1 = claveDeFirmante(aprobador1);
  const secreto2 = claveDeFirmante(aprobador2);
  if (!secreto1 || !secreto2) {
    return json({ error: 'El servidor no tiene la clave de los dos aprobadores: solo se puede rotar con aprobadores cuya clave esté registrada.' }, 409);
  }

  try {
    // Validaciones contra el estado real del contrato, antes de enviar nada.
    const lectura = new Client({ contractId: campania, rpcUrl: RED.rpcUrl, networkPassphrase: RED.passphrase });
    const { result: firmantesActuales } = await lectura.firmantes();
    if (!firmantesActuales.includes(saliente)) return json({ error: 'El firmante saliente no es firmante de esa campaña.' }, 409);
    if (!firmantesActuales.includes(aprobador1) || !firmantesActuales.includes(aprobador2)) {
      return json({ error: 'Los aprobadores tienen que ser firmantes actuales de esa campaña.' }, 409);
    }
    if (firmantesActuales.includes(nuevo)) return json({ error: 'Esa dirección ya es firmante de la campaña.' }, 409);

    // Las campañas viejas (pre-parche) no tienen rotar_firmante: se detecta por el wasm.
    let hashParcheado = '';
    try {
      hashParcheado = hashWasmParcheado();
    } catch {
      hashParcheado = '';
    }
    const hashInstancia = await wasmHashDeInstancia(campania);
    if (!hashParcheado || hashInstancia !== hashParcheado) {
      return json({ error: SIN_ROTACION }, 409);
    }

    const par1 = Keypair.fromSecret(secreto1);
    const par2 = Keypair.fromSecret(secreto2);
    const envio = cola.then(async () => {
      // Sin bindings (el contrato parcheado no está en los bindings generados):
      // invocación manual, simulación y firma del sobre por AMBOS aprobadores.
      const operacion = Operation.invokeContractFunction({
        contract: campania,
        function: 'rotar_firmante',
        args: [aprobador1, aprobador2, saliente, nuevo].map((d) => new Address(d).toScVal()),
      } as Parameters<typeof Operation.invokeContractFunction>[0]);
      const cuenta = await servidor.getAccount(aprobador1);
      const cruda = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
        .addOperation(operacion)
        .setTimeout(60)
        .build();
      const simulacion = await servidor.simulateTransaction(cruda);
      if (rpc.Api.isSimulationError(simulacion)) {
        throw new Error(`La red rechazaría esta rotación: ${simulacion.error}`);
      }
      const armada = rpc.assembleTransaction(cruda, simulacion).build();
      armada.sign(par1);
      armada.sign(par2);
      const enviada = await servidor.sendTransaction(armada);
      if (enviada.status !== 'PENDING') {
        throw new Error(`La red no aceptó la transacción (${enviada.status}).`);
      }
      const confirmacion = await servidor.pollTransaction(enviada.hash, { attempts: 30 });
      if (confirmacion.status !== 'SUCCESS') {
        throw new Error(`La transacción se incluyó en la red pero falló (${confirmacion.status}).`);
      }
      return enviada.hash;
    });
    cola = envio.catch(() => undefined);
    return json({ hash: await envio });
  } catch (e) {
    console.error('[admin/rotar-firmante]', e instanceof Error ? e.message : 'error');
    return json({ error: traducirError(e) }, 502);
  }
};
