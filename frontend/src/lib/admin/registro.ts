/**
 * Registro de campañas y firmantes del panel de administración.
 * Vive en frontend/data/registro.json (gitignored): jamás se commitea ni se expone entero.
 * Las claves secretas quedan en el campo `claves`, que NINGÚN endpoint devuelve.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { CONTRATOS } from '../../contracts/config';

const ARCHIVO = join(process.cwd(), 'data', 'registro.json');

export interface CampaniaRegistrada {
  id: string;
  nombre: string;
  creada: number;
  origen: 'config' | 'admin';
}

export interface FirmanteRegistrado {
  direccion: string;
  nombre: string;
  tieneClave: boolean;
}

interface Registro {
  activa: string;
  campanias: CampaniaRegistrada[];
  firmantes: FirmanteRegistrado[];
  /** direccion → secreto S... Solo servidor: la API jamás lo devuelve. */
  claves: Record<string, string>;
  /** sha256 del wasm parcheado ya instalado en testnet (cachea la subida única). */
  wasmInstalado?: string;
}

function semilla(): Registro {
  const campanias: CampaniaRegistrada[] = [
    { id: CONTRATOS.paredViva, nombre: 'Campaña oficial', creada: 0, origen: 'config' },
  ];
  // La de ensayo también arranca registrada para poder ensayar sin tocar la oficial.
  const ensayo = 'CCSMURJVJBEVNCULQTYHGQP7JTNWA5SZGYHQGI5WPBUV6TEQS7K2ZTTP';
  if (ensayo !== CONTRATOS.paredViva) {
    campanias.push({ id: ensayo, nombre: 'Campaña de ensayo', creada: 0, origen: 'config' });
  }
  const firmantes: FirmanteRegistrado[] = [];
  const claves: Record<string, string> = {};
  for (const n of [1, 2, 3]) {
    const secreto = process.env[`FIRMANTE${n}_SECRETO`];
    if (secreto && StrKey.isValidEd25519SecretSeed(secreto)) {
      const direccion = Keypair.fromSecret(secreto).publicKey();
      firmantes.push({ direccion, nombre: `Firmante ${n}`, tieneClave: true });
      claves[direccion] = secreto;
    }
  }
  return { activa: CONTRATOS.paredViva, campanias, firmantes, claves };
}

export function leerRegistro(): Registro {
  try {
    if (existsSync(ARCHIVO)) {
      const crudo = JSON.parse(readFileSync(ARCHIVO, 'utf-8')) as Registro;
      if (crudo && Array.isArray(crudo.campanias)) {
        return {
          activa: crudo.activa ?? '',
          campanias: crudo.campanias,
          firmantes: Array.isArray(crudo.firmantes) ? crudo.firmantes : [],
          claves: crudo.claves && typeof crudo.claves === 'object' ? crudo.claves : {},
        };
      }
    }
  } catch {
    // archivo roto: se re-semilla (no se pierde nada on-chain, solo el registro local)
  }
  const nuevo = semilla();
  guardarRegistro(nuevo);
  return nuevo;
}

export function guardarRegistro(registro: Registro): void {
  mkdirSync(dirname(ARCHIVO), { recursive: true });
  const temporal = `${ARCHIVO}.tmp`;
  writeFileSync(temporal, JSON.stringify(registro, null, 2));
  renameSync(temporal, ARCHIVO);
}

/** Id de la campaña activa en el servidor (el navegador usa la meta pv-campania). */
export function campaniaActivaServidor(): string {
  return leerRegistro().activa || CONTRATOS.paredViva;
}

export function establecerActiva(id: string): boolean {
  const registro = leerRegistro();
  if (!registro.campanias.some((c) => c.id === id)) return false;
  registro.activa = id;
  guardarRegistro(registro);
  return true;
}

export function agregarCampania(campania: CampaniaRegistrada): void {
  const registro = leerRegistro();
  registro.campanias.push(campania);
  guardarRegistro(registro);
}

export function listaFirmantes(): FirmanteRegistrado[] {
  return leerRegistro().firmantes;
}

export function agregarFirmante(direccion: string, nombre: string, secreto?: string): FirmanteRegistrado {
  const registro = leerRegistro();
  const existente = registro.firmantes.find((f) => f.direccion === direccion);
  if (existente) {
    if (nombre) existente.nombre = nombre;
    if (secreto) {
      registro.claves[direccion] = secreto;
      existente.tieneClave = true;
    }
    guardarRegistro(registro);
    return existente;
  }
  const nuevo: FirmanteRegistrado = { direccion, nombre, tieneClave: !!secreto };
  registro.firmantes.push(nuevo);
  if (secreto) registro.claves[direccion] = secreto;
  guardarRegistro(registro);
  return nuevo;
}

/** Secreto de un firmante si el servidor lo tiene (registro o variable de entorno). Jamás exponer. */
export function claveDeFirmante(direccion: string): string | null {
  const registro = leerRegistro();
  const guardada = registro.claves[direccion];
  if (guardada && StrKey.isValidEd25519SecretSeed(guardada)) return guardada;
  for (const n of [1, 2, 3]) {
    const secreto = process.env[`FIRMANTE${n}_SECRETO`];
    if (secreto && StrKey.isValidEd25519SecretSeed(secreto) && Keypair.fromSecret(secreto).publicKey() === direccion) {
      return secreto;
    }
  }
  return null;
}
