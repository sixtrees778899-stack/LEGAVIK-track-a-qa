import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRecoveryMapDraft} from '../../src/product-v2/model.js';
import {ProductActions} from '../../src/product-v2/actions.js';
import {buildModule1SummaryPayload,buildModule2SummaryPayload,buildFutureModule3TemplatePayload,buildFutureModule4TemplatePayload,prepareSystemSummaryDocuments} from '../../src/product-v2/module-summary-exports.js';

const root=new URL('../../',import.meta.url);
const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const templates=JSON.parse(await readFile(new URL('config/recovery-map/v2/platform-templates-v2.json',root),'utf8'));
const options={platformTemplates:templates,conditionLabels:templates.condition_labels};
function fixture(){let store=createRecoveryMapDraft({draftId:'summary-test'});store=ProductActions.addAccount(store,{account_id:'account-1',platform_id:'binance',platform_name:'币安 Binance',region:'Australia',account_type:'Personal',display_label:''},{expected_revision:store.draft_revision});store=ProductActions.addAccount(store,{account_id:'account-2',platform_id:'ledger',platform_name:'Ledger',region:'',account_type:'',display_label:''},{expected_revision:store.draft_revision});return ProductActions.setConditionSelection(store,'account-1',{selected_condition_ids:['email','authenticator']},{expected_revision:store.draft_revision});}

test('Module 1 and 2 expose approved guidance and lightweight help while remaining collapsed',()=>{
  for(const text of ['本模块目的','确认需要纳入 Recovery Map 的重要交易所','减少不必要的账户分散','确认每一个交易所账户或钱包','文件与补充','查看填写示例及详细说明 ›'])assert.match(app,new RegExp(text));
  assert.match(app,/如线上填写仍不足以完整说明本模块信息，可以上传文字、图片、音频或其他支持附件进行补充/);
  assert.match(app,/如线上选择仍无法充分表达特殊恢复条件，可以上传文字、图片、音频或其他附件进行补充/);
  assert.doesNotMatch(app,/<details class="module-instructions" open/);
});

test('Module 1 and 2 examples open inline without Knowledge Base navigation',()=>{
  assert.match(app,/data-module-example="\$\{moduleId\}">查看填写示例及详细说明 ›/);
  assert.match(app,/Module 1｜资产与账户填写示例/);
  assert.match(app,/Binance｜澳洲｜个人账户/);
  assert.match(app,/Module 2｜恢复所需条件填写示例/);
  assert.match(app,/Signer 和 Threshold/);
  assert.match(app,/if\(event\.key==='Escape'\)close\(\)/);
  assert.match(app,/window\.scrollTo\(\{top:scrollY,behavior:'auto'\}\)/);
  assert.doesNotMatch(app,/module-guidance-link" href=.*#knowledge/);
});

test('Module 2 condition catalogs use approved labels, order, and compatibility preservation',()=>{
  assert.match(app,/const cexConditions=\['email','password','phone','fund_password','authenticator','recovery_code','passkey','security_key','identity','backup_device','trusted_contact','other'\]/);
  assert.match(app,/const dexConditions=\['connected_wallet','recovery_phrase','private_key','wallet_password','additional_passphrase','backup_device','hardware_device','passkey','email_backup','email','authenticator','multisig_approval','subaccount_vault','other'\]/);
  assert.match(app,/const walletConditions=\['recovery_phrase','private_key','wallet_password','additional_passphrase','payment_password','wallet_device','social_login','biometric_recovery','imported_account','hardware_link','cloud_backup','multisig_approval','other'\]/);
  assert.match(app,/const hardwareConditions=\['recovery_phrase','hardware_device','device_pin','payment_password','additional_passphrase','backup_device','recovery_card','backup_hardware','security_device','multisig_approval','other'\]/);
  for(const copy of ['2FA / Authenticator 验证器','备用验证码 / 2FA 恢复码（如平台提供）','现有 / 备用设备（如备用手机、备用电脑）','Seed Phrase / 助记词','Private Key / 私钥','备用硬件钱包设备','设备密码 / PIN'])assert.match(app,new RegExp(copy.replace(/[()]/g,'\\$&')));
  assert.match(app,/preserved=selected\.filter\(id=>!visible\.includes\(id\)\)/);
  assert.match(app,/preserved\.map\(id=>`<input type="checkbox" class="hidden"/);
});

test('Module 1 and Module 2 inline help contain only the approved copy changes',()=>{
  for(const copy of ['账户所在区域','这两项属于中心化交易所的必要填写内容','示例仅用于帮助理解选择和填写方式','什么是“现有 / 备用设备”？','恢复设备建议','不会因为只能识别账户本人而导致恢复人无法进入','示例仅用于帮助理解恢复条件的选择方式'])assert.match(app,new RegExp(copy));
  assert.doesNotMatch(app,/请按照自己的实际账户情况填写，不要照抄/);
  for(const example of ['Binance｜澳洲｜个人账户','MetaMask','Ledger','Uniswap'])assert.match(app,new RegExp(example));
});

test('system summary documents use the Module 1 and 2 Canonical DOCX files',async()=>{
  const store=fixture(),module1=buildModule1SummaryPayload(store,options),module2=buildModule2SummaryPayload(store,options);
  assert.equal(module1.accounts.length,2);
  assert.deepEqual(module1.accounts.map(item=>item.category),['中心化交易所','自托管钱包']);
  assert.equal(module2.accounts.length,1);
  assert.deepEqual(module2.accounts[0].selected_recovery_conditions.map(item=>item.id),['email','authenticator']);
  const module1CanonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module1_资产与账户_Canonical_V2.docx',root))),module2CanonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module2_恢复所需条件与资料_Canonical_V2.docx',root))),documents=await prepareSystemSummaryDocuments(store,options,{module1CanonicalBytes,module2CanonicalBytes});
  for(const file of Object.values(documents)){assert.equal(file.mime_type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');assert.match(file.filename,/\.docx$/);assert.equal(file.bytes[0],0x50);assert.equal(file.bytes[1],0x4b);}
});

test('future Module 3 and 4 payloads inherit read-only data while system files stay out of issue Review',()=>{
  const store=fixture(),module3=buildFutureModule3TemplatePayload(store,options),module4=buildFutureModule4TemplatePayload(store,options);
  assert.equal(module3.accounts[0].platform_or_wallet,'币安 Binance');
  assert.deepEqual(module3.accounts[0].selected_recovery_conditions.map(item=>item.id),['email','authenticator']);
  assert.equal(module4.accounts[1].platform_or_wallet,'Ledger');
  assert.equal(module4.accounts[1].account_type_label,'冷钱包 / 硬件钱包');
  assert.deepEqual(module4.accounts[0].selected_recovery_conditions.map(item=>item.id),['email','authenticator']);
  assert.ok(Object.isFrozen(module3));
  const review=app.slice(app.indexOf('function renderReview('),app.indexOf('function renderReport('));
  assert.doesNotMatch(review,/review-generated-files|<h2>自动生成文件<\/h2>/);
  assert.doesNotMatch(review,/系统生成文件|下载资产与账户汇总文件|下载恢复条件汇总文件|data-system-summary/);
  const report=app.slice(app.indexOf('function renderReportV3('),app.indexOf('function renderPasswordV3('));
  assert.match(report,/systemSummaryCard\('module_1'\)/);
  assert.match(report,/systemSummaryCard\('module_2'\)/);
  assert.match(app,/prepareSystemSummaryDocuments\(store,summaryOptions\(\)\)/);
  assert.match(app,/data-system-summary/);
});

test('Module 2 uses account-aware current labels and has no manual summary download',()=>{
  const renderer=app.slice(app.indexOf('function renderConditionsStructured'),app.indexOf('const renderAttachmentsContextualLegacy'));
  assert.match(renderer,/conditionLabelForAccount\(account,id\)/);
  assert.match(renderer,/const selected=selectedConditions\(store,account\.account_id\),visible=conditionOptions\(account\)/);
  assert.doesNotMatch(app,/data-template-module="conditions"/);
  assert.doesNotMatch(app,/>下载恢复条件汇总</);
});

test('Module 5 and 6 reuse the attachment-zone auxiliary layout with template and inline help',async()=>{
  assert.match(app,/assistants:'\.\/assets\/templates\/LEGAVIK_Module5_协助人_Canonical_V2\.docx'/);
  assert.match(app,/message:'\.\/assets\/templates\/LEGAVIK_Module6_给未来恢复人的嘱托_Canonical_V3\.1\.docx'/);
  assert.match(app,/Module 5｜协助人填写说明/);
  assert.match(app,/Module 6｜给未来恢复人的嘱托填写说明/);
  assert.doesNotMatch(app,/Module 5｜协助人填写示例/);
  assert.doesNotMatch(app,/Module 6｜给未来恢复人的嘱托填写示例/);
  assert.match(app,/staticTemplateTool\(moduleId\).*data-module-example="\$\{moduleId\}"/);
  const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');
  assert.match(app,/class="module-template-menu-trigger"/);
  assert.match(css,/\.module-template-menu-trigger\{justify-self:end;min-height:0;padding:0;border:0;background:transparent;box-shadow:none;color:var\(--brand-deep-green\);font-size:\.9rem;font-weight:700/);
  assert.match(app,/data-static-template="\$\{moduleId\}"/);
  assert.match(app,/await saveBytesLocally\(\{bytes,suggestedName:name,mimeType:'application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document'\}\)/);
  assert.match(app,/attachmentCenterModules=.*'module_1'.*'module_2'/s);
  assert.match(app,/organizeAttachmentCenter\(\)/);
  assert.match(app,/已使用 \$\{formatBytes\(stats\.usedBytes\)\} \/ 50 MB/);
  assert.match(app,/如果预留表格空间不足，可以在 Word 中继续添加行或列，按实际需要扩展填写区域/);
  assert.match(app,/当前 Recovery Map 附件总空间为 50 MB/);
  assert.match(app,/建议附件保持必要、清晰并具有明确用途/);
  assert.match(app,/1｜优先使用汇总填写模板/);
  assert.match(app,/4｜还可以使用其他附件补充/);
  assert.match(app,/05｜更新与确认/);
  assert.doesNotMatch(app,/05｜最后更新/);
  assert.match(css,/\.module-guidance-topic\{/);
  assert.match(app,/attachment-module-group/);
  assert.doesNotMatch(app,/insertAdjacentHTML\('afterend',`<section class="system-generated-files"/);
  assert.match(css,/\.attachment-module-group>summary/);
});

test('corrective help layout uses independent flows, compact attachment details, and display-only ordering',async()=>{
  const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');
  assert.match(app,/module-instructions-independent/);
  assert.match(app,/module-guidance-column/);
  for(const copy of ['A｜本模块说明','B｜填写重点','B｜需要确认什么','C｜示例与更新','D｜填写方式','B｜开始前准备'])assert.match(app,new RegExp(copy));
  assert.match(css,/\.module-guidance-column\{display:flex;min-width:0;flex-direction:column\}/);
  assert.match(css,/@media\(max-width:700px\).*\.module-instructions-independent>div\{grid-template-columns:1fr\}/s);
  for(const copy of ['1｜优先使用汇总填写模板','2｜单一平台模板作为补充','3｜模板记录完整时，在线填写可以省略','4｜还可以使用其他附件补充'])assert.match(app,new RegExp(copy));
  assert.match(app,/attachment-guidance-more/);
  assert.match(app,/展开更多 ▾/);
  assert.match(app,/<details class="attachment-guidance-more"><summary>展开更多 ▾<\/summary><div><p>当前 Recovery Map 附件总空间为 50 MB。<\/p>/);
  assert.doesNotMatch(app,/attachment-capacity-note/);
  assert.match(app,/可上传填写模板、文档、图片、语音、视频等资料。如果附件已经完整记录相关信息，在线填写部分无需重复填写/);
  assert.doesNotMatch(app,/你可以上传已完成的详细填写模板，也可以上传与本模块相关的文档、图片、音频或其他资料/);
  assert.match(app,/const insertionOrder=new Map\(Object\.keys\(store\.attachments\)/);
  assert.match(app,/Date\.parse\(a\.created_at/);
  assert.match(app,/summary=files\.filter\(isModuleSummary\)\.sort\(displayOrder\),owned=files\.filter\(file=>!isModuleSummary\(file\)\)\.sort\(displayOrder\)/);
  assert.match(app,/for\(const account of Object\.values\(store\.accounts\)\)/);
  assert.match(app,/A｜本模块说明/);
  assert.match(app,/B｜需要记录哪些信息/);
  assert.match(app,/C｜可以写些什么/);
  assert.match(app,/module-guidance-sequence/);
  assert.match(app,/const guidanceSteps=body=>guidanceSequence/);
  assert.match(app,/padStart\(2,'0'\)/);
  assert.match(app,/B｜填写重点与建议/);
  assert.match(app,/C｜填写方式',guidanceSteps/);
  assert.match(app,/下载填写模板 <span aria-hidden="true">▾<\/span>/);
  assert.match(css,/Controlled Autonomy V1/);
  assert.match(css,/\.module-guidance-topic>div\{color:#334b43/);
  assert.match(app,/function standardizedInstructionPanel/);
  assert.match(app,/instructionPanel=standardizedInstructionPanel/);
  assert.match(app,/function balancedInstructionPanel/);
  assert.match(app,/instructionPanel=balancedInstructionPanel/);
  assert.match(app,/module-instructions-reorderable/);
  assert.match(app,/module-guidance-sequence-wide/);
  assert.match(css,/\.module-guidance-sequence-wide\{column-count:2/);
  assert.match(css,/@media\(max-width:700px\)\{\.module-guidance-sequence-wide\{column-count:1/);
  assert.match(css,/\.module-instructions-reorderable \.help-a\{order:1\}/);
  assert.match(app,/function standardizeDetailedHelp/);
  assert.match(app,/function standardizeAllDetailedHelp/);
  assert.match(app,/\['accounts','conditions','assistants','message'\]/);
  assert.match(app,/module-example-numbered-help/);
  assert.match(css,/counter\(detailed-help,decimal-leading-zero\)/);
  assert.match(app,/查看填写示例及详细说明 ›/);
  assert.ok(app.indexOf('01｜协助人是谁')<app.indexOf('07｜及时更新'));
  assert.ok(app.indexOf('01｜重要提醒与特殊安排')<app.indexOf('05｜更新与确认'));
  assert.match(app,/data-module-attachment="\$\{moduleId\}"/);
  assert.match(css,/data-module-attachment="accounts".*data-module-attachment="conditions".*align-self:end/s);
  assert.match(app,/assistants:'可上传协助说明、截图、文档、语音或其他辅助资料。附件用于补充协助信息，不能替代是否需要协助人的明确选择。'/);
  assert.match(app,/message:'可上传文字、图片、语音、视频或其他补充说明，用于补充想留给未来恢复人的内容。'/);
  assert.match(app,/\(isTemplateModule\|\|isSupplementModule\)\?'<details class="attachment-guidance-more"/);
});

test('Part 1 Help finalization preserves Module 3/4 and gives Modules 1/2/5/6 logical responsive layouts',async()=>{
  const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');
  assert.match(app,/function finalizedHelpLayout\(moduleId\)/);
  assert.match(app,/instructionPanel=finalizedHelpLayout/);
  assert.match(app,/A｜本模块说明.*B｜安全边界.*C｜进一步帮助.*D｜填写重点/s);
  assert.match(app,/A｜本模块说明.*B｜安全边界.*C｜文件与补充.*D｜需要确认什么/s);
  assert.match(app,/module-guidance-top.*C｜需要记录哪些信息.*guidanceChildColumns\(guidance\.slice\(2,6\),guidance\.slice\(6,9\)\).*D｜附件补充/s);
  assert.match(app,/module-guidance-top.*C｜可以写些什么.*guidanceChildColumns\(guidance\.slice\(3,6\),guidance\.slice\(6,8\)\).*module-guidance-bottom/s);
  assert.match(app,/return balancedInstructionPanel\(moduleId\)/);
  assert.match(css,/\.module-instructions-structured>div\{display:block!important/);
  assert.match(css,/\.module-guidance-top,.module-guidance-bottom\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.module-guidance-child-columns\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.module-guidance-top,.module-guidance-bottom,.module-guidance-child-columns\{grid-template-columns:1fr\}/);
});

test('module operation prompts and account-dependent empty states use the approved copy',()=>{
  for(const copy of [
    '请选择并添加需要纳入 Recovery Map 的平台或钱包；同一平台有多个账户时，请分别添加。',
    '请根据实际情况选择该账户真正需要的恢复条件；这里不填写密码、验证码、助记词或私钥原文。',
    '请记录恢复条件和材料的具体保存位置与查找方式；如已在模板中完整记录，线上无需重复填写。',
    '请按实际操作顺序记录恢复与转移步骤；如已在模板中完整记录，线上无需重复填写。',
    '本模块选填；如需要协助人，请明确其身份、联系方式和可协助范围。',
    '本模块选填；可以留下重要提醒、个人安排，以及想对未来恢复人说的话。'
  ])assert.ok(app.includes(copy));
  assert.match(app,/const dependentModuleEmptyPrompt='请先在「资产与账户」中添加至少一个平台或钱包，再继续填写本模块。'/);
  assert.match(app,/function renderConditionsStructured[\s\S]*?\|\|`<p>\$\{dependentModuleEmptyPrompt\}<\/p>`/);
  assert.match(app,/function renderLocationsV2[\s\S]*?\|\|`<p>\$\{dependentModuleEmptyPrompt\}<\/p>`/);
  assert.match(app,/function renderInstructionsV2[\s\S]*?\|\|`<p>\$\{dependentModuleEmptyPrompt\}<\/p>`/);
  assert.doesNotMatch(app,/function renderAssistantsV2\(anchor\)\{\s*if\(!Object\.keys\(store\.accounts\)\.length\)/);
  assert.match(app,/prompt\.className='module-operation-prompt';prompt\.textContent=moduleOperationPrompts\[current\];instruction\?\.after\(prompt\)/);
  assert.doesNotMatch(app,/填写示例与专业模板将在后续版本提供/);
});
