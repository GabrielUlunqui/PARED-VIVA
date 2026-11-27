export const ERRORES_CONTRATO: Record<number, string> = {
  1: 'La campaña no está recibiendo donaciones.',
  2: 'Ese ladrillo ya fue adoptado. Elegí otro.',
  3: 'El ladrillo no existe.',
  4: 'Tu wallet no es uno de los firmantes.',
  5: 'Ya aprobaste este hito.',
  6: 'Ese no es el próximo hito pendiente.',
  7: 'La campaña todavía no alcanzó la meta.',
  8: 'La campaña no está en estado de reembolso.',
  9: 'No tenés aportes para reembolsar.',
};

export type TipoErrorWallet = 'sin-freighter' | 'rechazado' | 'red-equivocada' | 'sin-conexion' | 'desconocido';

const MENSAJES_WALLET: Record<TipoErrorWallet, string> = {
  'sin-freighter': 'No encontramos Freighter. Instalá la extensión desde freighter.app y recargá la página.',
  rechazado: 'Cancelaste la solicitud en Freighter.',
  'red-equivocada': 'Freighter está en otra red. Cambiala a Testnet y probá de nuevo.',
  'sin-conexion': 'Primero conectá tu wallet.',
  desconocido: 'Freighter devolvió un error inesperado.',
};

export class ErrorWallet extends Error {
  constructor(
    public tipo: TipoErrorWallet,
    detalle?: string,
  ) {
    super(detalle ?? MENSAJES_WALLET[tipo]);
    this.name = 'ErrorWallet';
  }
}

// TODO [B5]: sumar errores de red (sin trustline, saldo insuficiente).
export function traducirError(e: unknown): string {
  if (e instanceof ErrorWallet) return MENSAJES_WALLET[e.tipo];
  const mensaje = e instanceof Error ? e.message : String(e);
  const codigo = mensaje.match(/Error\(Contract, #(\d+)\)/)?.[1];
  if (codigo && ERRORES_CONTRATO[Number(codigo)]) return ERRORES_CONTRATO[Number(codigo)];
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}
