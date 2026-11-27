import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CB36KQWDL6BD6TJVVOMRVKSHVM5QK7VTOLLU6ZG3EH3ZK43LID42NNIA",
  }
} as const

export const Errors = {
  1: {message:"BpsInvalido"},
  2: {message:"MontoInvalido"},
  3: {message:"NoEsGuardian"},
  4: {message:"PropuestaInvalida"},
  5: {message:"YaVoto"},
  6: {message:"SinPropuestas"},
  7: {message:"FondoInsuficiente"}
}


export interface Propuesta {
  descripcion_cid: string;
  guardian: string;
  id: u32;
  monto: i128;
  ronda: u32;
  votos: u32;
}

export interface Client {
  /**
   * Construct and simulate a votar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  votar: ({guardian, propuesta_id}: {guardian: string, propuesta_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a aportar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  aportar: ({cuidador, monto}: {cuidador: string, monto: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a proponer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  proponer: ({guardian, descripcion_cid, monto}: {guardian: string, descripcion_cid: string, monto: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a propuesta transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  propuesta: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Propuesta>>>

  /**
   * Construct and simulate a propuestas transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  propuestas: ({ronda}: {ronda: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Propuesta>>>

  /**
   * Construct and simulate a saldo_fondo transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  saldo_fondo: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a cerrar_ronda transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cerrar_ronda: (options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a ronda_actual transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  ronda_actual: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a vender_lamina transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vender_lamina: ({comprador, monto}: {comprador: string, monto: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, token, campania, artista, fondo_bps}: {admin: string, token: string, campania: string, artista: string, fondo_bps: u32},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin, token, campania, artista, fondo_bps}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABwAAAAAAAAALQnBzSW52YWxpZG8AAAAAAQAAAAAAAAANTW9udG9JbnZhbGlkbwAAAAAAAAIAAAAAAAAADE5vRXNHdWFyZGlhbgAAAAMAAAAAAAAAEVByb3B1ZXN0YUludmFsaWRhAAAAAAAABAAAAAAAAAAGWWFWb3RvAAAAAAAFAAAAAAAAAA1TaW5Qcm9wdWVzdGFzAAAAAAAABgAAAAAAAAARRm9uZG9JbnN1ZmljaWVudGUAAAAAAAAH",
        "AAAAAQAAAAAAAAAAAAAACVByb3B1ZXN0YQAAAAAAAAYAAAAAAAAAD2Rlc2NyaXBjaW9uX2NpZAAAAAAQAAAAAAAAAAhndWFyZGlhbgAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVtb250bwAAAAAAAAsAAAAAAAAABXJvbmRhAAAAAAAABAAAAAAAAAAFdm90b3MAAAAAAAAE",
        "AAAAAAAAAAAAAAAFdm90YXIAAAAAAAACAAAAAAAAAAhndWFyZGlhbgAAABMAAAAAAAAADHByb3B1ZXN0YV9pZAAAAAQAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAHYXBvcnRhcgAAAAACAAAAAAAAAAhjdWlkYWRvcgAAABMAAAAAAAAABW1vbnRvAAAAAAAACwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAIcHJvcG9uZXIAAAADAAAAAAAAAAhndWFyZGlhbgAAABMAAAAAAAAAD2Rlc2NyaXBjaW9uX2NpZAAAAAAQAAAAAAAAAAVtb250bwAAAAAAAAsAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAAAAAAAJcHJvcHVlc3RhAAAAAAAAAQAAAAAAAAACaWQAAAAAAAQAAAABAAAD6AAAB9AAAAAJUHJvcHVlc3RhAAAA",
        "AAAAAAAAAAAAAAAKcHJvcHVlc3RhcwAAAAAAAQAAAAAAAAAFcm9uZGEAAAAAAAAEAAAAAQAAA+oAAAfQAAAACVByb3B1ZXN0YQAAAA==",
        "AAAAAAAAAAAAAAALc2FsZG9fZm9uZG8AAAAAAAAAAAEAAAAL",
        "AAAAAAAAAAAAAAAMY2VycmFyX3JvbmRhAAAAAAAAAAEAAAPpAAAABAAAAAM=",
        "AAAAAAAAAAAAAAAMcm9uZGFfYWN0dWFsAAAAAAAAAAEAAAAE",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAUAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAhjYW1wYW5pYQAAABMAAAAAAAAAB2FydGlzdGEAAAAAEwAAAAAAAAAJZm9uZG9fYnBzAAAAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAANdmVuZGVyX2xhbWluYQAAAAAAAAIAAAAAAAAACWNvbXByYWRvcgAAAAAAABMAAAAAAAAABW1vbnRvAAAAAAAACwAAAAEAAAPpAAAAAgAAAAM=" ]),
      options
    )
  }
  public readonly fromJSON = {
    votar: this.txFromJSON<Result<void>>,
        aportar: this.txFromJSON<Result<void>>,
        proponer: this.txFromJSON<Result<u32>>,
        propuesta: this.txFromJSON<Option<Propuesta>>,
        propuestas: this.txFromJSON<Array<Propuesta>>,
        saldo_fondo: this.txFromJSON<i128>,
        cerrar_ronda: this.txFromJSON<Result<u32>>,
        ronda_actual: this.txFromJSON<u32>,
        vender_lamina: this.txFromJSON<Result<void>>
  }
}