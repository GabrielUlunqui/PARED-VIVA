import { CONTRATOS, RED } from '../../contracts/config';

// TODO [B3]: cuando A genere los bindings en src/contracts/pared-viva/, instanciar acá el cliente:
//   import { Client } from '../../contracts/pared-viva';
//   new Client({ contractId: CONTRATOS.paredViva, rpcUrl: RED.rpcUrl, networkPassphrase: RED.passphrase, ... })

export function contratoConfigurado(): boolean {
  return CONTRATOS.paredViva !== '';
}

export function urlTransaccion(hash: string): string {
  return `${RED.explorador}/tx/${hash}`;
}
