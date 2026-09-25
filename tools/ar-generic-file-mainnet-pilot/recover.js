import {cryptoEngine} from '../../src/crypto/crypto-engine.js';
import {Pbkdf2Provider} from '../../src/crypto/kdf-provider.js';
import {recoveryKitBuilder} from '../../src/recovery-kit/recovery-kit-builder.js';
import {decodeGenericArchive,genericArchiveAad} from './generic-archive.js?v=final-whitelist-v2';
import {createFileDelivery} from './recovery-delivery.js';
import {verifyGatewaysParallel} from './gateway-verifier.js';

const GATEWAYS=['https://arweave.net','https://ardrive.net'];
const MAX_PROPAGATION_WAIT_MS=120000;
const state={delivery:null};
const $=selector=>document.querySelector(selector);
const elapsed=start=>Number((performance.now()-start).toFixed(1));
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const stage=text=>{const li=document.createElement('li');li.textContent=text;$('#stages').appendChild(li);};

async function fetchVerifiedArchive(evidence){
  const totalStart=performance.now(),attempts=[];let round=0;
  while(performance.now()-totalStart<MAX_PROPAGATION_WAIT_MS){
    round+=1;const result=await verifyGatewaysParallel({gateways:GATEWAYS,txid:evidence.txid,expectedSize:evidence.archive_size,expectedHash:evidence.archive_sha256,hashBytes:bytes=>cryptoEngine.hashHex(bytes),timeoutMs:12000});
    attempts.push(...result.attempts.map(item=>({...item,round})));
    if(result.verified){const winning=result.attempts.find(item=>item.result==='PASS');return{bytes:result.bytes,sha256:evidence.archive_sha256,gateway:result.gateway,httpStatus:result.httpStatus,responseMs:winning?.response_ms??null,bodyMs:winning?.download_ms??null,hashMs:winning?.sha_ms??null,totalMs:elapsed(totalStart),attempts};}
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
  const error=new Error('交易已广播，Mainnet仍在传播。请稍后使用同一组恢复材料重试，无需重新上传。');error.attempts=attempts;throw error;
}

async function recover(){
  const evidenceFile=$('#evidence-file').files[0],kitFile=$('#kit-file').files[0];let password=$('#password').value;
  if(!evidenceFile||!kitFile||!password)throw new Error('请选择 Mainnet Recovery Evidence 和 Recovery Kit，并输入 Recovery Password。');
  $('#stages').textContent='';$('#success').hidden=true;const totalStart=performance.now(),timings={};
  try{
    stage('正在读取 Mainnet Recovery Evidence');const evidenceStart=performance.now();let evidenceText;
    try{evidenceText=await evidenceFile.text();}catch{throw new Error('无法读取所选 Mainnet Recovery Evidence。文件可能已被移动或删除，请重新选择。');}
    const parseStart=performance.now();let evidence;try{evidence=JSON.parse(evidenceText);}catch{throw new Error('所选文件不是可识别的 Mainnet Recovery Evidence JSON。');}
    timings.evidence_read_ms=Number((performance.now()-evidenceStart).toFixed(1));timings.evidence_parse_ms=elapsed(parseStart);
    const txidStart=performance.now();
    if(evidence.network!=='Arweave Mainnet'||typeof evidence.txid!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(evidence.txid)||!Number.isSafeInteger(evidence.archive_size)||!/^[a-f0-9]{64}$/.test(evidence.archive_sha256)||typeof evidence.recovery_kit_identifier!=='string')throw new Error('Mainnet Recovery Evidence 文件不完整或无法识别。');
    timings.txid_extract_ms=elapsed(txidStart);
    const kitReadStart=performance.now();let kitBytes;try{kitBytes=new Uint8Array(await kitFile.arrayBuffer());}catch{throw new Error('无法读取所选 Recovery Kit。文件可能已被移动或删除，请重新选择。');}
    const kitParseStart=performance.now();let kit;try{kit=recoveryKitBuilder.parseKit(kitBytes);}catch{throw new Error('Recovery Kit 文件类型或内部结构不正确。');}
    timings.kit_read_ms=Number((performance.now()-kitReadStart).toFixed(1));timings.kit_parse_ms=elapsed(kitParseStart);
    if(kit.snapshot_id!==evidence.recovery_kit_identifier)throw new Error('这两份恢复材料不属于同一次创建，请选择对应的一组文件。');
    if(evidence.status==='BROADCAST_ACCEPTED')stage('交易已广播，Mainnet仍在传播。CJAS正在从多个网关获取完整加密文件。');
    stage('正在并行连接 Arweave Mainnet 网关并下载加密档案');const downloaded=await fetchVerifiedArchive(evidence),archiveBytes=downloaded.bytes;
    timings.gateway_response_ms=downloaded.responseMs;timings.archive_download_ms=downloaded.bodyMs;timings.gateway_total_ms=downloaded.totalMs;timings.archive_hash_ms=downloaded.hashMs;
    const parsed=decodeGenericArchive(archiveBytes);
    stage('正在解锁 Recovery Kit');const unlockStart=performance.now(),key=await recoveryKitBuilder.unwrapKit({kitBytes,password,kdfProvider:new Pbkdf2Provider(),expectedSnapshotId:kit.snapshot_id,expectedCiphertextSha256:downloaded.sha256});timings.kdf_and_kit_unlock_ms=elapsed(unlockStart);
    try{
      stage('正在浏览器本地解密');const decryptStart=performance.now(),bytes=await cryptoEngine.decryptSnapshot({algorithm:'AES-256-GCM',nonce:parsed.nonce,aad:parsed.aad,ciphertext:parsed.ciphertext},{dataKey:key,expectedAad:genericArchiveAad()});timings.decrypt_ms=elapsed(decryptStart);
      const recoveredHashStart=performance.now(),sha256=await cryptoEngine.hashHex(bytes);timings.recovered_hash_ms=elapsed(recoveredHashStart);
      if(bytes.length!==parsed.originalSize||sha256!==hex(parsed.originalSha256Bytes))throw new Error('恢复文件完整性校验失败。');
      stage('正在生成恢复文件');const exportStart=performance.now();state.delivery=createFileDelivery({bytes,filename:parsed.filename,mimeType:parsed.mimeType});timings.file_export_ms=elapsed(exportStart);timings.total_recovery_ms=elapsed(totalStart);
      const result={status:'PASS',network:'Arweave Mainnet',txid:evidence.txid,gateway:downloaded.gateway,http_status:downloaded.httpStatus,filename:parsed.filename,mime:parsed.mimeType,size:bytes.length,sha256,sha256_match:sha256===evidence.source_sha256,byte_match:bytes.length===evidence.source_size,timings_ms:timings,gateway_attempts:downloaded.attempts,broadcasts:0,cost_ar:0};
      $('#result').textContent=`${parsed.filename} · ${parsed.mimeType} · ${bytes.length.toLocaleString('en-AU')} bytes · 完整性已验证`;$('#recovery-evidence').textContent=JSON.stringify(result,null,2);$('#success').hidden=false;state.delivery.download();$('#status').textContent='恢复完成。若自动下载被阻止，请点击“下载恢复文件”。';
    }finally{cryptoEngine.wipeSensitiveReference(key);}
  }finally{password='';$('#password').value='';}
}
async function run(fn){try{$('#status').textContent='处理中……';await fn();}catch(error){$('#status').textContent=error.message;}}
$('#recover').onclick=()=>run(recover);
$('#download').onclick=()=>run(()=>state.delivery?state.delivery.download():Promise.reject(new Error('尚无恢复文件。')));
$('#download-again').onclick=$('#download').onclick;
