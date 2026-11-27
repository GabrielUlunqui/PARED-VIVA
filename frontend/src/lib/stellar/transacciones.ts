import type { contract } from '@stellar/stellar-sdk';
import { RED } from '../../contracts/config';
import { usandoMock } from '../datos';
import { aprobarHitoMock, reembolsarMock, registrarDonacionMock } from '../datos/mock';
import { invalidarCacheStellar } from '../datos/stellar';
import type { Ladrillo } from '../tipos';
import { ErrorNegocio, ErrorTxFallida } from './errores';

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
  alProgreso('firmando');
  await tx.sign();
  alProgreso('enviando');
  const enviada = await tx.send();
  const respuesta = enviada.getTransactionResponse;
  if (respuesta && 'status' in respuesta && respuesta.status !== 'SUCCESS') {
    // La simulación pasó pero la ejecución real falló (p. ej. carrera por el mismo ladrillo).
    // El getter `enviada.result` tiraría un error genérico sin el código del contrato.
    throw new ErrorTxFallida(respuesta.status);
  }
  return { enviada, txHash: enviada.sendTransactionResponse?.hash ?? '' };
}

async function cliente(publicKey: string) {
  const { clienteParedViva } = await import('./cliente');
  return clienteParedViva(publicKey);
}

async function clienteLectura() {
  const { clienteParedViva } = await import('./cliente');
  return clienteParedViva();
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
  try {
    const { txHash } = await firmarYEnviar(tx, alProgreso);
    invalidarCacheStellar();
    return {
      valor: { id: ladrilloId, donante, monto, recuerdoCid, fecha: Math.floor(Date.now() / 1000) },
      txHash,
    };
  } catch (e) {
    if (e instanceof ErrorTxFallida) {
      // Carrera típica: otro adoptó el ladrillo entre la simulación y la inclusión.
      try {
        const ocupado = await (await clienteLectura()).ladrillo({ id: ladrilloId });
        if (ocupado.result) {
          throw new ErrorNegocio('Otra persona adoptó ese ladrillo justo antes que vos. No se movió tu dinero: elegí otro.');
        }
      } catch (relectura) {
        if (relectura instanceof ErrorNegocio) throw relectura;
      }
    }
    throw e;
  }
}

export async function aprobarHito(firmante: string, hito: number, alProgreso = sinProgreso): Promise<ResultadoTx<null>> {
  if (usandoMock) return simularMock(alProgreso, () => (aprobarHitoMock(firmante, hito), null));

  const tx = await (await cliente(firmante)).aprobar_hito({ firmante, hito });
  const { txHash } = await firmarYEnviar(tx, alProgreso);
  invalidarCacheStellar();
  return { valor: null, txHash };
}

export async function reembolsar(donante: string, alProgreso = sinProgreso): Promise<ResultadoTx<bigint>> {
  if (usandoMock) return simularMock(alProgreso, () => reembolsarMock(donante));

  const tx = await (await cliente(donante)).reembolsar({ donante });
  const { enviada, txHash } = await firmarYEnviar(tx, alProgreso);
  invalidarCacheStellar();
  return { valor: enviada.result.unwrap(), txHash };
}
