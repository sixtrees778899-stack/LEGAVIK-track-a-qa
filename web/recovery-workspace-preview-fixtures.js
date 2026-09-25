const modules=[['assets-accounts',10],['recovery-conditions',20],['locations-finding',30],['recovery-order-exceptions',40],['contacts-assistance',50],['evidence-messages',60]].map(([id,order])=>({id,order}));
const conditionSets={
  binance:[['email','注册邮箱'],['phone','注册手机号'],['password','登录密码'],['authenticator','Authenticator / 2FA'],['identity','KYC / 身份验证材料']],
  uniswap:[['connected_wallet','关联钱包 / Connected Wallet'],['wallet_access','钱包访问条件']],
  metamask:[['wallet_password','钱包密码 / 解锁密码'],['recovery_phrase','Seed Phrase / 助记词'],['trusted_device','已信任设备']],
  ledger:[['device_pin','设备密码 / PIN'],['hardware_device','Hardware Wallet / 硬件钱包 / 恢复设备'],['recovery_phrase','Seed Phrase / 助记词'],['passphrase','Passphrase / 额外口令']]
};
const accountTypes={binance:'中心化交易所 / 个人账户',uniswap:'DEX / DeFi',metamask:'热钱包 / 软件钱包',ledger:'冷钱包 / 硬件钱包'};
const moduleRef={accounts:'assets-accounts',conditions:'recovery-conditions',locations:'locations-finding',instructions:'recovery-order-exceptions',assistants:'contacts-assistance',message:'evidence-messages'};
const mimeFor=name=>name.endsWith('.docx')?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':name.endsWith('.png')||name.endsWith('.jpg')?'image/jpeg':name.endsWith('.m4a')?'audio/mp4':name.endsWith('.mp4')?'video/mp4':'application/octet-stream';

function createFixture({boundary=false}={}){
  const custom_fields=[],recovery_conditions=[],locations=[],assets=[],recovery_steps=[],attachments=[];
  const addField=(id,module_ref,label,value)=>custom_fields.push({id,module_ref,label,field_type:'text',value});
  const addAttachment=({id,name,module,scope,account=null,accounts=[],purpose='补充资料',bytes=1024})=>{
    const scopeId=`scope-${id}`;addField(scopeId,moduleRef[module],'附件适用范围',scope);
    attachments.push({id,display_name:name,media_type:mimeFor(name),byte_length:bytes,sha256:'a'.repeat(64),module_refs:[moduleRef[module]],owner_entity_refs:[...(account?[account]:accounts),scopeId],purpose,sensitive_acknowledged:true});
  };
  for(const [accountId,conditions] of Object.entries(conditionSets)){
    addField(`metadata-${accountId}-account-type`,'assets-accounts','账户类型',accountTypes[accountId]);
    addField(`metadata-${accountId}-region`,'assets-accounts','地区',accountId==='binance'?'Australia':'不适用');
    const conditionRefs=[];
    for(const [conditionId,label] of conditions){
      const id=`condition-${accountId}-${conditionId}`,labelId=`label-${id}`,locationId=`location-${accountId}-${conditionId}`;conditionRefs.push(id);addField(labelId,'recovery-conditions','恢复条件显示名称',label);
      const hasLocation=!(boundary&&accountId==='ledger');
      if(hasLocation)locations.push({id:locationId,label:'位置说明',type:'itemized',finding_instructions:`测试位置线索｜${label}`,access_prerequisites:[],attachment_refs:[],custom_field_refs:[]});
      recovery_conditions.push({id,type:conditionId,exists:true,asset_refs:[accountId],location_refs:hasLocation?[locationId]:[],fallback_path_refs:[],notes:'',custom_field_refs:[labelId]});
    }
    assets.push({id:accountId,type:'DIGITAL_ASSET_ACCOUNT',label:{binance:'Binance',uniswap:'Uniswap',metamask:'MetaMask',ledger:'Ledger'}[accountId],exists:true,condition_refs:conditionRefs,location_refs:locations.filter(item=>item.id.startsWith(`location-${accountId}-`)).map(item=>item.id),contact_refs:boundary?[]:['contact-alex'],step_refs:boundary&&accountId==='ledger'?[]:[`step-${accountId}`],attachment_refs:[],custom_field_refs:[]});
    if(!(boundary&&accountId==='ledger'))recovery_steps.push({id:`step-${accountId}`,sequence:recovery_steps.length+1,risk_level:'medium',action:`按 ${accountId} 官方恢复路径逐项核对并操作。`,completion_check:'确认账户恢复结果',failure_action:'停止并查看相关资料',stop_condition:'信息不一致时停止',asset_refs:[accountId],condition_refs:conditionRefs,location_refs:[],contact_refs:boundary?[]:['contact-alex'],warning_refs:[],attachment_refs:[]});
  }
  const summaryAccounts=boundary?['binance']:['binance','uniswap','metamask','ledger'];
  addAttachment({id:'summary-locations',name:'位置与查找_汇总.docx',module:'locations',scope:'MODULE_SUMMARY',accounts:summaryAccounts,purpose:'多个账户的位置与查找汇总',bytes:82000});
  addAttachment({id:'summary-instructions',name:'恢复与转移步骤_汇总.docx',module:'instructions',scope:'MODULE_SUMMARY',accounts:summaryAccounts,purpose:'多个账户的恢复步骤汇总',bytes:96000});
  if(!boundary){
    addAttachment({id:'ledger-location',name:'Ledger_位置与查找.docx',module:'locations',scope:'ACCOUNT:ledger',account:'ledger',bytes:74000});
    addAttachment({id:'ledger-instruction',name:'Ledger_恢复步骤.docx',module:'instructions',scope:'ACCOUNT:ledger',account:'ledger',bytes:71000});
    addAttachment({id:'binance-doc',name:'Binance_账户说明.docx',module:'accounts',scope:'ACCOUNT:binance',account:'binance',bytes:68000});
    addAttachment({id:'binance-image',name:'Binance_设备截图.png',module:'accounts',scope:'ACCOUNT:binance',account:'binance',bytes:240000});
    addAttachment({id:'metamask-audio',name:'MetaMask_恢复提醒.m4a',module:'locations',scope:'ACCOUNT:metamask',account:'metamask',bytes:1200000});
    addAttachment({id:'ledger-video',name:'Ledger_恢复演示.mp4',module:'instructions',scope:'ACCOUNT:ledger',account:'ledger',bytes:3200000});
    addAttachment({id:'assistant-doc',name:'协助人联系说明.docx',module:'assistants',scope:'MODULE_SUMMARY',bytes:54000});
    addAttachment({id:'message-doc',name:'给未来恢复人的说明.docx',module:'message',scope:'MODULE_SUMMARY',bytes:65000});
    addAttachment({id:'message-image',name:'家庭说明.jpg',module:'message',scope:'MODULE_SUMMARY',bytes:180000});
  }
  addAttachment({id:'message-audio',name:'语音留言.m4a',module:'message',scope:'MODULE_SUMMARY',bytes:1100000});
  addAttachment({id:'message-video',name:'特别说明.mp4',module:'message',scope:'MODULE_SUMMARY',bytes:2800000});
  const contacts=boundary?[]:[{id:'contact-alex',label:'Alex Chen',role:'技术协助人',when_to_contact:'当硬件钱包或恢复设备无法确认时',assistance_boundary:'帮助识别设备和恢复资料位置；不持有完整助记词或私钥'}];
  return {snapshot_version:1,knowledge_graph:{schema_version:2,vault_title:boundary?'Recovery Workspace Boundary Preview':'Recovery Workspace Complete Preview',plan_type:'crypto-assets',reviewed_at:boundary?'2026-08-28T09:30:00.000Z':'2026-08-29T11:00:00.000Z',standard_modules:modules,custom_modules:[],assets,recovery_conditions,fallback_paths:[],locations,assistance:{needed:!boundary},contacts,recovery_steps,warnings:[],attachments,personal_message:{text:boundary?'':'请先阅读所有说明和附件，不要在不确定的情况下重置设备或转移资产。',attachment_refs:attachments.filter(item=>item.module_refs.includes('evidence-messages')).map(item=>item.id),disclaimer_acknowledged:true},custom_fields}};
}

export const recoveryWorkspacePreviewFixtures=Object.freeze({complete:createFixture(),boundary:createFixture({boundary:true})});
export const getRecoveryWorkspacePreviewFixture=name=>structuredClone(recoveryWorkspacePreviewFixtures[name]??recoveryWorkspacePreviewFixtures.complete);
