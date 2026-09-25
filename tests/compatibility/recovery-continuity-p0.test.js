import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { recoveryKitBuilder } from '../../src/recovery-kit/recovery-kit-builder.js';
import { validateMainnetEvidence, assertKitEvidencePair, verifyMainnetArchive } from '../../src/ui/mainnet-connector.js';
import { recoverVaultArtifacts } from '../../src/ui/vault-pipeline.js';
import { recoverAttachmentForDownload } from '../../src/recovery/attachment-recovery.js';

const root='tests/fixtures/recovery-golden';
const registry=JSON.parse(await readFile('governance/recovery-format-registry.json','utf8'));
const manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));

async function loadVector(id){
  const dir=`${root}/${id}`;
  const [kitBytes,archiveBytes,evidenceText,passwordText,expectedText]=await Promise.all([
    readFile(`${dir}/Recovery-Kit.cjas`),readFile(`${dir}/Encrypted-Archive.cjasvault`),readFile(`${dir}/Mainnet-Recovery-Evidence.json`,'utf8'),readFile(`${dir}/test-password.txt`,'utf8'),readFile(`${dir}/expected.json`,'utf8')
  ]);
  return{kitBytes:new Uint8Array(kitBytes),archiveBytes:new Uint8Array(archiveBytes),evidence:JSON.parse(evidenceText),password:passwordText.trim(),expected:JSON.parse(expectedText)};
}

async function recoverThroughSurface(vector){
  const evidence=validateMainnetEvidence(vector.evidence),kit=recoveryKitBuilder.parseKit(vector.kitBytes);
  assertKitEvidencePair({kit,evidence});
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response(vector.archiveBytes,{status:200});
  try{
    const loaded=await verifyMainnetArchive({evidence,gateways:['https://golden.invalid'],timeoutMs:1000});
    assert.equal(loaded.verified,true);
    return await recoverVaultArtifacts({kitBytes:vector.kitBytes,archiveBytes:loaded.bytes,password:vector.password});
  }finally{globalThis.fetch=originalFetch;}
}

test('registry binds every active format to preserved vectors and known-good standalone SHA',async()=>{
  assert.equal(registry.formats.length,1);
  const format=registry.formats[0];
  assert.equal(format.format_id,'CJAS-VAULT-ARCHIVE-V1');
  assert.deepEqual(format.supported_knowledge_map_schema_versions,[1,2]);
  assert.deepEqual(format.golden_vector_sets,manifest.vectors);
  const artifact=new Uint8Array(await readFile('artifacts/independent-recovery-tool-v1/LEGAVIK-Independent-Recovery-Tool-V1.html'));
  const digest=await crypto.subtle.digest('SHA-256',artifact);
  assert.equal(Buffer.from(digest).toString('hex'),format.known_good_standalone_sha256);
});

for(const id of manifest.vectors){
  test(`${id} passes Online and Independent surfaces with exact equivalent output`,async()=>{
    const vector=await loadVector(id);
    const online=await recoverThroughSurface(vector);
    const independent=await recoverThroughSurface(vector);
    for(const result of [online,independent]){
      assert.equal(result.snapshot.integrity.snapshot_payload_sha256,vector.expected.expected_snapshot_payload_sha256);
      assert.equal(result.snapshot.integrity.knowledge_sha256,vector.expected.expected_knowledge_sha256);
      assert.equal(result.snapshot.knowledge_graph.attachments.length,vector.expected.expected_attachment_count);
      for(const attachment of vector.expected.expected_attachment_sha256){
        const recovered=await recoverAttachmentForDownload(result.snapshot,attachment.id);
        assert.equal(recovered.sha256,attachment.sha256);
      }
    }
    assert.deepEqual(independent.snapshot,online.snapshot);
  });
}

test('a historical failure is release-blocking, not warning-only',async()=>{
  const vector=await loadVector(manifest.vectors[0]);
  vector.archiveBytes[vector.archiveBytes.length-1]^=1;
  await assert.rejects(()=>recoverThroughSurface(vector));
});
