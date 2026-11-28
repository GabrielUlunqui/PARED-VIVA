import { Asset, BASE_FEE, Keypair, rpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { ASSET_USDC, RED } from '../../contracts/config';

export const MONTO_GRIFO_USDC = 100;

export const servidorRpc = new rpc.Server(RED.rpcUrl);
export const USDC = new Asset(ASSET_USDC.codigo, ASSET_USDC.emisor);

export async function enviarOperacion(firmante: Keypair, operacion: xdr.Operation): Promise<string> {
  const cuenta = await servidorRpc.getAccount(firmante.publicKey());
  const tx = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(operacion)
    .setTimeout(60)
    .build();
  tx.sign(firmante);
  const envio = await servidorRpc.sendTransaction(tx);
  if (envio.status !== 'PENDING') throw new Error(`La red rechazó la transacción (${envio.status})`);
  const final = await servidorRpc.pollTransaction(envio.hash, { attempts: 30 });
  if (final.status !== 'SUCCESS') throw new Error(`La transacción terminó en ${final.status}`);
  return envio.hash;
}
