const assertAdapter = adapter => {
  if (!adapter || typeof adapter.getAddress !== 'function' || typeof adapter.signTransaction !== 'function') throw new Error('WALLET_ADAPTER_INVALID');
  return adapter;
};

export function createProductionWalletAdapter({ arweave, wallet }) {
  if (!arweave?.transactions || typeof arweave.transactions.sign !== 'function') throw new Error('ARWEAVE_SIGNER_UNAVAILABLE');
  return Object.freeze({
    kind: 'production',
    getAddress: () => wallet?.getActiveAddress(),
    signTransaction: transaction => arweave.transactions.sign(transaction)
  });
}

export function createWalletAdapter({ arweave, wallet }) {
  if (typeof wallet?.signTransaction !== 'function') return createProductionWalletAdapter({ arweave, wallet });
  return assertAdapter(Object.freeze({
    kind: 'provider',
    getAddress: () => wallet.getActiveAddress(),
    signTransaction: (transaction, context) => wallet.signTransaction(transaction, context)
  }));
}
