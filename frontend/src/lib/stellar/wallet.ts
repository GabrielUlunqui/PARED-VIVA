// TODO [B2]: implementar con @stellar/freighter-api (isConnected, requestAccess, getAddress, getNetworkDetails, signTransaction).

export async function conectar(): Promise<string> {
  throw new Error('TODO [B2] conectar wallet');
}

export async function direccionActual(): Promise<string | null> {
  return null;
}

export async function firmar(xdr: string): Promise<string> {
  void xdr;
  throw new Error('TODO [B2] firmar transacción');
}

export function abreviar(direccion: string): string {
  return `${direccion.slice(0, 4)}…${direccion.slice(-4)}`;
}
