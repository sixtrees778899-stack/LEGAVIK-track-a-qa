export const RECOVERY_PATH='/web/recover.html';

export function recoveryUrl(source,{pathname=globalThis.location?.pathname??RECOVERY_PATH}={}){
  const value=String(source??'').trim();
  const webIndex=pathname.indexOf('/web/');
  const recoveryPath=webIndex>=0?`${pathname.slice(0,webIndex)}/web/recover.html`:RECOVERY_PATH;
  return value?`${recoveryPath}?source=${encodeURIComponent(value)}`:recoveryPath;
}
