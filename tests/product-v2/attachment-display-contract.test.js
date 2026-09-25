import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {attachmentFriendlyType,ATTACHMENT_FRIENDLY_TYPES} from '../../src/ui/attachment-display.js';
import {buildRecoveryWorkspaceHtml} from '../../web/map-view.js';

const root=new URL('../../',import.meta.url);

test('one friendly attachment renderer covers every customer file class',()=>{
  assert.deepEqual(ATTACHMENT_FRIENDLY_TYPES,['文档','图片','语音','视频','其他']);
  for(const [file,expected] of [
    [{file_name:'汇总.docx',mime_type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},'文档'],
    [{file_name:'photo.png',mime_type:'image/png'},'图片'],
    [{file_name:'voice.m4a',mime_type:'audio/x-m4a'},'语音'],
    [{file_name:'guide.mp4',mime_type:'video/mp4'},'视频'],
    [{file_name:'archive.bin',mime_type:'application/octet-stream'},'其他']
  ])assert.equal(attachmentFriendlyType(file),expected);
});

test('Module pages, Review, and Attachment Center use the shared renderer instead of raw MIME',async()=>{
  const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  for(const marker of ['function fileCards(files)','function reportAttachment(file)','const previewAttachment=','function attachmentCategory(file)'])assert.match(source,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(source,/attachmentFriendlyType\(file\)/);
  assert.doesNotMatch(source,/\$\{escape\(file\.mime_type\)\}\s*·\s*\$\{formatBytes/);
});

test('Recovery Workspace exposes only friendly type and useful ownership',()=>{
  const snapshot={snapshot_version:1,knowledge_graph:{schema_version:2,vault_title:'Test',reviewed_at:'2026-08-29T00:00:00Z',assets:[],recovery_conditions:[],locations:[],contacts:[],recovery_steps:[],warnings:[],personal_message:{text:'',attachment_refs:[],disclaimer_acknowledged:true},custom_fields:[{id:'scope',module_ref:'evidence-messages',label:'scope',field_type:'text',value:'MODULE_SUMMARY'}],attachments:[{id:'video',display_name:'恢复说明.mp4',media_type:'video/mp4',byte_length:10,sha256:'a'.repeat(64),module_refs:['evidence-messages'],owner_entity_refs:['scope'],purpose:'补充说明',sensitive_acknowledged:true}]}};
  const html=buildRecoveryWorkspaceHtml(snapshot);
  assert.match(html,/恢复说明\.mp4/);assert.match(html,/视频 ·/);assert.match(html,/给未来恢复人的嘱托/);assert.doesNotMatch(html,/video\/mp4|MODULE_SUMMARY|evidence-messages|attachment ID/i);
});
