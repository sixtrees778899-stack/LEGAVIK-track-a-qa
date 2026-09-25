import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRecoveryWorkspaceHtml} from '../../web/map-view.js';

const attachment=(id,name,scope,module='locations-finding')=>({id,display_name:name,media_type:'text/plain',byte_length:12,sha256:id.padEnd(64,'a').slice(0,64),module_refs:[module],owner_entity_refs:[`scope-${id}`],purpose:'资料',sensitive_acknowledged:true});
const snapshot=({online=true,accountFile=true,summary=true,twoAccounts=false,sameName=false}={})=>{const assets=[{id:'alpha',label:'Alpha',condition_refs:['cond'],contact_refs:[],attachment_refs:[],custom_field_refs:[]}];if(twoAccounts)assets.push({id:'beta',label:'Beta',condition_refs:['cond-beta'],contact_refs:[],attachment_refs:[],custom_field_refs:[]});const locations=online?[{id:'loc',label:'书房资料夹',type:'summary',finding_instructions:'第二层抽屉',attachment_refs:[],custom_field_refs:[]}]:[];const conditions=[{id:'cond',type:'email',asset_refs:['alpha'],location_refs:online?['loc']:[],custom_field_refs:[]}];if(twoAccounts)conditions.push({id:'cond-beta',type:'phone',asset_refs:['beta'],location_refs:online?['loc']:[],custom_field_refs:[]});const attachments=[],custom_fields=[];const add=(file,value)=>{attachments.push(file);custom_fields.push({id:`scope-${file.id}`,module_ref:file.module_refs[0],label:'附件适用范围',field_type:'text',value});};if(accountFile){add(attachment('account-a',sameName?'相同名称.txt':'Alpha位置.txt','ACCOUNT:alpha'),'ACCOUNT:alpha');if(sameName)add(attachment('account-b','相同名称.txt','ACCOUNT:alpha'),'ACCOUNT:alpha');}if(summary)add(attachment('summary','位置汇总.txt','MODULE_SUMMARY'),'MODULE_SUMMARY');return{snapshot_version:1,knowledge_graph:{schema_version:2,vault_title:'Test',reviewed_at:'2026-08-31T00:00:00Z',assets,recovery_conditions:conditions,locations,contacts:[],recovery_steps:[{id:'step-a',sequence:1,action:'按既定步骤操作',asset_refs:['alpha'],condition_refs:[],location_refs:[],contact_refs:[],warning_refs:[],attachment_refs:[]}],attachments,custom_fields,assistance:{needed:false},personal_message:{text:'',attachment_refs:[],disclaimer_acknowledged:true}}};};
const accountSlice=(html,id='alpha')=>html.slice(html.indexOf(`id="recovery-account-${id}"`),html.indexOf('</details>',html.indexOf(`id="recovery-account-${id}"`)));
const locationSlice=html=>html.slice(html.indexOf('<span class="content-step">3.</span>'),html.indexOf('<span class="content-step">4.</span>'));

test('Phase 2 Case 1–10 material-source matrix and account isolation',()=>{
  const cases=[
    {options:{online:true,accountFile:false,summary:false},want:['在线填写信息'],not:['本账户相关附件','模块汇总附件']},
    {options:{online:false,accountFile:true,summary:false},want:['本账户相关附件'],not:['在线填写信息','模块汇总附件']},
    {options:{online:false,accountFile:false,summary:true},want:['模块汇总附件','Alpha','如已下载同一份汇总资料，无需重复下载'],not:['在线填写信息','本账户相关附件']},
    {options:{online:false,accountFile:true,summary:true},want:['本账户相关附件','模块汇总附件'],not:['在线填写信息']},
    {options:{online:true,accountFile:true,summary:false},want:['在线填写信息','本账户相关附件'],not:['模块汇总附件']},
    {options:{online:true,accountFile:false,summary:true},want:['在线填写信息','模块汇总附件'],not:['本账户相关附件']},
    {options:{online:true,accountFile:true,summary:true},want:['在线填写信息','本账户相关附件','模块汇总附件'],not:[]},
  ];
  for(const item of cases){const html=locationSlice(accountSlice(buildRecoveryWorkspaceHtml(snapshot(item.options))));for(const value of item.want)assert.match(html,new RegExp(value));for(const value of item.not)assert.doesNotMatch(html,new RegExp(value));}
  const shared=buildRecoveryWorkspaceHtml(snapshot({twoAccounts:true,accountFile:false,summary:true}));assert.equal((shared.match(/data-attachment-id="summary"/g)||[]).length,3);assert.match(accountSlice(shared,'alpha'),/Alpha/);assert.match(accountSlice(shared,'beta'),/Beta/);
  const isolated=buildRecoveryWorkspaceHtml(snapshot({twoAccounts:true,accountFile:true,summary:false}));assert.match(accountSlice(isolated,'alpha'),/Alpha位置\.txt/);assert.doesNotMatch(accountSlice(isolated,'beta'),/Alpha位置\.txt/);
  const same=accountSlice(buildRecoveryWorkspaceHtml(snapshot({accountFile:true,summary:false,sameName:true})));assert.equal((same.match(/相同名称\.txt/g)||[]).length,2);
});

test('conditions remain a checklist and sources are rendered once by stable identity',()=>{
  const html=accountSlice(buildRecoveryWorkspaceHtml(snapshot()));
  assert.match(html,/恢复需要什么[\s\S]*注册邮箱/);
  assert.doesNotMatch(html,/注册邮箱[\s\S]*本账户相关附件[\s\S]*注册邮箱/);
  assert.equal((html.match(/data-attachment-id="account-a"/g)||[]).length,1);
  assert.equal((html.match(/data-attachment-id="summary"/g)||[]).length,1);
  assert.match(html,/怎么恢复[\s\S]*在线填写信息[\s\S]*按既定步骤操作/);
});
