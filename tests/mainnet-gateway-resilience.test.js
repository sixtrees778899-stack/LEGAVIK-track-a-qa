import test from 'node:test';
import assert from 'node:assert/strict';
import {gatewayBodyTimeoutFor,verifyGatewaysParallel} from '../tools/ar-generic-file-mainnet-pilot/gateway-verifier.js';
import {verifyMainnetArchiveWithRetry} from '../src/ui/mainnet-connector.js';
import {cryptoEngine} from '../src/crypto/crypto-engine.js';

const txid='A'.repeat(43),bytes=new Uint8Array([1,2,3,4]),hash=await cryptoEngine.hashHex(bytes);
const response=(body=bytes,status=200,delay=0)=>({ok:status>=200&&status<300,status,async arrayBuffer(){if(delay)await new Promise(resolve=>setTimeout(resolve,delay));return body.buffer.slice(body.byteOffset,body.byteOffset+body.byteLength);}});

test('body download has a size-aware timeout longer than the connection gate',()=>{
  assert.ok(gatewayBodyTimeoutFor(4_861_792)>12_000);
  assert.ok(gatewayBodyTimeoutFor(54_290_430)<=180_000);
});

test('preferred verified gateway is attempted first and a slow body beyond 12 seconds is permitted',async()=>{
  const calls=[];
  const result=await verifyGatewaysParallel({gateways:['https://fallback.test','https://verified.test'],preferredGateway:'https://verified.test',txid,expectedSize:bytes.length,expectedHash:hash,connectionTimeoutMs:5,bodyTimeoutMs:50,fetchImpl:async url=>{calls.push(url);return url.startsWith('https://verified.test')?response(bytes,200,20):response(new Uint8Array([9]),200);},hashBytes:async value=>value.length===bytes.length?hash:'0'.repeat(64)});
  assert.equal(calls[0].startsWith('https://verified.test'),true);
  assert.equal(result.verified,true);
  assert.equal(result.gateway,'https://verified.test');
});

test('fallback succeeds and every candidate remains pinned to exact size and SHA',async()=>{
  const result=await verifyGatewaysParallel({gateways:['https://verified.test','https://fallback.test'],preferredGateway:'https://verified.test',txid,expectedSize:bytes.length,expectedHash:hash,fetchImpl:async url=>url.startsWith('https://verified.test')?response(new Uint8Array([1])):response(bytes),hashBytes:async value=>value.length===bytes.length?hash:'0'.repeat(64)});
  assert.equal(result.verified,true);
  assert.equal(result.gateway,'https://fallback.test');
  assert.equal(result.attempts.some(item=>item.gateway==='https://verified.test'&&!item.size_match),true);
});

test('size or SHA mismatch fails closed',async()=>{
  const size=await verifyGatewaysParallel({gateways:['https://one.test'],txid,expectedSize:99,expectedHash:hash,fetchImpl:async()=>response(bytes),hashBytes:async()=>hash});
  assert.equal(size.verified,false);
  const sha=await verifyGatewaysParallel({gateways:['https://one.test'],txid,expectedSize:bytes.length,expectedHash:hash,fetchImpl:async()=>response(bytes),hashBytes:async()=>'0'.repeat(64)});
  assert.equal(sha.verified,false);
});

test('independent recovery performs bounded retry without weakening integrity',async()=>{
  let round=0;
  const result=await verifyMainnetArchiveWithRetry({evidence:{txid,archive_size:bytes.length,archive_sha256:hash,download_gateway:'https://verified.test'},gateways:['https://verified.test'],retryDelaysMs:[0,1],sleep:async()=>{},fetchImpl:async()=>{round+=1;return round===1?response(new Uint8Array([1])):response(bytes);}});
  assert.equal(result.verified,true);
  assert.equal(round,2);
  assert.equal(result.attempts.length,2);
});
