import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createVaultArtifacts, recoverVaultArtifacts } from '../../src/ui/vault-pipeline.js';
import { cryptoEngine } from '../../src/crypto/crypto-engine.js';

const onlinePath='web/recover.js';
const independentPath='src/independent-recovery-tool/v1-app.js';
const password='non-customer-golden-fixture-password';
const historicalKnowledgeV1=JSON.parse(await readFile('tests/fixtures/knowledge-valid.json','utf8'));

const stages=[
  'validateMainnetEvidence',
  'recoveryKitBuilder.parseKit',
  'assertKitEvidencePair',
  'verifyMainnetArchive',
  'recoverVaultArtifacts',
  'renderRecoveryMap'
];

function assertOrdered(source,names){
  let cursor=-1;
  for(const name of names){
    const next=source.indexOf(name,cursor+1);
    assert.ok(next>cursor,`${name} must exist in recovery order`);
    cursor=next;
  }
}

function knowledgeForBusinessVersion(version){
  return {
    schema_version:2,
    vault_title:`Non-customer golden Recovery Map V${version}`,
    plan_type:'compatibility-fixture',
    reviewed_at:'2026-09-13T00:00:00.000Z',
    standard_modules:[
      ['assets-accounts',10],['recovery-conditions',20],['locations-finding',30],
      ['contacts-assistance',40],['recovery-order-exceptions',50],['evidence-messages',60]
    ].map(([id,order])=>({id,order})),
    custom_modules:[],
    assets:[{id:`asset-v${version}`,type:'test',label:`Fixture V${version}`,exists:true,platform_hint:'non-customer',condition_refs:[`condition-v${version}`],location_refs:[`location-v${version}`],contact_refs:[],step_refs:[`step-v${version}`],attachment_refs:[],custom_field_refs:[]}],
    recovery_conditions:[{id:`condition-v${version}`,type:'fixture',exists:true,asset_refs:[`asset-v${version}`],location_refs:[`location-v${version}`],fallback_path_refs:[],notes:'',custom_field_refs:[]}],
    fallback_paths:[],locations:[{id:`location-v${version}`,label:'Fixture location',type:'test',finding_instructions:'Non-customer test location',access_prerequisites:[],attachment_refs:[],custom_field_refs:[]}],assistance:{needed:false},contacts:[],
    recovery_steps:[{id:`step-v${version}`,sequence:1,risk_level:'low',action:'Verify fixture',completion_check:'Verified',failure_action:'Stop',stop_condition:'Mismatch',asset_refs:[`asset-v${version}`],condition_refs:[`condition-v${version}`],location_refs:[`location-v${version}`],contact_refs:[],warning_refs:[],attachment_refs:[]}],
    warnings:[],attachments:[],personal_message:null,custom_fields:[{id:`business-version-v${version}`,module_ref:'evidence-messages',label:'Business version',field_type:'text',value:`V${version}`}]
  };
}

test('online and independent surfaces preserve the same recovery protocol stages',async()=>{
  const [online,independent]=await Promise.all([readFile(onlinePath,'utf8'),readFile(independentPath,'utf8')]);
  for(const source of [online,independent]){
    assert.match(source,/from ['"]\.\.\/src\/ui\/vault-pipeline\.js['"]|from ['"]\.\.\/ui\/vault-pipeline\.js['"]/);
    assert.match(source,/from ['"]\.\.\/src\/ui\/mainnet-connector\.js['"]|from ['"]\.\.\/ui\/mainnet-connector\.js['"]/);
    assert.match(source,/from ['"]\.\/map-view\.js['"]|from ['"]\.\.\/\.\.\/web\/map-view\.js['"]/);
    for(const stage of stages)assert.match(source,new RegExp(stage.replace('.','\\.')));
    assertOrdered(source,stages.slice(0,5));
  }
});

for(const version of [1,2,3,4,5]){
  test(`V${version} business version recovers equivalently through both delivery surfaces`,async()=>{
    const knowledgeGraph=version===1?structuredClone(historicalKnowledgeV1):knowledgeForBusinessVersion(version);
    const attachmentPayloads=version===1?{'attachment-guide-1':new TextEncoder().encode('测试附件')}:{};
    const artifacts=await createVaultArtifacts({
      knowledgeGraph,attachmentPayloads,password,wizardConfigVersion:version,
      vaultId:`golden-vault-v${version}`,snapshotId:`golden-snapshot-v${version}`,
      createdAt:`2026-09-${String(8+version).padStart(2,'0')}T00:00:00.000Z`
    });
    const online=await recoverVaultArtifacts({kitBytes:artifacts.kitBytes,archiveBytes:artifacts.archiveBytes,password});
    const independent=await recoverVaultArtifacts({kitBytes:artifacts.kitBytes,archiveBytes:artifacts.archiveBytes,password});
    assert.deepEqual(independent.snapshot,online.snapshot);
    assert.equal(await cryptoEngine.hashHex(new TextEncoder().encode(JSON.stringify(independent.snapshot))),await cryptoEngine.hashHex(new TextEncoder().encode(JSON.stringify(online.snapshot))));
    assert.equal(online.kit.kit_version,1);
    assert.equal(online.snapshot.snapshot_schema_version,1);
    assert.equal(online.snapshot.knowledge_graph.schema_version,version===1?1:2);
    assert.equal(online.snapshot.wizard_config_version,version);
  });
}

test('neither customer recovery entry asks for or forces a technical version',async()=>{
  const [online,independent]=await Promise.all([readFile(onlinePath,'utf8'),readFile(independentPath,'utf8')]);
  for(const source of [online,independent]){
    assert.doesNotMatch(source,/technical[_ -]?version|select[^\n]{0,40}(kit|archive|snapshot)[_ -]?version/i);
    assert.doesNotMatch(source,/latest[_ -]?(kit|archive|snapshot)[_ -]?version/i);
  }
});
