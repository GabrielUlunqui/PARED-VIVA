export const RED = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
  explorador: 'https://stellar.expert/explorer/testnet',
  friendbot: 'https://friendbot.stellar.org',
};

// Asset clásico detrás del SAC `usdc` (emitido por `admin`).
export const ASSET_USDC = { codigo: 'USDC', emisor: 'GBT3IVJYJWNZ5QX4TIFUQT5Z4KD4DOJMLWEVX4THRWUYAAKZSBZNKDZY' };

// PUBLIC_CAMPANIA=ensayo usa una campaña de prueba (meta 10 USDC) para ensayar Freighter e IPFS sin tocar la oficial.
const IDS = {
  paredViva: 'CD3ZVQAQKTT3F3OW6DL6LQA4CDD4IEWGHRG4ZZDZJZTXQRJ5DIZXC6RE',
  paredVivaEnsayo: 'CCSMURJVJBEVNCULQTYHGQP7JTNWA5SZGYHQGI5WPBUV6TEQS7K2ZTTP',
  usdc: 'CAKOGDRIVNTTJMVT5YEI5R5EY5FOBGPJSO4QOEFNHIZZBHYH7XQNSKDP',
  fondoBarrio: 'CB36KQWDL6BD6TJVVOMRVKSHVM5QK7VTOLLU6ZG3EH3ZK43LID42NNIA',
};

export const usandoEnsayo = import.meta.env?.PUBLIC_CAMPANIA === 'ensayo';

export const CONTRATOS = { ...IDS, paredViva: usandoEnsayo ? IDS.paredVivaEnsayo : IDS.paredViva };

/**
 * Campaña activa para leer el contrato.
 * En el navegador la inyecta Base.astro en <meta name="pv-campania"> desde el
 * registro del servidor; en el servidor (SSR/endpoints) lee ese mismo registro.
 * Si no hay registro o falla la lectura, se usa la de configuración como siempre.
 */
export async function campaniaActiva(): Promise<string> {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="pv-campania"]')?.getAttribute('content');
    if (meta) return meta;
    return CONTRATOS.paredViva;
  }
  try {
    const { existsSync, readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const archivo = join(process.cwd(), 'data', 'registro.json');
    if (existsSync(archivo)) {
      const registro = JSON.parse(readFileSync(archivo, 'utf-8')) as { activa?: string };
      if (registro?.activa) return registro.activa;
    }
  } catch {
    // sin registro o entorno sin fs: fallback de configuración
  }
  return CONTRATOS.paredViva;
}
