import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authoritativeCurrentVersion,customerVisibleMaterials,mayUpdateRecoveryVersion} from '../../src/account/customer-recovery-status.js';

const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const statusSource=readFileSync(new URL('../../src/account/customer-recovery-status.js',import.meta.url),'utf8');
const map={current_version_id:'v5',versions:[
  {id:'v5',version_number:5,status:'CURRENT'},
  {id:'v4',version_number:4,status:'PUBLISHED'},
  {id:'v3',version_number:3,status:'PUBLISHED'}
]};

test('current pointer is the sole authority and only latest version may update',()=>{
  assert.equal(authoritativeCurrentVersion(map)?.version_number,5);
  assert.equal(mayUpdateRecoveryVersion(map,map.versions[0]),true);
  assert.equal(mayUpdateRecoveryVersion(map,map.versions[1]),false);
  assert.equal(mayUpdateRecoveryVersion({...map,current_version_id:'missing'},map.versions[0]),false);
});

test('one lineage is presented with current and historical versions, never separate maps',()=>{
  assert.match(app,/一个 Recovery Map，包含一个当前版本和完整历史记录/);
  assert.match(app,/Historical/);
  assert.match(app,/历史版本不可更新/);
  assert.doesNotMatch(app,/恢复此历史版本/);
  assert.doesNotMatch(app,/Guided Drill|恢复演练记录/);
});

test('normal recovery is primary and independent recovery is tertiary with real explanation',()=>{
  assert.match(app,/进入我的恢复中心/);
  assert.match(app,/class="tertiary-link" download/);
  assert.match(app,/data-independent-explanation/);
  assert.match(app,/工具本身不包含您的 Recovery Map 明文或 Recovery Password/);
  assert.doesNotMatch(app,/data-section-link="materials">自主恢复/);
});

test('ordinary customer materials suppress local encrypted backup while preserving helper capability',()=>{
  const materials=[
    {material_type:'RECOVERY_KIT',filename:'kit.cjas'},
    {material_type:'MAINNET_EVIDENCE',filename:'evidence.json'},
    {material_type:'LOCAL_ENCRYPTED_BACKUP',filename:'backup.cjasvault'}
  ];
  assert.deepEqual(customerVisibleMaterials(materials).map(item=>item.filename),['kit.cjas','evidence.json']);
  assert.match(statusSource,/LOCAL_ENCRYPTED_BACKUP/);
  const center=app.slice(app.indexOf('function centerContent'),app.indexOf('async function renderCenter'));
  assert.doesNotMatch(center,/Local Encrypted Backup|Local Backup|\.cjasvault|本地加密备份/);
});

test('plan/order and account/help semantics do not fabricate capabilities',()=>{
  for(const label of ['我的方案与订单','CURRENT PLAN / SERVICE ENTITLEMENT','ORDER HISTORY','暂无付款订单记录','帮助与客服'])assert.match(app,new RegExp(label));
  assert.doesNotMatch(app,/id="forgot-password"|重置登录密码/);
  assert.doesNotMatch(app,/MFA|trusted device|受信任设备/i);
});

test('customer UI exposes no technical evidence identifiers or plaintext persistence',()=>{
  const center=app.slice(app.indexOf('function centerContent'),app.indexOf('async function renderCenter'));
  assert.doesNotMatch(center,/archive_sha256|snapshot_id|tool_hash|pairing|event_id|engine_identity/i);
  assert.doesNotMatch(app,/recovery_map_plaintext|plaintext.*insert|plaintext.*upsert/i);
});
