import { RED } from '../../contracts/config';
import { usandoMock } from '../datos';
import { registrarDonacionMock } from '../datos/mock';
import type { Ladrillo } from '../tipos';

export function urlTransaccion(hash: string): string {
  return `${RED.explorador}/tx/${hash}`;
}

export type EtapaTx = 'firmando' | 'enviando';

export interface ResultadoTx<T> {
  valor: T;
  txHash: string;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function donar(
  donante: string,
  ladrilloId: number,
  recuerdoCid: string,
  monto: bigint,
  alProgreso: (etapa: EtapaTx) => void = () => {},
): Promise<ResultadoTx<Ladrillo>> {
  if (usandoMock) {
    alProgreso('firmando');
    await esperar(800);
    alProgreso('enviando');
    await esperar(1200);
    return { valor: registrarDonacionMock(ladrilloId, donante, recuerdoCid), txHash: `mock-${Date.now()}` };
  }

  const { clienteParedViva } = await import('./cliente');
  const cliente = await clienteParedViva(donante);
  const tx = await cliente.donar({ donante, ladrillo_id: ladrilloId, recuerdo_cid: recuerdoCid });
  alProgreso('firmando');
  await tx.sign();
  alProgreso('enviando');
  const enviada = await tx.send();
  const txHash = enviada.sendTransactionResponse?.hash ?? '';
  return {
    valor: { id: ladrilloId, donante, monto, recuerdoCid, fecha: Math.floor(Date.now() / 1000) },
    txHash,
  };
}
