import { contract } from '@stellar/stellar-sdk';
import { CONTRATOS, RED } from '../../contracts/config';
import { firmar } from './wallet';

// Client.from descarga la interfaz del contrato desde la red: no hace falta esperar los bindings de A.
// TODO [B3]: cuando A genere los bindings en src/contracts/pared-viva/, se puede cambiar por el Client tipado.
export interface ClienteParedViva extends contract.Client {
  donar(args: {
    donante: string;
    ladrillo_id: number;
    recuerdo_cid: string;
    monto: bigint;
  }): Promise<contract.AssembledTransaction<null>>;
}

const clientes = new Map<string, Promise<ClienteParedViva>>();

export function contratoConfigurado(): boolean {
  return CONTRATOS.paredViva !== '';
}

export function clienteParedViva(publicKey?: string): Promise<ClienteParedViva> {
  if (!contratoConfigurado()) {
    throw new Error('Falta el ID del contrato pared-viva en src/contracts/config.ts');
  }
  const clave = publicKey ?? '';
  if (!clientes.has(clave)) {
    clientes.set(
      clave,
      contract.Client.from({
        contractId: CONTRATOS.paredViva,
        rpcUrl: RED.rpcUrl,
        networkPassphrase: RED.passphrase,
        publicKey,
        signTransaction: async (xdr: string) => ({ signedTxXdr: await firmar(xdr), signerAddress: publicKey }),
      }) as Promise<ClienteParedViva>,
    );
  }
  return clientes.get(clave)!;
}
