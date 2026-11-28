import { Keypair, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';
import { RED } from '../../contracts/config';
import { enviarOperacion, USDC } from './clasicas';
import { ErrorNegocio, ErrorWallet, traducirError } from './errores';
import { fondearConFriendbot, leerSaldos } from './saldos';

const CLAVE_SECRETO_VIEJA = 'pv:wallet-prueba';
const CLAVE_BILLETERAS = 'pv:billeteras';
const CLAVE_ACTIVA = 'pv:billetera-activa';

export type EtapaPrueba = 'fondeando' | 'trustline' | 'usdc';
export type OrigenBilletera = 'creada' | 'importada';

export interface BilleteraGuardada {
  direccion: string;
  alias: string;
  origen: OrigenBilletera;
}

interface EntradaBilletera {
  secreto: string;
  alias: string;
  origen: OrigenBilletera;
}

function leerEntradas(): EntradaBilletera[] {
  try {
    const crudo = localStorage.getItem(CLAVE_BILLETERAS);
    if (crudo) {
      const lista = JSON.parse(crudo) as EntradaBilletera[];
      if (Array.isArray(lista)) return lista.filter((e) => e && typeof e.secreto === 'string');
    }
  } catch {
    // si el json está roto, se ignora y se migra de cero
  }
  // Migración: la billetera única anterior pasa a la lista sin perderse.
  const viejo = localStorage.getItem(CLAVE_SECRETO_VIEJA);
  if (viejo && StrKey.isValidEd25519SecretSeed(viejo)) {
    const entrada: EntradaBilletera = { secreto: viejo, alias: 'Billetera de prueba', origen: 'creada' };
    guardarEntradas([entrada]);
    localStorage.setItem(CLAVE_ACTIVA, Keypair.fromSecret(viejo).publicKey());
    localStorage.removeItem(CLAVE_SECRETO_VIEJA);
    return [entrada];
  }
  return [];
}

function guardarEntradas(lista: EntradaBilletera[]): void {
  localStorage.setItem(CLAVE_BILLETERAS, JSON.stringify(lista));
}

function entradaActiva(): EntradaBilletera | null {
  const lista = leerEntradas();
  if (!lista.length) return null;
  const activa = localStorage.getItem(CLAVE_ACTIVA);
  return lista.find((e) => Keypair.fromSecret(e.secreto).publicKey() === activa) ?? lista[0];
}

/** Lista de billeteras guardadas para mostrar (nunca incluye las claves). */
export function billeterasGuardadas(): BilleteraGuardada[] {
  return leerEntradas().map((e) => ({
    direccion: Keypair.fromSecret(e.secreto).publicKey(),
    alias: e.alias,
    origen: e.origen,
  }));
}

export function direccionBilleteraActiva(): string | null {
  const entrada = entradaActiva();
  return entrada ? Keypair.fromSecret(entrada.secreto).publicKey() : null;
}

/** Cambia la billetera activa a una guardada. Devuelve false si no existe. */
export function alternarBilletera(direccion: string): boolean {
  const existe = leerEntradas().some((e) => Keypair.fromSecret(e.secreto).publicKey() === direccion);
  if (!existe) return false;
  localStorage.setItem(CLAVE_ACTIVA, direccion);
  return true;
}

function guardarNueva(par: Keypair, alias: string, origen: OrigenBilletera): void {
  const lista = leerEntradas();
  const direccion = par.publicKey();
  const existente = lista.findIndex((e) => Keypair.fromSecret(e.secreto).publicKey() === direccion);
  const entrada: EntradaBilletera = { secreto: par.secret(), alias, origen };
  if (existente >= 0) lista[existente] = entrada;
  else lista.push(entrada);
  guardarEntradas(lista);
  localStorage.setItem(CLAVE_ACTIVA, direccion);
}

/**
 * Importa una clave secreta S... como billetera del navegador y la deja activa.
 * La clave solo se guarda en este navegador; nunca se envía a ningún servidor.
 */
export function importarClave(secreto: string, alias?: string): string {
  const limpio = secreto.trim();
  if (!StrKey.isValidEd25519SecretSeed(limpio)) {
    throw new ErrorNegocio('Esa clave no tiene formato válido: las claves de Stellar empiezan con S y tienen 56 caracteres.');
  }
  const par = Keypair.fromSecret(limpio);
  const direccion = par.publicKey();
  const anterior = billeterasGuardadas().find((b) => b.direccion === direccion);
  const nombre = alias?.trim() || anterior?.alias || 'Billetera importada';
  guardarNueva(par, nombre, 'importada');
  return direccion;
}

export function walletPrueba(): Keypair | null {
  const entrada = entradaActiva();
  if (!entrada) return null;
  try {
    return Keypair.fromSecret(entrada.secreto);
  } catch {
    return null;
  }
}

export async function pedirUsdcPrueba(direccion: string): Promise<void> {
  const respuesta = await fetch('/api/grifo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direccion }),
  });
  if (respuesta.ok) return;
  const { error } = (await respuesta.json().catch(() => ({}))) as { error?: string };
  throw new ErrorNegocio(error || 'No se pudo pedir USDC de prueba.');
}

export async function prepararWalletPrueba(
  alProgreso: (etapa: EtapaPrueba) => void,
): Promise<{ direccion: string; avisoUsdc: string | null }> {
  let par = walletPrueba();
  const esCreada = entradaActiva()?.origen === 'creada';
  if (!par || !esCreada) {
    // Las claves importadas no pasan por el pipeline de fondeo: se usa una billetera creada.
    par = Keypair.random();
    guardarNueva(par, 'Billetera de prueba', 'creada');
  }
  const direccion = par.publicKey();
  let { xlm, usdc } = await leerSaldos(direccion);
  if (xlm === null) {
    alProgreso('fondeando');
    await fondearConFriendbot(direccion);
  }
  if (usdc === null) {
    alProgreso('trustline');
    await enviarOperacion(par, Operation.changeTrust({ asset: USDC }));
    usdc = 0n;
  }
  let avisoUsdc: string | null = null;
  if (usdc === 0n) {
    alProgreso('usdc');
    await pedirUsdcPrueba(direccion).catch((e) => (avisoUsdc = traducirError(e)));
  }
  return { direccion, avisoUsdc };
}

export function firmarConPrueba(xdrTx: string): string {
  const par = walletPrueba();
  if (!par) throw new ErrorWallet('sin-conexion');
  const tx = TransactionBuilder.fromXdr(xdrTx, RED.passphrase);
  tx.sign(par);
  return tx.toXdr();
}
