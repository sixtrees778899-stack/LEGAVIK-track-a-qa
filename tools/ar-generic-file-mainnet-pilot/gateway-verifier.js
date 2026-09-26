const bodyTimeoutFor=(expectedSize,{minimumMs=30000,maximumMs=180000,minimumBytesPerSecond=128*1024}={})=>Math.max(minimumMs,Math.min(maximumMs,Math.ceil(expectedSize/minimumBytesPerSecond*1000)+15000));

export async function verifyGatewaysParallel({gateways,txid,expectedSize,expectedHash,hashBytes,fetchImpl=fetch,timeoutMs=12000,connectionTimeoutMs=timeoutMs,bodyTimeoutMs=bodyTimeoutFor(expectedSize),preferredGateway=null,now=()=>new Date().toISOString(),clock=()=>performance.now()}){
  const ordered=[...new Set([preferredGateway,...gateways].filter(Boolean))];
  const controllers=ordered.map(()=>new AbortController()),attempts=[];
  const result=await new Promise(resolve=>{
    let remaining=ordered.length,settled=false;
    ordered.forEach(async(gateway,index)=>{
      const started=clock(),attempt={gateway,preferred:gateway===preferredGateway,request_started_at:now(),timeout:false,timeout_stage:null,http_status:null,response_ms:null,download_ms:null,size_match:false,sha_match:false};
      let timer=setTimeout(()=>{attempt.timeout_stage='CONNECTION_OR_FIRST_BYTE';controllers[index].abort();},connectionTimeoutMs);
      try{
        const response=await fetchImpl(`${gateway}/${txid}?cjas_verify=${Date.now()}`,{cache:'no-store',signal:controllers[index].signal});
        clearTimeout(timer);attempt.response_ms=Number((clock()-started).toFixed(1));attempt.http_status=response.status;
        if(response.ok){const downloadStarted=clock();timer=setTimeout(()=>{attempt.timeout_stage='BODY_DOWNLOAD';controllers[index].abort();},bodyTimeoutMs);const bytes=new Uint8Array(await response.arrayBuffer());clearTimeout(timer);attempt.download_ms=Number((clock()-downloadStarted).toFixed(1));attempt.size=bytes.length;attempt.size_match=bytes.length===expectedSize;if(attempt.size_match){const hashStarted=clock();attempt.sha256=await hashBytes(bytes);attempt.sha_ms=Number((clock()-hashStarted).toFixed(1));attempt.sha_match=attempt.sha256===expectedHash;}if(attempt.sha_match&&!settled){settled=true;attempt.result='PASS';attempts.push(attempt);controllers.forEach((controller,i)=>{if(i!==index)controller.abort();});resolve({verified:true,bytes,gateway,httpStatus:response.status,attempts});return;}}
        attempt.result=response.ok?'INTEGRITY_PENDING':`HTTP_${response.status}`;
      }catch(error){attempt.timeout=error?.name==='AbortError';attempt.result=attempt.timeout?`TIMEOUT_${attempt.timeout_stage??'REQUEST'}`:'NETWORK_ERROR';}
      finally{clearTimeout(timer);if(!attempts.includes(attempt))attempts.push(attempt);remaining-=1;if(!remaining&&!settled){settled=true;resolve({verified:false,attempts});}}
    });
  });
  return result;
}

export const gatewayBodyTimeoutFor=bodyTimeoutFor;
