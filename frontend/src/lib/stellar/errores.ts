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
  20: 'El monto es menor al aporte mínimo.',
};

const ERRORES_TOKEN: Record<number, string> = {
  10: 'No tenés saldo suficiente de USDC para esta donación. Si usás la wallet de prueba, pedí más desde el panel de tu wallet.',
  13: 'Tu wallet todavía no está lista para usar USDC. Si usás Freighter, agregá USDC desde "Manage assets" y probá de nuevo; con la wallet de prueba esto se hace solo.',
};

export type TipoErrorWallet = 'sin-freighter' | 'rechazado' | 'red-equivocada' | 'sin-conexion' | 'desconocido';

const MENSAJES_WALLET: Record<TipoErrorWallet, string> = {
  'sin-freighter': 'No encontramos Freighter. Instalala desde freighter.app o creá una wallet de prueba desde «Conectar wallet».',
  rechazado: 'Cancelaste la solicitud en Freighter. No se movió tu dinero.',
  'red-equivocada': 'Freighter está apuntando a otra red. Cambiala a Testnet (la red de prueba) y probá de nuevo.',
  'sin-conexion': 'Primero conectá tu wallet.',
  desconocido: 'Freighter devolvió un error inesperado.',
};

/** Mensaje para cuando se cancela la firma después de haber subido el recuerdo a IPFS. */
export const MENSAJE_CANCELADO_TRAS_SUBIR =
  'Cancelaste la solicitud en Freighter. Tu recuerdo quedó guardado pero no se publicó en el mural: no se movió tu dinero.';

export function esRechazo(e: unknown): boolean {
  return e instanceof ErrorWallet && e.tipo === 'rechazado';
}

export class ErrorWallet extends Error {
  constructor(
    public tipo: TipoErrorWallet,
    detalle?: string,
  ) {
    super(detalle ?? MENSAJES_WALLET[tipo]);
    this.name = 'ErrorWallet';
  }
}

/** Error con mensaje ya redactado para el usuario: traducirError lo devuelve tal cual. */
export class ErrorNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}

/** La transacción se firmó y se envió, pero falló al ejecutarse en la red. */
export class ErrorTxFallida extends Error {
  constructor(public estadoTx?: string) {
    super(`La transacción se incluyó en la red pero falló (${estadoTx ?? 'error'}).`);
    this.name = 'ErrorTxFallida';
  }
}

export function traducirError(e: unknown): string {
  if (e instanceof ErrorNegocio) return e.message;
  if (e instanceof ErrorTxFallida) {
    return 'La transacción se incluyó en la red pero el contrato la rechazó. No se movió tu dinero; probá de nuevo.';
  }
  if (e instanceof ErrorWallet) return MENSAJES_WALLET[e.tipo];
  const mensaje = e instanceof Error ? e.message : String(e);
  const codigo = Number(mensaje.match(/Error\(Contract, #(\d+)\)/)?.[1]);
  if (ERRORES_CONTRATO[codigo]) return ERRORES_CONTRATO[codigo];
  if (ERRORES_TOKEN[codigo]) return ERRORES_TOKEN[codigo];
  if (/account not found/i.test(mensaje)) {
    return 'Tu cuenta todavía no existe en la red de prueba. Fondeala con Friendbot desde el panel de tu wallet; con la wallet de prueba esto se hace solo.';
  }
  if (/insufficient.?balance|tx_insufficient_fee/i.test(mensaje)) {
    return 'Te falta saldo para la comisión de la red (es mínima y en esta demo es de mentira). Fondeá tu cuenta desde el panel de tu wallet; con la wallet de prueba esto se hace solo.';
  }
  if (/Falta el ID del contrato/.test(mensaje)) return 'El contrato todavía no está desplegado.';
  console.error(e);
  return 'Ocurrió un error inesperado. Probá de nuevo; si sigue fallando, recargá la página o probá con la wallet de prueba.';
}
