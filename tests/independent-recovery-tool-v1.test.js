import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertKitEvidencePair, validateMainnetEvidence } from '../src/ui/mainnet-connector.js';

const artifact='artifacts/independent-recovery-tool-v1/LEGAVIK-Independent-Recovery-Tool-V1.html';
test('tool is a single self-contained file with immutable metadata',async()=>{const html=await readFile(artifact,'utf8');assert.match(html,/legavik-independent-recovery-tool-v1-20260912-1/);assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=/);for(const value of ['"recovery_kit_version":[1]','"archive_version":[1]','"snapshot_version":[1]','"knowledge_map_schema_versions":[1,2]'])assert.match(html,new RegExp(value.replace(/[\[\]]/g,'\\$&')));});
test('tool has no platform, auth, write or signing dependency',async()=>{const html=await readFile(artifact,'utf8');for(const forbidden of ['supabase.co','SKREK_PUBLIC_CONFIG','service_role','SIGN_TRANSACTION','createTransaction','transactions.sign','transactions.post','canonical-runtime-gate'])assert.doesNotMatch(html,new RegExp(forbidden,'i'));assert.match(html,/https:\/\/arweave\.net/);assert.match(html,/https:\/\/ardrive\.net/);});
test('tool never embeds customer materials or private keys',async()=>{const html=await readFile(artifact,'utf8');assert.match(html,/customer_materials_embedded":false/);for(const forbidden of ['BEGIN PRIVATE KEY','BEGIN OPENSSH PRIVATE KEY'])assert.doesNotMatch(html,new RegExp(forbidden));});
test('tool preserves required validation and recovery stages',async()=>{const app=await readFile('src/independent-recovery-tool/v1-app.js','utf8');for(const required of ['Mainnet Recovery Evidence','Recovery Kit','Recovery Password','assertKitEvidencePair','verifyMainnetArchive','recoverVaultArtifacts','Mainnet Archive 大小校验失败','snapshot_payload_sha256','恢复结果精确匹配','恢复完成'])assert.match(app,new RegExp(required));});
test('mismatched Kit and Evidence fail before archive download or unlock',()=>{assert.throws(()=>assertKitEvidencePair({kit:{snapshot_id:'version-a'},evidence:{recovery_kit_identifier:'version-b'}}),/不属于同一次创建/);});
test('corrupted Evidence fails closed before any network request',()=>{assert.throws(()=>validateMainnetEvidence({network:'Arweave Mainnet',txid:'invalid',archive_size:1,archive_sha256:'0'.repeat(64),recovery_kit_identifier:'version-a'}),/文件不完整或无法识别/);});
