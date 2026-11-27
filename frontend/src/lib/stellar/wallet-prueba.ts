import { Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { RED } from '../../contracts/config';
import { enviarOperacion, USDC } from './clasicas';
import { ErrorNegocio, ErrorWallet, traducirError } from './errores';
import { fondearConFriendbot, leerSaldos } from './saldos';

const CLAVE_SECRETO = 'pv:wallet-prueba';

export type EtapaPrueba = 'fondeando' | 'trustline' | 'usdc';

export function walletPrueba(): Keypair | null {
  const secreto = localStorage.getItem(CLAVE_SECRETO);
  if (!secreto) return null;
  try {
    return Keypair.fromSecret(secreto);
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
  if (!par) {
    par = Keypair.random();
    localStorage.setItem(CLAVE_SECRETO, par.secret());
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
