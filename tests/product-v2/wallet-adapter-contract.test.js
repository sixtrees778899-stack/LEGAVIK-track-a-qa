import test from 'node:test';
import assert from 'node:assert/strict';
import {createProductionWalletAdapter,createWalletAdapter} from '../../src/ui/wallet-adapter.js';

test('production adapter is a thin wrapper over the existing Arweave signer',async()=>{
  const transaction={id:'unsigned'},calls=[];
  const arweave={transactions:{sign:async value=>{calls.push(value);value.id='signed';}}};
  const wallet={getActiveAddress:async()=>'production-address'};
  const adapter=createProductionWalletAdapter({arweave,wallet});
  assert.equal(await adapter.getAddress(),'production-address');
  await adapter.signTransaction(transaction,{operation_id:'ignored-by-production'});
  assert.deepEqual(calls,[transaction]);
  assert.equal(transaction.id,'signed');
});

test('provider adapter uses the same explicit contract without touching Arweave sign',async()=>{
  const transaction={id:'unsigned'},contexts=[];
  const arweave={transactions:{sign:async()=>{throw new Error('PRODUCTION_SIGN_MUST_NOT_RUN');}}};
  const wallet={getActiveAddress:async()=>'qa-address',signTransaction:async(value,context)=>{assert.equal(value,transaction);contexts.push(context);value.id='qa-signed';}};
  const adapter=createWalletAdapter({arweave,wallet});
  assert.equal(adapter.kind,'provider');
  assert.equal(await adapter.getAddress(),'qa-address');
  await adapter.signTransaction(transaction,{operation_id:'qa-op'});
  assert.deepEqual(contexts,[{operation_id:'qa-op'}]);
  assert.equal(transaction.id,'qa-signed');
});
