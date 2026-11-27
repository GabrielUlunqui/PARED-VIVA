export const RED = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015',
  explorador: 'https://stellar.expert/explorer/testnet',
};

// PUBLIC_CAMPANIA=ensayo usa una campaña de prueba (meta 10 USDC) para ensayar Freighter e IPFS sin tocar la oficial.
const IDS = {
  paredViva: 'CD3ZVQAQKTT3F3OW6DL6LQA4CDD4IEWGHRG4ZZDZJZTXQRJ5DIZXC6RE',
  paredVivaEnsayo: 'CCSMURJVJBEVNCULQTYHGQP7JTNWA5SZGYHQGI5WPBUV6TEQS7K2ZTTP',
  usdc: 'CAKOGDRIVNTTJMVT5YEI5R5EY5FOBGPJSO4QOEFNHIZZBHYH7XQNSKDP',
  fondoBarrio: 'CB36KQWDL6BD6TJVVOMRVKSHVM5QK7VTOLLU6ZG3EH3ZK43LID42NNIA',
};

export const usandoEnsayo = import.meta.env?.PUBLIC_CAMPANIA === 'ensayo';

export const CONTRATOS = { ...IDS, paredViva: usandoEnsayo ? IDS.paredVivaEnsayo : IDS.paredViva };
