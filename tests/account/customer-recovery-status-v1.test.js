import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentRecoveryVerification,customerVisibleMaterials,guidedRecoveryDrills} from '../../src/account/customer-recovery-status.js';

const map={current_version:{id:'v5-row',version_number:5},versions:[{id:'v4-row',version_number:4},{id:'v5-row',version_number:5}]};

test('only a successful recovery event for the exact current version marks it verified',()=>{
  assert.equal(currentRecoveryVerification(map,[{recovery_map_version_id:'v4-row',event_type:'ONLINE_RECOVERY',result:'PASS',occurred_at:'2026-09-01T00:00:00Z'}]).verified,false);
  const status=currentRecoveryVerification(map,[{recovery_map_version_id:'v5-row',event_type:'GUIDED_RECOVERY_DRILL',result:'PASS',occurred_at:'2026-09-02T00:00:00Z'},{recovery_map_version_id:'v5-row',event_type:'INITIAL_RECOVERY_VERIFICATION',result:'PASS',occurred_at:'2026-09-03T00:00:00Z'}]);
  assert.deepEqual(status,{verified:true,version:5,lastVerifiedAt:'2026-09-03T00:00:00Z'});
});

test('guided drill history exposes only version, time and customer-safe result',()=>{
  const history=guidedRecoveryDrills(map,[{id:'internal',recovery_map_version_id:'v5-row',event_type:'GUIDED_RECOVERY_DRILL',result:'PASS',occurred_at:'2026-09-03T00:00:00Z',archive_sha256:'secret'},{recovery_map_version_id:'v4-row',event_type:'GUIDED_RECOVERY_DRILL',result:'FAIL',occurred_at:'2026-09-01T00:00:00Z'}]);
  assert.deepEqual(history,[{version:5,occurredAt:'2026-09-03T00:00:00Z',result:'PASS'},{version:4,occurredAt:'2026-09-01T00:00:00Z',result:'NOT_COMPLETED'}]);
  assert.equal(JSON.stringify(history).includes('sha256'),false);
});

test('ordinary plans suppress local archive while private capability remains',()=>{
  const materials=[{material_type:'RECOVERY_KIT',filename:'kit.cjas'},{material_type:'MAINNET_EVIDENCE',filename:'evidence.json'},{material_type:'LOCAL_ENCRYPTED_BACKUP',filename:'backup.cjasvault'}];
  assert.deepEqual(customerVisibleMaterials(materials,'Essential'),materials.slice(0,2));
  assert.deepEqual(customerVisibleMaterials(materials,'Standard'),materials.slice(0,2));
  assert.deepEqual(customerVisibleMaterials(materials,'Legacy / Private'),materials);
});

test('ordinary completion UI exposes only the two credential-suite files while encrypted archive capability remains',()=>{
  const source=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
  const completion=source.slice(source.indexOf('function renderDownloads()'),source.indexOf('function renderRecoveryUpload'));
  assert.doesNotMatch(completion,/Local Encrypted Backup|本地加密备份|\.cjasvault/);
  assert.match(completion,/Recovery Kit/);
  assert.match(completion,/Mainnet Recovery Evidence/);
  assert.match(source,/artifacts\.archiveBytes/);
  assert.match(source,/createVaultArtifacts/);
});
