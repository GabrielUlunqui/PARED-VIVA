import { Keypair, xdr } from '@stellar/stellar-sdk';
import { RED } from '../../contracts/config';
import { servidorRpc, USDC } from './clasicas';

// `null`: la cuenta no existe en la red (xlm) o no tiene trustline (usdc).
export interface Saldos {
  xlm: bigint | null;
  usdc: bigint | null;
}

export async function leerSaldos(direccion: string): Promise<Saldos> {
  const accountId = Keypair.fromPublicKey(direccion).xdrAccountId();
  const { entries } = await servidorRpc.getLedgerEntries(
    xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId })),
    xdr.LedgerKey.trustline(new xdr.LedgerKeyTrustLine({ accountId, asset: USDC.toTrustLineXdrObject() })),
  );
  const saldos: Saldos = { xlm: null, usdc: null };
  for (const { val } of entries) {
    if (val.type === 'account') saldos.xlm = val.account.balance;
    if (val.type === 'trustline') saldos.usdc = val.trustLine.balance;
  }
  return saldos;
}

export async function fondearConFriendbot(direccion: string): Promise<void> {
  const respuesta = await fetch(`${RED.friendbot}/?addr=${encodeURIComponent(direccion)}`);
  if (respuesta.ok) return;
  const { detail } = await respuesta.json().catch(() => ({ detail: '' }));
  if (!/already funded/i.test(detail ?? '')) throw new Error(detail || `Friendbot respondió ${respuesta.status}`);
}
