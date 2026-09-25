import {MAINNET_STAGES} from './mainnet-stability.js';

export const PUBLISH_LEAVE_WARNING='正在安全存储，请不要关闭、刷新或返回当前页面，直到系统提示创建完成。';

export function publishMaterialsReady(operation,evidence){
  return operation?.state===MAINNET_STAGES.COMPLETE&&operation?.status===MAINNET_STAGES.COMPLETE&&evidence?.status==='READY_FOR_INDEPENDENT_RECOVERY'&&evidence?.background_verification==='PASS';
}

export function publishCommitmentPending({locked=false,signedTransaction=null,transactionId=null,evidence=null}={}){
  return Boolean(locked||signedTransaction||transactionId||evidence?.txid);
}
