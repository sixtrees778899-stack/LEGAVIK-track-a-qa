import { validatePlanCatalog, selectRecoveryPlan } from '../src/wizard/plan-selector.js';
import { buildWizardConfiguration } from '../src/wizard/config-loader.js';
import { classifyAttachment, assertAttachmentAllowed, attachmentCapacity } from '../src/ui/attachment-policy.js';
import { canTriggerWithEnter } from '../src/ui/keyboard-policy.js';
import { LocalVersionHistory } from '../src/ui/version-history.js';
const result=document.querySelector('#result');
try{
  const get=path=>fetch(path).then(response=>response.json()),[catalog,policy,guidance,content]=await Promise.all([get('../config/plans/v1.json'),get('../config/attachments/v1.json'),get('../config/guidance/zh-CN-v1.json'),get('../config/content/zh-CN.json')]);
  const names=['wallet-assets','exchange-custody','digital-accounts','business-systems','devices-locations','contacts-assistance','recovery-orders-warnings'],templates=await Promise.all(names.map(name=>get(`../config/templates/${name}.json`)));
  validatePlanCatalog(catalog);if(catalog.plans.length!==4||catalog.default_plan_id!=='crypto-assets'||guidance.content_version!==1)throw new Error('configuration');
  for(const plan of catalog.plans){const selected=selectRecoveryPlan(catalog,plan.id,names),configuration=buildWizardConfiguration({config_version:2,flow_id:`browser-${plan.id}`,modules:selected.modules.map((template,index)=>({template,enabled:true,order:index}))},templates,content);if(!configuration.modules.length)throw new Error(`plan ${plan.id}`);}
  for(const file of [{name:'a.pdf',type:'application/pdf',size:10},{name:'a.png',type:'image/png',size:10},{name:'a.mp3',type:'audio/mpeg',size:10},{name:'a.mp4',type:'video/mp4',size:10}]){assertAttachmentAllowed(file,[],policy);if(!classifyAttachment(file,policy))throw new Error(`media ${file.name}`);}
  if(attachmentCapacity([{size:1024}],policy).remaining_bytes!==policy.limits.max_version_bytes-1024)throw new Error('capacity');
  if(canTriggerWithEnter('create-artifacts')||!canTriggerWithEnter('wizard-next'))throw new Error('keyboard policy');
  const history=new LocalVersionHistory();history.add({version:1,snapshotId:'v1',createdAt:'2026-08-01',summary:'one',kitName:'k1',archiveName:'a1'});history.add({version:2,snapshotId:'v2',createdAt:'2026-08-02',summary:'two',kitName:'k2',archiveName:'a2'});if(history.list().length!==2)throw new Error('history');
  result.dataset.status='PASS';result.textContent=`PASS · 4 plans · guidance v${guidance.content_version} · media/capacity/keyboard/history · ${navigator.userAgent}`;
}catch(error){result.dataset.status='FAIL';result.textContent=`FAIL · ${error.message}`;}
