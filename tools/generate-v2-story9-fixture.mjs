import { writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../src/product-v2/model.js';
import { ProductActions } from '../src/product-v2/actions.js';
import { addAttachment } from '../src/product-v2/attachment-manager.js';
import { validateProductStore } from '../src/product-v2/validator.js';
import { mapProductToKnowledgeV2,attachmentPayloads } from '../src/product-v2/snapshot-mapper.js';
import { createVaultArtifacts } from '../src/ui/vault-pipeline.js';

const root=new URL('../',import.meta.url),load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8')),templates=await load('config/recovery-map/v2/platform-templates-v2.json'),rules=await load('config/recovery-map/v2/living-rules-v2.json'),clock=()=> '2026-08-04T00:00:00.000Z',password='River-Lantern-27-Mango',bytes=new TextEncoder().encode('CJAS Story 9 attachment');
let store=createRecoveryMapDraft({draftId:'story-9',title:'双平台恢复地图',clock});
for(const[id,platform,label]of[['okx-main','okx','主账户'],['binance-au','binance','澳洲账户']]){
  store=ProductActions.addAccount(store,{account_id:id,platform_id:platform,platform_name:platform==='okx'?'OKX':'Binance',region:'Australia',account_type:'Personal',display_label:label},{expected_revision:store.draft_revision,clock});
  store=ProductActions.setConditionSelection(store,id,{selected_condition_ids:['email']},{expected_revision:store.draft_revision,clock});
  store=ProductActions.upsertCoverage(store,{coverage_id:`coverage-${id}`,account_id:id,mode:'ITEMIZED',covered_condition_ids:['email'],location_type:'保管资料',location_name:'家庭保险柜',description:'按脱敏索引查找',attachment_ids:[]},{expected_revision:store.draft_revision,clock});
  let next=ProductActions.updateInstruction(store,id,{instruction_text:'从官方入口恢复，核对账户与接收地址后安全转移。',optional_risk_notes:'地址不符或安全限制未解除时立即停止。'},{expected_revision:store.draft_revision,clock});store=ProductActions.confirmInstructionSaved(next,id,{expected_revision:next.draft_revision,clock});
  const attachmentId=`file-${id}`;store=await addAttachment(store,{attachment_id:attachmentId,file_name:`${label}-位置说明.txt`,mime_type:'text/plain',byte_length:bytes.byteLength,bytes,module_id:'locations',platform_id:platform,account_id:id,field_or_condition_id:'email',purpose:'位置说明',covered_condition_ids:['email']},{rules,clock});
}
const receipt=validateProductStore(store,{platformTemplates:templates,rules}),knowledge=mapProductToKnowledgeV2(store,receipt,{platformTemplates:templates,reviewedAt:clock()}),artifacts=await createVaultArtifacts({knowledgeGraph:knowledge,attachmentPayloads:attachmentPayloads(store),password,wizardConfigVersion:2,vaultId:'story-9-vault',snapshotId:'story-9-snapshot',createdAt:clock()});
await writeFile('/tmp/CJAS-Story9-Recovery-Kit.cjas',artifacts.kitBytes);
await writeFile('/tmp/CJAS-Story9-Archive.cjasvault',artifacts.archiveBytes);
process.stdout.write(JSON.stringify({password,accounts:Object.keys(store.accounts).length,attachments:Object.keys(store.attachments).length,kit:'/tmp/CJAS-Story9-Recovery-Kit.cjas',archive:'/tmp/CJAS-Story9-Archive.cjasvault'}));
