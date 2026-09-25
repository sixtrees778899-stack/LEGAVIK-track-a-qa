export async function verifyGatewaysParallel({gateways,txid,expectedSize,expectedHash,hashBytes,fetchImpl=fetch,timeoutMs=12000,now=()=>new Date().toISOString(),clock=()=>performance.now()}){
  const controllers=gateways.map(()=>new AbortController()),attempts=[];
  const result=await new Promise(resolve=>{
    let remaining=gateways.length,settled=false;
    gateways.forEach(async(gateway,index)=>{
      const started=clock(),attempt={gateway,request_started_at:now(),timeout:false,http_status:null,response_ms:null,download_ms:null,size_match:false,sha_match:false};
      const timer=setTimeout(()=>controllers[index].abort(),timeoutMs);
      try{
        const response=await fetchImpl(`${gateway}/${txid}?cjas_verify=${Date.now()}`,{cache:'no-store',signal:controllers[index].signal});
        attempt.response_ms=Number((clock()-started).toFixed(1));attempt.http_status=response.status;
        if(response.ok){const downloadStarted=clock(),bytes=new Uint8Array(await response.arrayBuffer());attempt.download_ms=Number((clock()-downloadStarted).toFixed(1));attempt.size=bytes.length;attempt.size_match=bytes.length===expectedSize;if(attempt.size_match){const hashStarted=clock();attempt.sha256=await hashBytes(bytes);attempt.sha_ms=Number((clock()-hashStarted).toFixed(1));attempt.sha_match=attempt.sha256===expectedHash;}if(attempt.sha_match&&!settled){settled=true;attempt.result='PASS';attempts.push(attempt);controllers.forEach((controller,i)=>{if(i!==index)controller.abort();});resolve({verified:true,bytes,gateway,httpStatus:response.status,attempts});return;}}
        attempt.result=response.ok?'INTEGRITY_PENDING':`HTTP_${response.status}`;
      }catch(error){attempt.timeout=error?.name==='AbortError';attempt.result=attempt.timeout?'TIMEOUT':'NETWORK_ERROR';}
      finally{clearTimeout(timer);if(!attempts.includes(attempt))attempts.push(attempt);remaining-=1;if(!remaining&&!settled){settled=true;resolve({verified:false,attempts});}}
    });
  });
  return result;
}
