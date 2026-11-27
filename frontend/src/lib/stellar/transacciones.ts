import type { contract } from '@stellar/stellar-sdk';
import { RED } from '../../contracts/config';
import { usandoMock } from '../datos';
import { aprobarHitoMock, reembolsarMock, registrarDonacionMock } from '../datos/mock';
import type { Ladrillo } from '../tipos';

export function urlTransaccion(hash: string): string {
  return `${RED.explorador}/tx/${hash}`;
}

export function esTxReal(hash: string): boolean {
  return !!hash && !hash.startsWith('mock-');
}

export type EtapaTx = 'firmando' | 'enviando';
type AlProgreso = (etapa: EtapaTx) => void;

export interface ResultadoTx<T> {
  valor: T;
  txHash: string;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const sinProgreso: AlProgreso = () => {};

async function simularMock<T>(alProgreso: AlProgreso, operacion: () => T): Promise<ResultadoTx<T>> {
  alProgreso('firmando');
  await esperar(800);
  alProgreso('enviando');
  await esperar(1200);
  return { valor: operacion(), txHash: `mock-${Date.now()}` };
}

async function firmarYEnviar<T>(tx: contract.AssembledTransaction<T>, alProgreso: AlProgreso) {
  void tx.simulationData;
  alProgreso('firmando');
  await tx.sign();
  alProgreso('enviando');
  const enviada = await tx.send();
  void enviada.result;
  return { enviada, txHash: enviada.sendTransactionResponse?.hash ?? '' };
}

async function cliente(publicKey: string) {
  const { clienteParedViva } = await import('./cliente');
  return clienteParedViva(publicKey);
}

export async function donar(
  donante: string,
  ladrilloId: number,
  recuerdoCid: string,
  monto: bigint,
  alProgreso = sinProgreso,
): Promise<ResultadoTx<Ladrillo>> {
  if (usandoMock) return simularMock(alProgreso, () => registrarDonacionMock(ladrilloId, donante, recuerdoCid, monto));

  const tx = await (await cliente(donante)).donar({ donante, ladrillo_id: ladrilloId, recuerdo_cid: recuerdoCid, monto });
  const { txHash } = await firmarYEnviar(tx, alProgreso);
  return {
    valor: { id: ladrilloId, donante, monto, recuerdoCid, fecha: Math.floor(Date.now() / 1000) },
    txHash,
  };
}

export async function aprobarHito(firmante: string, hito: number, alProgreso = sinProgreso): Promise<ResultadoTx<null>> {
  if (usandoMock) return simularMock(alProgreso, () => (aprobarHitoMock(firmante, hito), null));

  const tx = await (await cliente(firmante)).aprobar_hito({ firmante, hito });
  const { txHash } = await firmarYEnviar(tx, alProgreso);
  return { valor: null, txHash };
}

export async function reembolsar(donante: string, alProgreso = sinProgreso): Promise<ResultadoTx<bigint>> {
  if (usandoMock) return simularMock(alProgreso, () => reembolsarMock(donante));

  const tx = await (await cliente(donante)).reembolsar({ donante });
  const { enviada, txHash } = await firmarYEnviar(tx, alProgreso);
  return { valor: enviada.result.unwrap(), txHash };
}
