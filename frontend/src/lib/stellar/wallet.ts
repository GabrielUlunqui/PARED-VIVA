import {
  getAddress,
  getNetworkDetails,
  isAllowed,
  isConnected,
  requestAccess,
  signMessage,
  signTransaction,
  WatchWalletChanges,
} from '@stellar/freighter-api';
import { RED } from '../../contracts/config';
import { ErrorWallet } from './errores';
import { firmarConPrueba, prepararWalletPrueba, walletPrueba, type EtapaPrueba } from './wallet-prueba';

const CLAVE_CONECTADA = 'pv:wallet-conectada';
const CODIGO_RECHAZADO = -4;
const CONECTADA_FREIGHTER = '1';
const CONECTADA_PRUEBA = 'prueba';

export type TipoWallet = 'freighter' | 'prueba';

export function tipoConectada(): TipoWallet | null {
  const valor = localStorage.getItem(CLAVE_CONECTADA);
  if (valor === CONECTADA_FREIGHTER) return 'freighter';
  if (valor === CONECTADA_PRUEBA && walletPrueba()) return 'prueba';
  return null;
}

interface ErrorFreighter {
  code: number;
  message: string;
}

function lanzarSiError(error: ErrorFreighter | undefined): void {
  if (!error) return;
  throw new ErrorWallet(error.code === CODIGO_RECHAZADO ? 'rechazado' : 'desconocido', error.message);
}

export async function freighterInstalada(): Promise<boolean> {
  const { isConnected: instalada } = await isConnected();
  return instalada;
}

export async function redCorrecta(): Promise<boolean> {
  if (tipoConectada() === 'prueba') return true;
  const { networkPassphrase, error } = await getNetworkDetails();
  lanzarSiError(error);
  return networkPassphrase === RED.passphrase;
}

export async function conectar(): Promise<string> {
  if (!(await freighterInstalada())) throw new ErrorWallet('sin-freighter');
  const { address, error } = await requestAccess();
  lanzarSiError(error);
  if (!(await redCorrecta())) throw new ErrorWallet('red-equivocada');
  localStorage.setItem(CLAVE_CONECTADA, CONECTADA_FREIGHTER);
  return address;
}

export async function conectarPrueba(
  alProgreso: (etapa: EtapaPrueba) => void,
): Promise<{ direccion: string; avisoUsdc: string | null }> {
  const resultado = await prepararWalletPrueba(alProgreso);
  localStorage.setItem(CLAVE_CONECTADA, CONECTADA_PRUEBA);
  return resultado;
}

export function desconectar(): void {
  localStorage.removeItem(CLAVE_CONECTADA);
}

/** Marca la billetera del navegador (creada o importada) como conectada, sin pipeline de fondeo. */
export function marcarPruebaConectada(): void {
  localStorage.setItem(CLAVE_CONECTADA, CONECTADA_PRUEBA);
}

export async function direccionActual(): Promise<string | null> {
  const tipo = tipoConectada();
  if (tipo === 'prueba') return walletPrueba()!.publicKey();
  if (tipo !== 'freighter') return null;
  if (!(await freighterInstalada())) return null;
  const { isAllowed: permitida } = await isAllowed();
  if (!permitida) return null;
  const { address } = await getAddress();
  return address || null;
}

export async function requerirDireccion(): Promise<string> {
  const direccion = await direccionActual();
  if (!direccion) throw new ErrorWallet('sin-conexion');
  if (!(await redCorrecta())) throw new ErrorWallet('red-equivocada');
  return direccion;
}

export async function firmar(xdr: string): Promise<string> {
  const address = await requerirDireccion();
  if (tipoConectada() === 'prueba') return firmarConPrueba(xdr);
  const { signedTxXdr, error } = await signTransaction(xdr, { networkPassphrase: RED.passphrase, address });
  lanzarSiError(error);
  return signedTxXdr;
}

export function observarCambios(cb: (direccion: string | null, redOk: boolean) => void): () => void {
  const observador = new WatchWalletChanges(3000);
  observador.watch(({ address, networkPassphrase, error }) => {
    if (error || tipoConectada() !== 'freighter') return;
    cb(address || null, networkPassphrase === RED.passphrase);
  });
  return () => observador.stop();
}

export function abreviar(direccion: string): string {
  return `${direccion.slice(0, 4)}…${direccion.slice(-4)}`;
}

/**
 * Firma un mensaje de texto con la billetera conectada y devuelve la firma en base64
 * junto con la dirección que firmó. Con la billetera del navegador firma el texto
 * directamente; con Freighter usa signMessage (que aplica el formato SEP-53).
 * El servidor que verifica sabe distinguir las dos formas.
 */
export async function firmarMensaje(mensaje: string): Promise<{ firma: string; direccion: string }> {
  const direccion = await requerirDireccion();
  if (tipoConectada() === 'prueba') {
    const par = walletPrueba();
    if (!par) throw new ErrorWallet('sin-conexion');
    const firma = par.sign(Buffer.from(mensaje, 'utf8'));
    return { firma: Buffer.from(firma).toString('base64'), direccion };
  }
  const resultado = await signMessage(mensaje, { networkPassphrase: RED.passphrase, address: direccion });
  lanzarSiError(resultado.error as ErrorFreighter | undefined);
  if (!resultado.signedMessage) throw new ErrorWallet('desconocido', 'La billetera no devolvió la firma.');
  const firma =
    typeof resultado.signedMessage === 'string'
      ? resultado.signedMessage
      : Buffer.from(resultado.signedMessage).toString('base64');
  return { firma, direccion };
}
