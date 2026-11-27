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
    contractId: "CD3ZVQAQKTT3F3OW6DL6LQA4CDD4IEWGHRG4ZZDZJZTXQRJ5DIZXC6RE",
  }
} as const

export const Errors = {
  1: {message:"CampaniaNoActiva"},
  2: {message:"LadrilloOcupado"},
  3: {message:"LadrilloInvalido"},
  4: {message:"NoEsFirmante"},
  5: {message:"YaAprobado"},
  6: {message:"HitoInvalido"},
  7: {message:"MetaNoAlcanzada"},
  8: {message:"NoReembolsable"},
  9: {message:"SinAporte"},
  20: {message:"MontoInsuficiente"}
}


export interface Config {
  admin: string;
  aporte_minimo: i128;
  columnas: u32;
  fecha_limite: u64;
  filas: u32;
  firmantes: Array<string>;
  fondo: string;
  hitos: Array<i128>;
  meta: i128;
  restaurador: string;
  token: string;
}

export type Estado = {tag: "Activa", values: void} | {tag: "Financiada", values: void} | {tag: "Completada", values: void} | {tag: "Fallida", values: void};


export interface Resumen {
  aporte_minimo: i128;
  columnas: u32;
  estado: Estado;
  fecha_limite: u64;
  filas: u32;
  hito_actual: u32;
  hitos: Array<i128>;
  meta: i128;
  recaudado: i128;
}


export interface Ladrillo {
  donante: string;
  fecha: u64;
  id: u32;
  monto: i128;
  recuerdo: string;
}





export interface Client {
  /**
   * Construct and simulate a donar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  donar: ({donante, ladrillo_id, recuerdo_cid, monto}: {donante: string, ladrillo_id: u32, recuerdo_cid: string, monto: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a aporte transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  aporte: ({donante}: {donante: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a estado transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  estado: (options?: MethodOptions) => Promise<AssembledTransaction<Resumen>>

  /**
   * Construct and simulate a ladrillo transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  ladrillo: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Ladrillo>>>

  /**
   * Construct and simulate a firmantes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  firmantes: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a ladrillos transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  ladrillos: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Ladrillo>>>

  /**
   * Construct and simulate a reembolsar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reembolsar: ({donante}: {donante: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a es_guardian transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  es_guardian: ({direccion}: {direccion: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a aprobaciones transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  aprobaciones: ({hito}: {hito: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a aprobar_hito transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  aprobar_hito: ({firmante, hito}: {firmante: string, hito: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a retirar_excedente transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  retirar_excedente: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {config}: {config: Config},
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
    return ContractClient.deploy({config}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAFZG9uYXIAAAAAAAAEAAAAAAAAAAdkb25hbnRlAAAAABMAAAAAAAAAC2xhZHJpbGxvX2lkAAAAAAQAAAAAAAAADHJlY3VlcmRvX2NpZAAAABAAAAAAAAAABW1vbnRvAAAAAAAACwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAGYXBvcnRlAAAAAAABAAAAAAAAAAdkb25hbnRlAAAAABMAAAABAAAACw==",
        "AAAAAAAAAAAAAAAGZXN0YWRvAAAAAAAAAAAAAQAAB9AAAAAHUmVzdW1lbgA=",
        "AAAAAAAAAAAAAAAIbGFkcmlsbG8AAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAPoAAAH0AAAAAhMYWRyaWxsbw==",
        "AAAAAAAAAAAAAAAJZmlybWFudGVzAAAAAAAAAAAAAAEAAAPqAAAAEw==",
        "AAAAAAAAAAAAAAAJbGFkcmlsbG9zAAAAAAAAAAAAAAEAAAPqAAAH0AAAAAhMYWRyaWxsbw==",
        "AAAAAAAAAAAAAAAKcmVlbWJvbHNhcgAAAAAAAQAAAAAAAAAHZG9uYW50ZQAAAAATAAAAAQAAA+kAAAALAAAAAw==",
        "AAAAAAAAAAAAAAALZXNfZ3VhcmRpYW4AAAAAAQAAAAAAAAAJZGlyZWNjaW9uAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAMYXByb2JhY2lvbmVzAAAAAQAAAAAAAAAEaGl0bwAAAAQAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAAMYXByb2Jhcl9oaXRvAAAAAgAAAAAAAAAIZmlybWFudGUAAAATAAAAAAAAAARoaXRvAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABmNvbmZpZwAAAAAH0AAAAAZDb25maWcAAAAAAAA=",
        "AAAAAAAAAAAAAAARcmV0aXJhcl9leGNlZGVudGUAAAAAAAAAAAAAAQAAA+kAAAALAAAAAw==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACgAAAAAAAAAQQ2FtcGFuaWFOb0FjdGl2YQAAAAEAAAAAAAAAD0xhZHJpbGxvT2N1cGFkbwAAAAACAAAAAAAAABBMYWRyaWxsb0ludmFsaWRvAAAAAwAAAAAAAAAMTm9Fc0Zpcm1hbnRlAAAABAAAAAAAAAAKWWFBcHJvYmFkbwAAAAAABQAAAAAAAAAMSGl0b0ludmFsaWRvAAAABgAAAAAAAAAPTWV0YU5vQWxjYW56YWRhAAAAAAcAAAAAAAAADk5vUmVlbWJvbHNhYmxlAAAAAAAIAAAAAAAAAAlTaW5BcG9ydGUAAAAAAAAJAAAAAAAAABFNb250b0luc3VmaWNpZW50ZQAAAAAAABQ=",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAACwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA1hcG9ydGVfbWluaW1vAAAAAAAACwAAAAAAAAAIY29sdW1uYXMAAAAEAAAAAAAAAAxmZWNoYV9saW1pdGUAAAAGAAAAAAAAAAVmaWxhcwAAAAAAAAQAAAAAAAAACWZpcm1hbnRlcwAAAAAAA+oAAAATAAAAAAAAAAVmb25kbwAAAAAAABMAAAAAAAAABWhpdG9zAAAAAAAD6gAAAAsAAAAAAAAABG1ldGEAAAALAAAAAAAAAAtyZXN0YXVyYWRvcgAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABM=",
        "AAAAAgAAAAAAAAAAAAAABkVzdGFkbwAAAAAABAAAAAAAAAAAAAAABkFjdGl2YQAAAAAAAAAAAAAAAAAKRmluYW5jaWFkYQAAAAAAAAAAAAAAAAAKQ29tcGxldGFkYQAAAAAAAAAAAAAAAAAHRmFsbGlkYQA=",
        "AAAAAQAAAAAAAAAAAAAAB1Jlc3VtZW4AAAAACQAAAAAAAAANYXBvcnRlX21pbmltbwAAAAAAAAsAAAAAAAAACGNvbHVtbmFzAAAABAAAAAAAAAAGZXN0YWRvAAAAAAfQAAAABkVzdGFkbwAAAAAAAAAAAAxmZWNoYV9saW1pdGUAAAAGAAAAAAAAAAVmaWxhcwAAAAAAAAQAAAAAAAAAC2hpdG9fYWN0dWFsAAAAAAQAAAAAAAAABWhpdG9zAAAAAAAD6gAAAAsAAAAAAAAABG1ldGEAAAALAAAAAAAAAAlyZWNhdWRhZG8AAAAAAAAL",
        "AAAAAQAAAAAAAAAAAAAACExhZHJpbGxvAAAABQAAAAAAAAAHZG9uYW50ZQAAAAATAAAAAAAAAAVmZWNoYQAAAAAAAAYAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVtb250bwAAAAAAAAsAAAAAAAAACHJlY3VlcmRvAAAAEA==",
        "AAAABQAAAAAAAAAAAAAACERvbmFjaW9uAAAAAQAAAAhkb25hY2lvbgAAAAQAAAAAAAAAC2xhZHJpbGxvX2lkAAAAAAQAAAABAAAAAAAAAAdkb25hbnRlAAAAABMAAAAAAAAAAAAAAAVtb250bwAAAAAAAAsAAAAAAAAAAAAAAAhyZWN1ZXJkbwAAABAAAAAAAAAAAQ==",
        "AAAABQAAAAAAAAAAAAAACVJlZW1ib2xzbwAAAAAAAAEAAAAJcmVlbWJvbHNvAAAAAAAAAgAAAAAAAAAHZG9uYW50ZQAAAAATAAAAAAAAAAAAAAAFbW9udG8AAAAAAAALAAAAAAAAAAE=",
        "AAAABQAAAAAAAAAAAAAACkhpdG9QYWdhZG8AAAAAAAEAAAAJaGl0b19wYWdvAAAAAAAAAwAAAAAAAAAEaGl0bwAAAAQAAAABAAAAAAAAAAtyZXN0YXVyYWRvcgAAAAATAAAAAAAAAAAAAAAFbW9udG8AAAAAAAALAAAAAAAAAAE=",
        "AAAABQAAAAAAAAAAAAAADEhpdG9BcHJvYmFkbwAAAAEAAAAHaGl0b19vawAAAAADAAAAAAAAAARoaXRvAAAABAAAAAEAAAAAAAAACGZpcm1hbnRlAAAAEwAAAAAAAAAAAAAADGFwcm9iYWNpb25lcwAAAAQAAAAAAAAAAQ==" ]),
      options
    )
  }
  public readonly fromJSON = {
    donar: this.txFromJSON<Result<void>>,
        aporte: this.txFromJSON<i128>,
        estado: this.txFromJSON<Resumen>,
        ladrillo: this.txFromJSON<Option<Ladrillo>>,
        firmantes: this.txFromJSON<Array<string>>,
        ladrillos: this.txFromJSON<Array<Ladrillo>>,
        reembolsar: this.txFromJSON<Result<i128>>,
        es_guardian: this.txFromJSON<boolean>,
        aprobaciones: this.txFromJSON<Array<string>>,
        aprobar_hito: this.txFromJSON<Result<void>>,
        retirar_excedente: this.txFromJSON<Result<i128>>
  }
}