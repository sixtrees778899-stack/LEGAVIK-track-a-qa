const bodyTimeoutFor=(expectedSize,{minimumMs=30000,maximumMs=180000,minimumBytesPerSecond=128*1024}={})=>Math.max(minimumMs,Math.min(maximumMs,Math.ceil(expectedSize/minimumBytesPerSecond*1000)+15000));

async function readResponseBytes(response,{controller,expectedSize,connectionTimeoutMs,stallTimeoutMs,absoluteBodyTimeoutMs,clock,onProgress=()=>{}}){
  const bodyStarted=clock();let firstByteAt=null,lastProgressAt=bodyStarted,total=0,absoluteTimer=null,firstByteTimer=null;
  const clearTimers=()=>{clearTimeout(firstByteTimer);clearTimeout(absoluteTimer);};
  try{
    firstByteTimer=setTimeout(()=>controller.abort('FIRST_BYTE_TIMEOUT'),connectionTimeoutMs);
    absoluteTimer=setTimeout(()=>controller.abort('BODY_ABSOLUTE_TIMEOUT'),absoluteBodyTimeoutMs);
    if(!response.body?.getReader){
      const bytes=new Uint8Array(await response.arrayBuffer());
      clearTimeout(firstByteTimer);firstByteAt=clock();total=bytes.length;lastProgressAt=firstByteAt;onProgress({bytes_received:total,elapsed_ms:Number((lastProgressAt-bodyStarted).toFixed(1))});
      return{bytes,first_byte_ms:Number((firstByteAt-bodyStarted).toFixed(1)),download_ms:Number((clock()-bodyStarted).toFixed(1)),progress_events:total?1:0};
    }
    const reader=response.body.getReader(),chunks=[],progressSamples=[];let progressEvents=0;
    while(true){
      let stallTimer;
      const stalled=new Promise((_,reject)=>{stallTimer=setTimeout(()=>{controller.abort('BODY_STALLED');reject(new DOMException('Gateway body stalled','AbortError'));},stallTimeoutMs);});
      let value,done;try{({value,done}=await Promise.race([reader.read(),stalled]));}finally{clearTimeout(stallTimer);}
      if(done)break;
      if(!value?.byteLength)continue;
      const at=clock();
      if(firstByteAt===null){firstByteAt=at;clearTimeout(firstByteTimer);}
      lastProgressAt=at;total+=value.byteLength;progressEvents+=1;
      if(total>expectedSize){try{await reader.cancel('SIZE_EXCEEDED');}catch{}throw Object.assign(new Error('Gateway response exceeds expected Archive size'),{code:'SIZE_EXCEEDED'});}
      chunks.push(value instanceof Uint8Array?value:new Uint8Array(value));
      const progress={bytes_received:total,elapsed_ms:Number((at-bodyStarted).toFixed(1))};
      if(progressSamples.length<64||total===expectedSize)progressSamples.push(progress);
      onProgress(progress);
    }
    if(firstByteAt===null){firstByteAt=clock();clearTimeout(firstByteTimer);}
    const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return{bytes,first_byte_ms:Number((firstByteAt-bodyStarted).toFixed(1)),download_ms:Number((clock()-bodyStarted).toFixed(1)),progress_events:progressEvents,progress_samples:progressSamples,last_progress_ms:Number((lastProgressAt-bodyStarted).toFixed(1))};
  }finally{clearTimers();}
}

export async function verifyGatewaysParallel({gateways,txid,expectedSize,expectedHash,hashBytes,fetchImpl=fetch,timeoutMs=12000,connectionTimeoutMs=timeoutMs,bodyTimeoutMs=bodyTimeoutFor(expectedSize),stallTimeoutMs=12000,preferredGateway=null,now=()=>new Date().toISOString(),clock=()=>performance.now(),onProgress=()=>{}}){
  const ordered=[...new Set([preferredGateway,...gateways].filter(Boolean))];
  const controllers=ordered.map(()=>new AbortController()),attempts=[];
  const result=await new Promise(resolve=>{
    let remaining=ordered.length,settled=false;
    ordered.forEach(async(gateway,index)=>{
      const started=clock(),attempt={gateway,preferred:gateway===preferredGateway,request_started_at:now(),timeout:false,timeout_stage:null,http_status:null,response_ms:null,download_ms:null,size_match:false,sha_match:false};
      let timer=setTimeout(()=>{attempt.timeout_stage='CONNECTION';controllers[index].abort('CONNECTION_TIMEOUT');},connectionTimeoutMs);
      try{
        const response=await fetchImpl(`${gateway}/${txid}?cjas_verify=${Date.now()}`,{cache:'no-store',signal:controllers[index].signal});
        clearTimeout(timer);attempt.response_ms=Number((clock()-started).toFixed(1));attempt.http_status=response.status;
        if(response.ok){const download=await readResponseBytes(response,{controller:controllers[index],expectedSize,connectionTimeoutMs,stallTimeoutMs,absoluteBodyTimeoutMs:bodyTimeoutMs,clock,onProgress:progress=>onProgress({gateway,...progress})});const bytes=download.bytes;Object.assign(attempt,{download_ms:download.download_ms,first_byte_ms:download.first_byte_ms,progress_events:download.progress_events,progress_samples:download.progress_samples,last_progress_ms:download.last_progress_ms,size:bytes.length});attempt.size_match=bytes.length===expectedSize;if(attempt.size_match){const hashStarted=clock();attempt.sha256=await hashBytes(bytes);attempt.sha_ms=Number((clock()-hashStarted).toFixed(1));attempt.sha_match=attempt.sha256===expectedHash;}if(attempt.sha_match&&!settled){settled=true;attempt.result='PASS';attempts.push(attempt);controllers.forEach((controller,i)=>{if(i!==index)controller.abort('PARALLEL_WINNER');});resolve({verified:true,bytes,gateway,httpStatus:response.status,attempts});return;}}
        attempt.result=response.ok?'INTEGRITY_PENDING':`HTTP_${response.status}`;
      }catch(error){attempt.timeout=error?.name==='AbortError';const reason=controllers[index].signal.reason;attempt.timeout_stage=attempt.timeout_stage??(reason==='FIRST_BYTE_TIMEOUT'?'FIRST_BYTE':reason==='BODY_STALLED'?'BODY_STALLED':reason==='BODY_ABSOLUTE_TIMEOUT'?'BODY_ABSOLUTE':null);attempt.result=error?.code==='SIZE_EXCEEDED'?'SIZE_EXCEEDED':attempt.timeout?`TIMEOUT_${attempt.timeout_stage??'REQUEST'}`:'NETWORK_ERROR';}
      finally{clearTimeout(timer);if(!attempts.includes(attempt))attempts.push(attempt);remaining-=1;if(!remaining&&!settled){settled=true;resolve({verified:false,attempts});}}
    });
  });
  return result;
}

export const gatewayBodyTimeoutFor=bodyTimeoutFor;
