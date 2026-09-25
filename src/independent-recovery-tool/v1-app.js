import { recoverVaultArtifacts } from '../ui/vault-pipeline.js';
import { recoveryKitBuilder } from '../recovery-kit/recovery-kit-builder.js';
import { assertKitEvidencePair, validateMainnetEvidence, verifyMainnetArchive } from '../ui/mainnet-connector.js';
import { renderRecoveryMap } from '../../web/map-view.js';

const TOOL_VERSION='1.0.0';
const app=document.querySelector('#app');
const stages=['读取恢复材料','获取加密资料','验证资料完整性','解密 Recovery Map','恢复附件','恢复完成'];
let recoveryInFlight=false;

document.documentElement.dataset.independentRecoveryToolVersion=TOOL_VERSION;
app.innerHTML=`<section class="tool-intro"><p class="eyebrow">LEGAVIK INDEPENDENT RECOVERY TOOL V1</p><h1>独立恢复 Recovery Map</h1><p>本工具不需要 LEGAVIK 账户、客户中心或 Supabase。请选择同一次创建的恢复凭证套件，并在本地输入 Recovery Password。</p></section><section class="card recovery-entry"><div class="field"><label for="evidence">Mainnet Recovery Evidence</label><input id="evidence" type="file" accept=".json,application/json"></div><div class="field"><label for="kit">Recovery Kit</label><input id="kit" type="file" accept=".cjas,application/octet-stream"></div><div class="field"><label for="password">Recovery Password</label><input id="password" type="password" autocomplete="off"></div><button id="recover">开始独立恢复</button><div id="message" role="status" aria-live="polite"></div></section><section class="card recovery-progress-card" hidden><h2>恢复进度</h2><ol id="recovery-stages"></ol></section><div id="result"></div>`;

const recoverButton=document.querySelector('#recover');
const progressCard=document.querySelector('.recovery-progress-card');
function stage(active){progressCard.hidden=active<0;document.querySelector('#recovery-stages').innerHTML=stages.map((label,index)=>`<li class="${index<active?'done':index===active?'active':''}"><span>${String(index+1).padStart(2,'0')}</span><strong>${label}</strong></li>`).join('');}
function setRecovering(value){recoveryInFlight=value;recoverButton.disabled=value;recoverButton.setAttribute('aria-busy',String(value));recoverButton.textContent=value?'正在恢复…':'开始独立恢复';}
function customerError(error){if(error?.code==='KIT_UNLOCK_FAILED'||/Recovery Password is incorrect or Kit is damaged/i.test(String(error?.message??'')))return'恢复密码不正确，或所选恢复材料不匹配，请检查后重试。';return error?.message??'恢复未完成，请检查所选恢复材料后重试。';}
function renderRecovered(snapshot){const result=document.querySelector('#result'),outputHash=snapshot.integrity.snapshot_payload_sha256;document.querySelector('.recovery-entry').hidden=true;result.innerHTML=`<section class="card recovery-complete"><p class="eyebrow">RECOVERY COMPLETE</p><h2>你的 Recovery Map 已成功恢复</h2><p>资料已完成验证、解密和附件恢复。</p><p class="verification-result">恢复结果精确匹配：PASS<br><small>Snapshot SHA-256：${outputHash}</small></p><button id="enter-recovery-map">进入 Recovery Map</button></section><div id="recovered-map" hidden></div>`;document.querySelector('#enter-recovery-map').onclick=()=>{const map=result.querySelector('#recovered-map');map.hidden=false;renderRecoveryMap(map,snapshot,{allowAttachmentDownloads:true});map.querySelectorAll('[data-recovery-guide-action]').forEach((link)=>link.remove());map.querySelectorAll('.recovery-guide-actions').forEach((group)=>{if(!group.children.length)group.remove();});result.querySelector('.recovery-complete').hidden=true;progressCard.hidden=true;map.scrollIntoView({behavior:'auto',block:'start'});};}

recoverButton.onclick=async()=>{
  if(recoveryInFlight)return;
  const message=document.querySelector('#message'),result=document.querySelector('#result'),evidenceFile=document.querySelector('#evidence').files[0],kitFile=document.querySelector('#kit').files[0];let password=document.querySelector('#password').value;
  message.textContent='';result.textContent='';
  if(!evidenceFile||!kitFile||!password){message.className='error';message.textContent='请选择 Mainnet Recovery Evidence、Recovery Kit 并输入 Recovery Password。';return;}
  setRecovering(true);
  try{
    stage(0);const evidence=validateMainnetEvidence(JSON.parse(await evidenceFile.text())),kitBytes=new Uint8Array(await kitFile.arrayBuffer()),kit=recoveryKitBuilder.parseKit(kitBytes);assertKitEvidencePair({kit,evidence});
    stage(1);const downloaded=await verifyMainnetArchive({evidence});if(!downloaded.verified)throw new Error('Mainnet 中的加密恢复版本尚未完整可用，请稍后重试。');
    stage(2);const archiveBytes=downloaded.bytes;if(archiveBytes.length!==evidence.archive_size)throw new Error('Mainnet Archive 大小校验失败。');
    stage(3);const recovered=await recoverVaultArtifacts({kitBytes,archiveBytes,password});if(evidence.source_sha256&&recovered.snapshot.integrity.snapshot_payload_sha256!==evidence.source_sha256)throw new Error('恢复结果与创建时记录的 Snapshot SHA-256 不一致。');stage(4);renderRecovered(recovered.snapshot);stage(5);message.className='success';message.textContent='恢复成功。Recovery Map、恢复结果哈希与全部附件完整性验证通过。';
  }catch(error){stage(-1);message.className='error';message.textContent=customerError(error);setRecovering(false);}
  finally{password='';document.querySelector('#password').value='';}
};
stage(-1);
