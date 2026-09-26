import {test,expect} from '@playwright/test';

test('HTTP 200 with continuing byte progress survives beyond the former whole-body cutoff',async({page})=>{
  await page.goto('/tools/ar-generic-file-mainnet-pilot/index.html');
  const result=await page.evaluate(async()=>{
    const {verifyGatewaysParallel}=await import('/tools/ar-generic-file-mainnet-pilot/gateway-verifier.js');
    const source=Uint8Array.from({length:24},(_,index)=>index+1);
    const digest=buffer=>Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('');
    const expectedHash=digest(await crypto.subtle.digest('SHA-256',source));
    const progress=[];
    const response={ok:true,status:200,body:new ReadableStream({async start(controller){for(let offset=0;offset<source.length;offset+=4){await new Promise(resolve=>setTimeout(resolve,15));controller.enqueue(source.slice(offset,offset+4));}controller.close();}})};
    const verified=await verifyGatewaysParallel({gateways:['https://stream.test'],txid:'A'.repeat(43),expectedSize:source.length,expectedHash,connectionTimeoutMs:30,stallTimeoutMs:25,bodyTimeoutMs:250,fetchImpl:async()=>response,hashBytes:async bytes=>digest(await crypto.subtle.digest('SHA-256',bytes)),onProgress:event=>progress.push(event.bytes_received)});
    return{verified:verified.verified,progress,attempt:verified.attempts[0]};
  });
  expect(result.verified).toBe(true);
  expect(result.progress).toEqual([4,8,12,16,20,24]);
  expect(result.attempt.progress_events).toBe(6);
  expect(result.attempt.download_ms).toBeGreaterThan(25);
  expect(result.attempt.size_match).toBe(true);
  expect(result.attempt.sha_match).toBe(true);
});

test('HTTP 200 with no byte progress is stopped by the bounded stall gate',async({page})=>{
  await page.goto('/tools/ar-generic-file-mainnet-pilot/index.html');
  const result=await page.evaluate(async()=>{
    const {verifyGatewaysParallel}=await import('/tools/ar-generic-file-mainnet-pilot/gateway-verifier.js');
    const response={ok:true,status:200,body:new ReadableStream({async start(controller){controller.enqueue(Uint8Array.of(1,2));await new Promise(resolve=>setTimeout(resolve,80));controller.enqueue(Uint8Array.of(3,4));controller.close();}})};
    return verifyGatewaysParallel({gateways:['https://stall.test'],txid:'A'.repeat(43),expectedSize:4,expectedHash:'0'.repeat(64),connectionTimeoutMs:30,stallTimeoutMs:20,bodyTimeoutMs:250,fetchImpl:async()=>response,hashBytes:async()=> '0'.repeat(64)});
  });
  expect(result.verified).toBe(false);
  expect(result.attempts[0].result).toBe('TIMEOUT_BODY_STALLED');
});
