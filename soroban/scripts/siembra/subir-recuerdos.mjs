// Sube cada recuerdo de recuerdos.json a IPFS (Pinata) con el mismo formato que /api/subir
// y escribe siembra.tsv (ladrillo, monto en USDC, CID) para sembrar-campania.sh.
// Uso (desde soroban/): node scripts/siembra/subir-recuerdos.mjs
// El JWT se toma de PINATA_JWT o de frontend/.env. Si siembra.tsv ya tiene un ladrillo, no se vuelve a subir.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(aqui, 'siembra.tsv');
const ENV_FRONT = join(aqui, '..', '..', '..', 'frontend', '.env');

function jwt() {
  if (process.env.PINATA_JWT) return process.env.PINATA_JWT;
  if (!existsSync(ENV_FRONT)) return '';
  const linea = readFileSync(ENV_FRONT, 'utf8').split(/\r?\n/).find((l) => l.startsWith('PINATA_JWT='));
  return linea ? linea.slice('PINATA_JWT='.length).trim() : '';
}

const token = jwt();
if (!token) {
  console.error('Falta PINATA_JWT (variable de entorno o frontend/.env).');
  process.exit(1);
}

const recuerdos = JSON.parse(readFileSync(join(aqui, 'recuerdos.json'), 'utf8'));
const hechos = new Map(
  existsSync(SALIDA)
    ? readFileSync(SALIDA, 'utf8')
        .split(/\r?\n/)
        .filter(Boolean)
        .map((l) => l.split('\t'))
        .map(([ladrillo, monto, cid]) => [Number(ladrillo), { monto, cid }])
    : [],
);

for (const { ladrillo, monto, texto, alias } of recuerdos) {
  if (hechos.has(ladrillo)) {
    console.log(`#${ladrillo} ya subido (${hechos.get(ladrillo).cid})`);
    continue;
  }
  const recuerdo = { version: 1, texto, ...(alias ? { alias } : {}), creado: new Date().toISOString() };
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pinataContent: recuerdo, pinataMetadata: { name: `pared-viva-siembra-${ladrillo}` } }),
  });
  if (!res.ok) {
    console.error(`Pinata respondió ${res.status} para el ladrillo ${ladrillo}`);
    process.exit(1);
  }
  const { IpfsHash } = await res.json();
  hechos.set(ladrillo, { monto: String(monto), cid: IpfsHash });
  writeFileSync(SALIDA, [...hechos].map(([l, { monto: m, cid }]) => `${l}\t${m}\t${cid}`).join('\n') + '\n');
  console.log(`#${ladrillo} → ${IpfsHash}`);
}

console.log(`Listo: ${hechos.size} recuerdos en ${SALIDA}`);
