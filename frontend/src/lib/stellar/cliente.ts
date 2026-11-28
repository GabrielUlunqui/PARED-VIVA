import { Client } from '../../contracts/pared-viva/src/index';
import { campaniaActiva, CONTRATOS, RED } from '../../contracts/config';

export type ClienteParedViva = Client;

const clientes = new Map<string, Promise<ClienteParedViva>>();

export function contratoConfigurado(): boolean {
  return CONTRATOS.paredViva !== '';
}

export async function clienteParedViva(publicKey?: string): Promise<ClienteParedViva> {
  if (!contratoConfigurado()) {
    throw new Error('Falta el ID del contrato pared-viva en src/contracts/config.ts');
  }
  const contrato = await campaniaActiva();
  const clave = `${contrato}:${publicKey ?? ''}`;
  if (!clientes.has(clave)) {
    // `restore` no está en el tipo ClientOptions pero el SDK lo propaga a cada
    // llamada (spread de options): si el estado está archivado, restaura solo.
    const opciones = {
      contractId: contrato,
      rpcUrl: RED.rpcUrl,
      networkPassphrase: RED.passphrase,
      restore: true,
      publicKey,
      signTransaction: publicKey
        ? async (xdr: string) => ({ signedTxXdr: await (await import('./wallet')).firmar(xdr), signerAddress: publicKey })
        : undefined,
    };
    const cliente = new Client(opciones);
    clientes.set(clave, Promise.resolve(cliente));
  }
  return clientes.get(clave)!;
}
