import { buildSnapshot } from '../src/snapshot/snapshot-builder.js';
import { recoverAttachmentForDownload } from '../src/recovery/attachment-recovery.js';
import { cryptoEngine } from '../src/crypto/crypto-engine.js';
const output=document.querySelector('#result'),encoder=new TextEncoder();
const samples=[
  ['docx','恢复说明 中文.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',Uint8Array.from([80,75,3,4,20,0,0,0,68,79,67,88])],
  ['pdf','恢复说明.pdf','application/pdf',encoder.encode('%PDF-1.7\n%%EOF')],
  ['png','设备照片.png','image/png',Uint8Array.from([137,80,78,71,13,10,26,10,73,69,78,68])],
  ['txt','步骤说明.txt','text/plain',encoder.encode('中文恢复步骤')],
  ['json','metadata.json','application/json',encoder.encode('{"版本":1}')],
  ['binary','原始数据<>:"?.bin','application/octet-stream',Uint8Array.from({length:256},(_,i)=>i)]
];
try{for(const [kind,name,mime,bytes]of samples){const id=`attachment-${kind}`,sha256=await cryptoEngine.hashHex(bytes),knowledgeGraph={schema_version:1,vault_title:'浏览器附件测试',reviewed_at:'2026-08-01T00:00:00.000Z',next_review_at:'2027-08-01T00:00:00.000Z',global_instructions:'仅用于本地测试',assets:[],locations:[],contacts:[],devices:[],orders:[],hints:[],warnings:[],attachments:[{id,display_name:name,media_type:mime,size:bytes.length,sha256,owner_refs:[],purpose:'浏览器字节一致性测试',sensitive_acknowledged:false,custom_field_refs:[]}],custom_categories:[],custom_fields:[]},snapshot=await buildSnapshot({snapshotId:`snapshot-${kind}`,vaultId:'vault-browser-test',wizardConfigVersion:1,createdAt:'2026-08-01T00:00:00.000Z',knowledgeGraph,attachmentPayloads:{[id]:bytes}}),recovered=await recoverAttachmentForDownload(snapshot,id);if(recovered.mimeType!==mime||recovered.bytes.length!==bytes.length||recovered.bytes.some((v,i)=>v!==bytes[i]))throw new Error(`${kind} mismatch`);}output.textContent=`PASS ${samples.length}/6 · ${navigator.userAgent}`;output.dataset.status='PASS';}catch(error){output.textContent=`FAIL · ${error.message}`;output.dataset.status='FAIL';}
