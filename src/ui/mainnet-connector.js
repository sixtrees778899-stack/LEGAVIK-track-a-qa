import {cryptoEngine} from '../crypto/crypto-engine.js';
import {uploadSignedTransaction} from '../../tools/ar-unified-multi-file-mainnet-pilot/pilot-core.js';
import {verifyGatewaysParallel} from '../../tools/ar-generic-file-mainnet-pilot/gateway-verifier.js';
import {MAINNET_STAGES,MainnetFlowError,normalizeMainnetError,assertFeeWithinConfirmation} from './mainnet-stability.js';

export const MAINNET_NETWORK='Arweave Mainnet';
export const MAINNET_GATEWAYS=Object.freeze(['https://arweave.net','https://ardrive.net']);
export const MAINNET_FAST_RETRY_DELAYS_MS=Object.freeze([0,750,1500,2500,3000,4000,5000]);

export function createMainnetEvidence({artifacts,sourceSize,sourceSha256}){
  return{status:'LOCAL_ENCRYPTION_PASS',network:MAINNET_NETWORK,broadcasts:0,cost_ar:0,source_filename:'LEGAVIK Recovery Map',source_mime:'application/vnd.cjas.snapshot+json',source_size:sourceSize,source_sha256:sourceSha256,archive_filename:artifacts.archiveName,archive_size:artifacts.archiveBytes.length,archive_sha256:artifacts.ciphertextSha256,recovery_kit_identifier:artifacts.snapshot.snapshot_id,format_version:'CJAS-VAULT-ARCHIVE-V1',txid:null};
}

export function assertKitEvidencePair({kit,evidence}){
  if(!kit?.snapshot_id||kit.snapshot_id!==evidence?.recovery_kit_identifier)throw new Error('这两份恢复材料不属于同一次创建，请选择对应的一组文件。');
  return true;
}

export function validateMainnetEvidence(value){
  if(!value||value.network!==MAINNET_NETWORK||typeof value.txid!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(value.txid)||!Number.isSafeInteger(value.archive_size)||value.archive_size<=0||!/^[a-f0-9]{64}$/.test(value.archive_sha256)||typeof value.recovery_kit_identifier!=='string'||!value.recovery_kit_identifier)throw new Error('Mainnet Recovery Evidence文件不完整或无法识别。');
  return value;
}

export async function connectMainnetWallet({wallet=globalThis.arweaveWallet,operationId=null}){
  if(!wallet)throw new MainnetFlowError('当前浏览器未检测到钱包 Provider。',{stage:MAINNET_STAGES.WALLET_DETECTED,code:'WALLET_PROVIDER_UNAVAILABLE',operationId});
  try{
    let permissions;try{permissions=await wallet.getPermissions();}catch(error){throw normalizeMainnetError(error,{stage:MAINNET_STAGES.WALLET_CONNECTED,operationId,path:'wallet.getPermissions'});}
    if(!permissions.includes('ACCESS_ADDRESS'))await wallet.connect(['ACCESS_ADDRESS'],{name:'SKREK Mainnet Experience Test'});
    const address=await wallet.getActiveAddress();if(!address)throw new MainnetFlowError('无法读取当前钱包地址。请确认钱包已解锁。',{stage:MAINNET_STAGES.WALLET_CONNECTED,code:'WALLET_ADDRESS_UNAVAILABLE',operationId});
    return{wallet,address,permissions:await wallet.getPermissions()};
  }catch(error){throw normalizeMainnetError(error,{stage:error?.stage??MAINNET_STAGES.WALLET_CONNECTED,operationId});}
}

export async function quoteMainnetArchive({archiveBytes,wallet=globalThis.arweaveWallet,walletAddress=null,fetchImpl=fetch,timeoutMs=12000,operationId=null}){
  if(!wallet)throw new MainnetFlowError('当前浏览器未检测到钱包 Provider。',{stage:MAINNET_STAGES.WALLET_PROVIDER,code:'WALLET_PROVIDER_UNAVAILABLE',operationId});
  try{
    const address=walletAddress??(await connectMainnetWallet({wallet,operationId})).address;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs),started=performance.now();let price,balance;
    try{[price,balance]=await Promise.all([fetchImpl(`https://arweave.net/price/${archiveBytes.length}`,{cache:'no-store',signal:controller.signal}),fetchImpl(`https://arweave.net/wallet/${address}/balance`,{cache:'no-store',signal:controller.signal})]);}catch(error){if(error?.name==='AbortError')throw new MainnetFlowError('Mainnet报价请求超时，请重试。',{stage:MAINNET_STAGES.QUOTE,code:'QUOTE_TIMEOUT',cause:error,operationId});throw normalizeMainnetError(error,{stage:MAINNET_STAGES.QUOTE,operationId});}finally{clearTimeout(timer);}
    if(!price.ok)throw new MainnetFlowError(`Mainnet报价读取失败（HTTP ${price.status}）。`,{stage:MAINNET_STAGES.QUOTE,code:'QUOTE_HTTP_FAILED',operationId,details:{http_status:price.status}});
    if(!balance.ok)throw new MainnetFlowError(`钱包余额读取失败（HTTP ${balance.status}）。`,{stage:MAINNET_STAGES.BALANCE,code:'BALANCE_HTTP_FAILED',operationId,details:{http_status:balance.status}});
    const quoteAR=Number(await price.text())/1e12,balanceAR=Number(await balance.text())/1e12;
    if(!Number.isFinite(quoteAR)||quoteAR<0)throw new MainnetFlowError('Mainnet报价返回无效。',{stage:MAINNET_STAGES.QUOTE,code:'QUOTE_INVALID',operationId});
    if(!Number.isFinite(balanceAR))throw new MainnetFlowError('钱包余额返回无效。',{stage:MAINNET_STAGES.BALANCE,code:'BALANCE_INVALID',operationId});
    if(balanceAR<quoteAR)throw new MainnetFlowError('当前钱包 AR 余额不足，未进入签名。',{stage:MAINNET_STAGES.BALANCE,code:'BALANCE_INSUFFICIENT',operationId,details:{quote_ar:quoteAR,balance_ar:balanceAR}});
    return{wallet_public_address:address,quote_ar:quoteAR,balance_before_ar:balanceAR,projected_balance_ar:balanceAR-quoteAR,quote_request_ms:Number((performance.now()-started).toFixed(1))};
  }catch(error){throw normalizeMainnetError(error,{stage:error?.stage??MAINNET_STAGES.QUOTE,operationId});}
}

export async function broadcastMainnetArchive({artifacts,evidence,arweave,wallet=globalThis.arweaveWallet,onProgress=()=>{},signedTransaction=null,onTransactionSigned=()=>{},confirmedQuote=null,operationId=null}){
  if(evidence.txid||evidence.broadcasts)throw new Error('当前恢复版本已广播，禁止重复交易。');
  if(await cryptoEngine.hashHex(artifacts.archiveBytes)!==evidence.archive_sha256)throw new Error('Archive完整性已变化，禁止签名。');
  let tx=signedTransaction,signatureMs=0;if(tx&&typeof tx.addTag!=='function'&&typeof arweave?.transactions?.fromRaw==='function')tx=arweave.transactions.fromRaw(tx);let actualFee=Number(tx?.reward??0)/1e12;
  if(!tx){
    if(!wallet)throw new Error('当前浏览器未检测到钱包 Provider。');
    let permissions;try{permissions=await wallet.getPermissions();}catch(error){throw normalizeMainnetError(error,{stage:MAINNET_STAGES.WALLET_CONNECT,operationId,path:'wallet.getPermissions'});}if(!permissions.includes('SIGN_TRANSACTION'))await wallet.connect(['ACCESS_ADDRESS','SIGN_TRANSACTION'],{name:'SKREK Mainnet Experience Test'});
    tx=await arweave.createTransaction({data:artifacts.archiveBytes});tx.addTag('Content-Type','application/octet-stream');tx.addTag('App-Name','SKREK-Recovery-Map-V3');tx.addTag('Format','CJAS-Vault-Archive-V1');
    actualFee=Number(tx.reward)/1e12;if(!Number.isFinite(actualFee)||actualFee<0||actualFee>evidence.balance_before_ar)throw new MainnetFlowError('无法确认本次Mainnet交易费用，未签名。',{stage:MAINNET_STAGES.SIGNATURE,code:'TRANSACTION_FEE_INVALID',operationId});if(confirmedQuote)assertFeeWithinConfirmation({quotedAR:confirmedQuote.quote_ar,actualAR:actualFee});
    const signStarted=performance.now();await arweave.transactions.sign(tx);signatureMs=Number((performance.now()-signStarted).toFixed(1));await onTransactionSigned(tx);
  }
  const uploaded=await uploadSignedTransaction({arweave,transaction:tx,onProgress});
  return{txid:uploaded.txid,broadcasts:1,cost_ar:actualFee,actual_fee_ar:actualFee,signature_wait_ms:signatureMs,broadcast_to_txid_ms:uploaded.upload_ms,upload_strategy:uploaded.upload_strategy,upload_chunk_count:uploaded.chunk_count,upload_chunk_timings:uploaded.chunks,upload_performance:uploaded.performance,broadcasted_at:new Date().toISOString()};
}

export async function reconcileMainnetTransaction({txid,fetchImpl=fetch,timeoutMs=12000,operationId=null}){
  if(!/^[-_A-Za-z0-9]{43}$/.test(txid??''))throw new MainnetFlowError('无法核对未完成交易：TxID无效。',{stage:MAINNET_STAGES.TX_RECONCILIATION,code:'TXID_INVALID',transactionId:txid,operationId});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{const response=await fetchImpl(`https://arweave.net/tx/${txid}/status`,{cache:'no-store',signal:controller.signal});if(response.status===200){const value=await response.json().catch(()=>({}));return{state:'CONFIRMED',txid,confirmations:Number(value.number_of_confirmations??0)};}if(response.status===202)return{state:'PENDING',txid};if(response.status===404)return{state:'NOT_FOUND',txid};throw new MainnetFlowError(`交易状态查询失败（HTTP ${response.status}）。`,{stage:MAINNET_STAGES.TX_RECONCILIATION,code:'TX_RECONCILIATION_HTTP_FAILED',transactionId:txid,operationId});}catch(error){if(error?.name==='AbortError')throw new MainnetFlowError('交易状态查询超时。',{stage:MAINNET_STAGES.TX_RECONCILIATION,code:'TX_RECONCILIATION_TIMEOUT',transactionId:txid,operationId});throw normalizeMainnetError(error,{stage:MAINNET_STAGES.TX_RECONCILIATION,transactionId:txid,operationId});}finally{clearTimeout(timer);}
}

export async function verifyMainnetArchive({evidence,gateways=MAINNET_GATEWAYS,timeoutMs=12000,connectionTimeoutMs=timeoutMs,bodyTimeoutMs,preferredGateway=evidence?.download_gateway??null,fetchImpl=fetch}){
  return verifyGatewaysParallel({gateways,txid:evidence.txid,expectedSize:evidence.archive_size,expectedHash:evidence.archive_sha256,hashBytes:bytes=>cryptoEngine.hashHex(bytes),connectionTimeoutMs,bodyTimeoutMs,preferredGateway,fetchImpl});
}

export async function verifyMainnetArchiveWithRetry({evidence,gateways=MAINNET_GATEWAYS,retryDelaysMs=MAINNET_FAST_RETRY_DELAYS_MS,connectionTimeoutMs=12000,bodyTimeoutMs,fetchImpl=fetch,onAttempt=()=>{},sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
  const attempts=[];
  for(let round=0;round<retryDelaysMs.length;round++){
    const delay=retryDelaysMs[round];if(delay)await sleep(delay);
    const result=await verifyMainnetArchive({evidence,gateways,connectionTimeoutMs,bodyTimeoutMs,preferredGateway:evidence?.download_gateway??null,fetchImpl});
    const roundAttempts=result.attempts.map(item=>({...item,round:round+1}));attempts.push(...roundAttempts);onAttempt({round:round+1,delay_ms:delay,verified:result.verified,attempts:roundAttempts});
    if(result.verified)return{...result,attempts};
  }
  return{verified:false,attempts};
}
