import test from 'node:test';
import assert from 'node:assert/strict';
import {gatewayBodyTimeoutFor,verifyGatewaysParallel} from '../tools/ar-generic-file-mainnet-pilot/gateway-verifier.js';
import {verifyMainnetArchiveWithRetry} from '../src/ui/mainnet-connector.js';
import {cryptoEngine} from '../src/crypto/crypto-engine.js';

const txid='A'.repeat(43),bytes=new Uint8Array([1,2,3,4]),hash=await cryptoEngine.hashHex(bytes);
const response=(body=bytes,status=200,delay=0)=>({ok:status>=200&&status<300,status,async arrayBuffer(){if(delay)await new Promise(resolve=>setTimeout(resolve,delay));return body.buffer.slice(body.byteOffset,body.byteOffset+body.byteLength);}});
const streamingResponse=({chunks,delays=[],status=200})=>({ok:status>=200&&status<300,status,body:new ReadableStream({async pull(controller){if(!chunks.length){controller.close();return;}const delay=delays.shift()??0;if(delay)await new Promise(resolve=>setTimeout(resolve,delay));controller.enqueue(chunks.shift());}})});

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

test('a continuously progressing HTTP 200 body is not killed by a short stall window',async()=>{
  const source=Uint8Array.from({length:12},(_,index)=>index+1),sourceHash=await cryptoEngine.hashHex(source),progress=[];
  const result=await verifyGatewaysParallel({gateways:['https://progress.test'],txid,expectedSize:source.length,expectedHash:sourceHash,connectionTimeoutMs:20,stallTimeoutMs:12,bodyTimeoutMs:100,fetchImpl:async()=>streamingResponse({chunks:[source.slice(0,4),source.slice(4,8),source.slice(8)],delays:[1,8,8]}),hashBytes:value=>cryptoEngine.hashHex(value),onProgress:event=>progress.push(event.bytes_received)});
  assert.equal(result.verified,true);
  assert.deepEqual(progress,[4,8,12]);
  assert.equal(result.attempts[0].progress_events,3);
});

test('a stalled HTTP 200 body is aborted and fails closed',async()=>{
  const source=Uint8Array.from({length:8},(_,index)=>index+1),sourceHash=await cryptoEngine.hashHex(source);
  const result=await verifyGatewaysParallel({gateways:['https://stall.test'],txid,expectedSize:source.length,expectedHash:sourceHash,connectionTimeoutMs:20,stallTimeoutMs:5,bodyTimeoutMs:100,fetchImpl:async()=>streamingResponse({chunks:[source.slice(0,4),source.slice(4)],delays:[1,30]}),hashBytes:value=>cryptoEngine.hashHex(value)});
  assert.equal(result.verified,false);
  assert.equal(result.attempts[0].result,'TIMEOUT_BODY_STALLED');
});

test('parallel gateways accept the first exact size and SHA winner and cancel the slower body',async()=>{
  const source=Uint8Array.from({length:8},(_,index)=>index+1),sourceHash=await cryptoEngine.hashHex(source);
  const result=await verifyGatewaysParallel({gateways:['https://slow.test','https://fast.test'],txid,expectedSize:source.length,expectedHash:sourceHash,connectionTimeoutMs:20,stallTimeoutMs:20,bodyTimeoutMs:100,fetchImpl:async url=>url.startsWith('https://fast.test')?streamingResponse({chunks:[source],delays:[1]}):streamingResponse({chunks:[source],delays:[40]}),hashBytes:value=>cryptoEngine.hashHex(value)});
  assert.equal(result.verified,true);
  assert.equal(result.gateway,'https://fast.test');
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
