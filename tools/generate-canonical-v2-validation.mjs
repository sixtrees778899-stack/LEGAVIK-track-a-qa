import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createDynamicDocxTemplate} from '../src/product-v2/dynamic-docx-templates.js';

const output=resolve('web/v2/assets/validation/canonical-v2-integration');
const templates=resolve('web/v2/assets/templates');
const accounts=[
  {account_id:'cex',platform_or_wallet:'Binance',category:'中心化交易所',account_type_label:'中心化交易所',selected_recovery_conditions:[{id:'email',label:'注册邮箱'},{id:'authenticator',label:'2FA / Authenticator'},{id:'passkey',label:'Passkey'}]},
  {account_id:'dex',platform_or_wallet:'Curve',category:'DEX / DeFi',account_type_label:'DEX / DeFi',selected_recovery_conditions:[{id:'connected_wallet',label:'关联钱包 / Connected Wallet'},{id:'recovery_phrase',label:'Seed Phrase / 助记词'}]},
  {account_id:'hot',platform_or_wallet:'imToken',category:'自托管钱包',account_type_label:'热钱包 / 软件钱包',selected_recovery_conditions:[{id:'recovery_phrase',label:'Seed Phrase / 助记词'},{id:'wallet_password',label:'钱包访问密码'}]},
  {account_id:'cold',platform_or_wallet:'Keystone',category:'自托管钱包',account_type_label:'冷钱包 / 硬件钱包',selected_recovery_conditions:[{id:'hardware_device',label:'Hardware Wallet / 硬件钱包'},{id:'recovery_phrase',label:'Seed Phrase / 助记词'},{id:'additional_passphrase',label:'Passphrase / 额外口令'}]}
];
const jobs=[
  ['conditions',null,'SKREK_Module2_恢复所需条件与资料_Canonical_V2.docx','Module2-自动汇总-验收.docx'],
  ['locations',null,'SKREK_Module3_位置与查找_恢复信息位置汇总_Canonical_V2.docx','Module3-汇总继承-验收.docx'],
  ['locations','cold','SKREK_Module3_位置与查找_单一平台信息_Canonical_V2.docx','Module3-Keystone单一平台-验收.docx'],
  ['instructions',null,'SKREK_Module4_恢复与转移步骤_恢复步骤汇总_Canonical_V2.1.docx','Module4-汇总继承-验收.docx'],
  ['instructions','cex','SKREK_Module4_恢复与转移步骤_单一平台恢复步骤_Canonical_V2.1.docx','Module4-Binance单一平台-验收.docx']
];
await mkdir(output,{recursive:true});
for(const [moduleId,accountId,source,name] of jobs){
  const canonicalBytes=new Uint8Array(await readFile(resolve(templates,source)));
  const generated=await createDynamicDocxTemplate({accounts},{moduleId,accountId,canonicalBytes});
  await writeFile(resolve(output,name),generated.bytes);
}
