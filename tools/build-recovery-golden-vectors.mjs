import { createHash, webcrypto } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

let counter=0;
const fixtureCrypto={
  subtle:webcrypto.subtle,
  randomUUID:()=>`00000000-0000-4000-8000-${String(++counter).padStart(12,'0')}`,
  getRandomValues(target){
    for(let i=0;i<target.length;i++)target[i]=(counter*37+i*17+11)&255;
    counter+=1;
    return target;
  }
};
Object.defineProperty(globalThis,'crypto',{value:fixtureCrypto,configurable:true});

const { createVaultArtifacts }=await import('../src/ui/vault-pipeline.js');
const { cryptoEngine }=await import('../src/crypto/crypto-engine.js');
const output='tests/fixtures/recovery-golden';
const testPassword='LEGAVIK-NON-CUSTOMER-GOLDEN-ONLY-2026';

function schema2(){return{schema_version:2,vault_title:'Golden Recovery Map Schema 2',plan_type:'compatibility-fixture',reviewed_at:'2026-09-13T00:00:00.000Z',standard_modules:[['assets-accounts',10],['recovery-conditions',20],['locations-finding',30],['contacts-assistance',40],['recovery-order-exceptions',50],['evidence-messages',60]].map(([id,order])=>({id,order})),custom_modules:[],assets:[{id:'golden-asset-v2',type:'test',label:'Synthetic asset',exists:true,platform_hint:'non-customer',condition_refs:['golden-condition-v2'],location_refs:['golden-location-v2'],contact_refs:[],step_refs:['golden-step-v2'],attachment_refs:['golden-attachment-v2'],custom_field_refs:[]}],recovery_conditions:[{id:'golden-condition-v2',type:'fixture',exists:true,asset_refs:['golden-asset-v2'],location_refs:['golden-location-v2'],fallback_path_refs:[],notes:'',custom_field_refs:[]}],fallback_paths:[],locations:[{id:'golden-location-v2',label:'Synthetic location',type:'test',finding_instructions:'Fixture only',access_prerequisites:[],attachment_refs:['golden-attachment-v2'],custom_field_refs:[]}],assistance:{needed:false},contacts:[],recovery_steps:[{id:'golden-step-v2',sequence:1,risk_level:'low',action:'Verify fixture',completion_check:'Verified',failure_action:'Stop',stop_condition:'Mismatch',asset_refs:['golden-asset-v2'],condition_refs:['golden-condition-v2'],location_refs:['golden-location-v2'],contact_refs:[],warning_refs:[],attachment_refs:['golden-attachment-v2']}],warnings:[],attachments:[],personal_message:null,custom_fields:[]};}

async function vector({id,knowledgeGraph,attachmentId,attachmentBytes,wizardConfigVersion}){
  if(attachmentId){const item=knowledgeGraph.attachments.find(value=>value.id===attachmentId);item.sha256=await cryptoEngine.hashHex(attachmentBytes);if(knowledgeGraph.schema_version===1)item.size=attachmentBytes.length;else item.byte_length=attachmentBytes.length;}
  counter=0;
  const artifacts=await createVaultArtifacts({knowledgeGraph,attachmentPayloads:attachmentId?{[attachmentId]:attachmentBytes}:{},password:testPassword,wizardConfigVersion,vaultId:`golden-vault-${id}`,snapshotId:`golden-snapshot-${id}`,createdAt:'2026-09-13T00:00:00.000Z'});
  const txid=createHash('sha256').update(id).digest('base64url').slice(0,43);
  const evidence={status:'MAINNET_VERIFIED',network:'Arweave Mainnet',format_version:'CJAS-VAULT-ARCHIVE-V1',txid,archive_filename:artifacts.archiveName,archive_size:artifacts.archiveBytes.length,archive_sha256:artifacts.ciphertextSha256,recovery_kit_identifier:artifacts.snapshot.snapshot_id};
  const expected={vector_id:id,technical_format:{recovery_kit_version:1,archive_version:1,snapshot_version:1,knowledge_map_schema_version:knowledgeGraph.schema_version},expected_snapshot_payload_sha256:artifacts.snapshot.integrity.snapshot_payload_sha256,expected_knowledge_sha256:artifacts.snapshot.integrity.knowledge_sha256,expected_attachment_count:knowledgeGraph.attachments.length,expected_attachment_sha256:knowledgeGraph.attachments.map(item=>({id:item.id,sha256:item.sha256})),archive_sha256:artifacts.ciphertextSha256,archive_size:artifacts.archiveBytes.length};
  const dir=path.join(output,id);await mkdir(dir,{recursive:true});
  await Promise.all([
    writeFile(path.join(dir,'Recovery-Kit.cjas'),artifacts.kitBytes),
    writeFile(path.join(dir,'Mainnet-Recovery-Evidence.json'),JSON.stringify(evidence,null,2)+'\n'),
    writeFile(path.join(dir,'Encrypted-Archive.cjasvault'),artifacts.archiveBytes),
    writeFile(path.join(dir,'test-password.txt'),testPassword+'\n'),
    writeFile(path.join(dir,'expected.json'),JSON.stringify(expected,null,2)+'\n')
  ]);
  return expected;
}

const schema1=JSON.parse(await readFile('tests/fixtures/knowledge-valid.json','utf8'));
const bytes1=new TextEncoder().encode('非客户测试附件');
const map2=schema2(),bytes2=new TextEncoder().encode('non-customer golden attachment');
map2.attachments=[{id:'golden-attachment-v2',display_name:'golden.txt',media_type:'text/plain',byte_length:bytes2.length,sha256:await cryptoEngine.hashHex(bytes2),module_refs:['locations-finding'],owner_entity_refs:['golden-asset-v2'],purpose:'Compatibility fixture',sensitive_acknowledged:true}];
const results=[];
results.push(await vector({id:'technical-format-1-knowledge-schema-1',knowledgeGraph:schema1,attachmentId:'attachment-guide-1',attachmentBytes:bytes1,wizardConfigVersion:1}));
results.push(await vector({id:'technical-format-1-knowledge-schema-2',knowledgeGraph:map2,attachmentId:'golden-attachment-v2',attachmentBytes:bytes2,wizardConfigVersion:5}));
await writeFile(path.join(output,'manifest.json'),JSON.stringify({fixture_classification:'NON_CUSTOMER_GOLDEN_VECTOR',generated_by:'tools/build-recovery-golden-vectors.mjs',vectors:results.map(value=>value.vector_id)},null,2)+'\n');
console.log(JSON.stringify({vectors:results.map(value=>value.vector_id)}));
