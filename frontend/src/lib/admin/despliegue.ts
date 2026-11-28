/**
 * Despliegue de nuevas instancias de pared-viva con el WASM PARCHEADO compilado en
 * soroban/target (los contratos viejos en testnet son pre-parche y no sirven de molde).
 * Si el wasm todavía no está instalado en testnet, lo sube una sola vez con la clave
 * admin y cachea el hash en el registro. Solo servidor.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { BASE_FEE, Keypair, nativeToScVal, Operation, rpc, scValToNative, StrKey, TransactionBuilder, xdr, Address } from '@stellar/stellar-sdk';
import { CONTRATOS, RED } from '../../contracts/config';
import { leerRegistro, guardarRegistro } from './registro';

const servidor = new rpc.Server(RED.rpcUrl);

function rutaWasm(): string {
  const configurada = process.env.PARED_VIVA_WASM;
  if (configurada) return isAbsolute(configurada) ? configurada : join(process.cwd(), configurada);
  return join(process.cwd(), '..', 'soroban', 'target', 'wasm32v1-none', 'release', 'pared_viva.wasm');
}

const ERROR_COMPILAR = 'Falta compilar el contrato: corré stellar contract build en soroban/';

/** wasm del contrato parcheado leído del archivo; error claro si no está compilado. */
export function leerWasm(): Buffer {
  const ruta = rutaWasm();
  if (!existsSync(ruta)) throw new Error(ERROR_COMPILAR);
  return readFileSync(ruta);
}

let hashCache: string | null = null;

/** sha256 (hex) del wasm parcheado local. */
export function hashWasmParcheado(): string {
  if (!hashCache) hashCache = createHash('sha256').update(leerWasm()).digest('hex');
  return hashCache;
}

/** ¿Ese wasm ya está instalado en testnet? (consulta contractCode en el ledger) */
export async function wasmInstaladoEnRed(hashHex: string): Promise<boolean> {
  const clave = xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: Buffer.from(hashHex, 'hex') }));
  try {
    const respuesta = await servidor.getLedgerEntries(clave);
    return (respuesta.entries?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Envía una operación soroban (upload/createCustomContract): necesita simulación y
 * ensamblado del footprint, a diferencia de las operaciones clásicas. Devuelve el hash.
 */
async function enviarInvocacion(firmante: Keypair, operacion: xdr.Operation): Promise<string> {
  const cuenta = await servidor.getAccount(firmante.publicKey());
  const cruda = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(operacion)
    .setTimeout(60)
    .build();
  const simulacion = await servidor.simulateTransaction(cruda);
  if (rpc.Api.isSimulationError(simulacion)) {
    throw new Error(`La red rechazaría esta operación: ${simulacion.error}`);
  }
  const armada = rpc.assembleTransaction(cruda, simulacion).build();
  armada.sign(firmante);
  const enviada = await servidor.sendTransaction(armada);
  if (enviada.status !== 'PENDING') {
    throw new Error(`La red no aceptó la transacción (${enviada.status}).`);
  }
  const confirmacion = await servidor.pollTransaction(enviada.hash, { attempts: 30 });
  if (confirmacion.status !== 'SUCCESS') {
    throw new Error(`La transacción se incluyó en la red pero falló (${confirmacion.status}).`);
  }
  return enviada.hash;
}

/**
 * Garantiza que el wasm parcheado esté instalado en testnet: lo sube una sola vez
 * firmado por el admin y cachea el resultado en el registro. Devuelve el hash hex.
 */
export async function asegurarWasmInstalado(secretoAdmin: string): Promise<string> {
  const hash = hashWasmParcheado();
  const registro = leerRegistro();
  if (registro.wasmInstalado === hash) return hash;
  if (await wasmInstaladoEnRed(hash)) {
    registro.wasmInstalado = hash;
    guardarRegistro(registro);
    return hash;
  }
  const admin = Keypair.fromSecret(secretoAdmin);
  await enviarInvocacion(admin, Operation.uploadContractWasm({ wasm: leerWasm() }));
  registro.wasmInstalado = hash;
  guardarRegistro(registro);
  return hash;
}

/** wasmHash (hex) de la instancia de un contrato desplegado, para detectar su versión. */
export async function wasmHashDeInstancia(contractId: string): Promise<string | null> {
  try {
    const instancia = await servidor.getContractInstance(contractId);
    // El SDK devuelve la instancia ya convertida: executable es { wasm: "<hex>" }.
    const ejecutable = instancia.executable as unknown as { wasm?: string };
    return typeof ejecutable?.wasm === 'string' ? ejecutable.wasm : null;
  } catch {
    return null;
  }
}

export interface ParametrosCampania {
  nombre: string;
  metaUsdc: string;
  hitosUsdc: string[];
  filas: number;
  columnas: number;
  aporteMinimoUsdc: string;
  dias: number;
  restaurador: string;
  firmantes: [string, string, string];
}

const UNIDAD = 10_000_000n;

function aUnidades(texto: string): bigint | null {
  const limpio = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,7})?$/.test(limpio)) return null;
  const [entera, decimales = ''] = limpio.split('.');
  return BigInt(entera) * UNIDAD + BigInt((decimales + '0000000').slice(0, 7));
}

/** Valida como el constructor del contrato. Devuelve mensaje llano o null si está todo bien. */
export function validarParametros(p: ParametrosCampania): string | null {
  if (!p.nombre?.trim()) return 'La campaña necesita un nombre.';
  const meta = aUnidades(p.metaUsdc ?? '');
  if (meta === null || meta <= 0n) return 'La meta tiene que ser un monto mayor que cero.';
  if (!Array.isArray(p.hitosUsdc) || p.hitosUsdc.length === 0) return 'Tiene que haber al menos un hito.';
  let suma = 0n;
  for (const h of p.hitosUsdc) {
    const monto = aUnidades(h ?? '');
    if (monto === null || monto <= 0n) return 'Cada hito tiene que ser un monto mayor que cero.';
    suma += monto;
  }
  if (suma !== meta) return 'La suma de los hitos tiene que ser igual a la meta.';
  const aporte = aUnidades(p.aporteMinimoUsdc ?? '');
  if (aporte === null || aporte <= 0n) return 'El aporte mínimo tiene que ser un monto mayor que cero.';
  if (!Number.isInteger(p.filas) || p.filas <= 0) return 'Las filas tienen que ser un número entero mayor que cero.';
  if (!Number.isInteger(p.columnas) || p.columnas <= 0) return 'Las columnas tienen que ser un número entero mayor que cero.';
  if (aporte * BigInt(p.filas) * BigInt(p.columnas) < meta) {
    return 'Con ese aporte mínimo y esa grilla no se puede alcanzar la meta: subí el aporte mínimo o agrandá la grilla.';
  }
  if (!Number.isInteger(p.dias) || p.dias <= 0 || p.dias > 3650) return 'Los días de campaña tienen que ser un número entero entre 1 y 3650.';
  if (!StrKey.isValidEd25519PublicKey(p.restaurador)) return 'La dirección del restaurador no es válida.';
  if (!Array.isArray(p.firmantes) || p.firmantes.length !== 3) return 'Se necesitan exactamente 3 firmantes.';
  if (new Set(p.firmantes).size !== 3) return 'Los 3 firmantes tienen que ser distintos.';
  for (const f of p.firmantes) {
    if (!StrKey.isValidEd25519PublicKey(f)) return 'Una de las direcciones de firmante no es válida.';
  }
  return null;
}

function direccionScVal(direccion: string): xdr.ScVal {
  return new Address(direccion).toScVal();
}

/** Arma el ScVal del struct Config del constructor, con los nombres de campo exactos. */
export function configScVal(p: ParametrosCampania, admin: string): xdr.ScVal {
  const meta = aUnidades(p.metaUsdc)!;
  const hitos = p.hitosUsdc.map((h) => aUnidades(h)!);
  const ahora = Math.floor(Date.now() / 1000);
  const entrada = (clave: string, val: xdr.ScVal) => new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol(clave), val });
  return xdr.ScVal.scvMap([
    entrada('admin', direccionScVal(admin)),
    entrada('token', direccionScVal(CONTRATOS.usdc)),
    entrada('restaurador', direccionScVal(p.restaurador)),
    entrada('fondo', direccionScVal(CONTRATOS.fondoBarrio)),
    entrada('firmantes', xdr.ScVal.scvVec(p.firmantes.map(direccionScVal))),
    entrada('meta', nativeToScVal(meta, { type: 'i128' })),
    entrada('fecha_limite', nativeToScVal(ahora + p.dias * 24 * 60 * 60, { type: 'u64' })),
    entrada('hitos', xdr.ScVal.scvVec(hitos.map((m) => nativeToScVal(m, { type: 'i128' })))),
    entrada('filas', nativeToScVal(p.filas, { type: 'u32' })),
    entrada('columnas', nativeToScVal(p.columnas, { type: 'u32' })),
    entrada('aporte_minimo', nativeToScVal(aUnidades(p.aporteMinimoUsdc)!, { type: 'i128' })),
  ]);
}

/**
 * Despliega una nueva instancia con el wasm parcheado (lo instala antes si hace falta).
 * Devuelve el id del contrato nuevo y el hash de la transacción de despliegue.
 */
export async function desplegarCampania(p: ParametrosCampania, secretoAdmin: string): Promise<{ id: string; hash: string }> {
  const admin = Keypair.fromSecret(secretoAdmin);
  const wasmHash = await asegurarWasmInstalado(secretoAdmin);
  const operacion = Operation.createCustomContract({
    address: new Address(admin.publicKey()),
    wasmHash: Buffer.from(wasmHash, 'hex'),
    constructorArgs: [configScVal(p, admin.publicKey())],
  });
  const hash = await enviarInvocacion(admin, operacion);

  // El id del contrato nuevo es el valor de retorno de la invocación de creación.
  const respuesta = await servidor.getTransaction(hash);
  if (!('returnValue' in respuesta) || !respuesta.returnValue) {
    throw new Error('No se pudo leer la confirmación del despliegue.');
  }
  const id = scValToNative(respuesta.returnValue) as string;
  if (!StrKey.isValidContract(id)) throw new Error('La dirección devuelta por el despliegue no es un contrato válido.');
  return { id, hash };
}

/** Restaurador configurado en la campaña oficial (para prefill del formulario). */
export async function restauradorDeOficial(): Promise<string | null> {
  try {
    const instancia = await servidor.getContractInstance(CONTRATOS.paredViva);
    const entrada = (instancia.storage ?? []).find((e) => {
      try {
        const clave = scValToNative(e.key);
        return Array.isArray(clave) && clave[0] === 'Config';
      } catch {
        return false;
      }
    });
    if (!entrada) return null;
    const config = scValToNative(entrada.val) as { restaurador?: unknown };
    return config?.restaurador ? String(config.restaurador) : null;
  } catch {
    return null;
  }
}
