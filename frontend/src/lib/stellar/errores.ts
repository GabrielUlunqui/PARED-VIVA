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

// TODO [B5]: sumar errores de red (sin trustline, saldo insuficiente, firma rechazada, red equivocada).
export function traducirError(e: unknown): string {
  const mensaje = e instanceof Error ? e.message : String(e);
  const codigo = mensaje.match(/Error\(Contract, #(\d+)\)/)?.[1];
  if (codigo && ERRORES_CONTRATO[Number(codigo)]) return ERRORES_CONTRATO[Number(codigo)];
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}
