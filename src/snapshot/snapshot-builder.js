import { SNAPSHOT_SCHEMA_VERSION } from '../domain/constants.js';
import { assertValidKnowledgeMapByVersion } from '../knowledge/dispatcher.js';
import { canonicalBytes, canonicalize } from '../shared/canonical-json.js';
import { base64UrlToBytes, bytesToBase64Url, utf8 } from '../shared/encoding.js';
import { ValidationError } from '../shared/errors.js';
import { cryptoEngine } from '../crypto/crypto-engine.js';

const ROOT_FIELDS = new Set(['snapshot_id','vault_id','snapshot_schema_version','wizard_config_version','created_at','knowledge_graph','attachment_payloads','integrity']);
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const attachmentLength=(item,knowledgeVersion)=>knowledgeVersion===2?item.byte_length:item.size;

export async function buildSnapshot({ snapshotId, vaultId, wizardConfigVersion, createdAt, knowledgeGraph, attachmentPayloads = {} }) {
  if (!ID_RE.test(snapshotId ?? '') || !ID_RE.test(vaultId ?? '')) throw new ValidationError('INVALID_ID', 'Snapshot and Vault IDs are required');
  if (!Number.isInteger(wizardConfigVersion) || wizardConfigVersion < 1) throw new ValidationError('INVALID_WIZARD_VERSION', 'Wizard config version must be positive');
  if (!Number.isFinite(Date.parse(createdAt))) throw new ValidationError('INVALID_DATE', 'createdAt must be ISO-8601');
  assertValidKnowledgeMapByVersion(knowledgeGraph);
  const manifest = new Map(knowledgeGraph.attachments.map((item) => [item.id, item]));
  const payloads = {};
  for (const [id, value] of Object.entries(attachmentPayloads)) {
    if (!manifest.has(id)) throw new ValidationError('UNDECLARED_ATTACHMENT', `Attachment payload is not declared: ${id}`);
    if (!(value instanceof Uint8Array)) throw new ValidationError('INVALID_ATTACHMENT', `Attachment ${id} must be Uint8Array`);
    const item = manifest.get(id), hash = await cryptoEngine.hashHex(value);
    if (value.byteLength !== attachmentLength(item,knowledgeGraph.schema_version) || hash !== item.sha256) throw new ValidationError('ATTACHMENT_MISMATCH', `Attachment integrity mismatch: ${id}`);
    payloads[id] = bytesToBase64Url(value);
  }
  for (const id of manifest.keys()) if (!(id in payloads)) throw new ValidationError('ATTACHMENT_MISSING', `Attachment payload missing: ${id}`);
  const core = { snapshot_id:snapshotId, vault_id:vaultId, snapshot_schema_version:SNAPSHOT_SCHEMA_VERSION, wizard_config_version:wizardConfigVersion, created_at:createdAt, knowledge_graph:knowledgeGraph, attachment_payloads:payloads };
  const integrity = {
    algorithm:'SHA-256', knowledge_sha256:await cryptoEngine.hashHex(canonicalBytes(knowledgeGraph)),
    attachment_manifest_sha256:await cryptoEngine.hashHex(canonicalBytes(knowledgeGraph.attachments)),
    snapshot_payload_sha256:await cryptoEngine.hashHex(canonicalBytes(core))
  };
  return { ...core, integrity };
}

export function serializeSnapshot(snapshot) { return canonicalize(snapshot); }
export function snapshotBytes(snapshot) { return utf8.encode(serializeSnapshot(snapshot)); }

export async function validateSnapshot(snapshot) {
  const errors=[];
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)) return {valid:false,errors:[{code:'TYPE',path:'$',message:'Snapshot must be an object'}]};
  for(const key of Object.keys(snapshot)) if(!ROOT_FIELDS.has(key)) errors.push({code:'UNKNOWN_FIELD',path:`$.${key}`,message:'Unknown snapshot field'});
  if(snapshot.snapshot_schema_version!==SNAPSHOT_SCHEMA_VERSION) errors.push({code:'UNSUPPORTED_VERSION',path:'$.snapshot_schema_version',message:'Unsupported snapshot version'});
  const knowledgeResult = (()=>{try{assertValidKnowledgeMapByVersion(snapshot.knowledge_graph);return null;}catch(error){return error.details;}})(); if(knowledgeResult) errors.push(...knowledgeResult);
  if(!snapshot.integrity||snapshot.integrity.algorithm!=='SHA-256') errors.push({code:'INVALID_INTEGRITY',path:'$.integrity',message:'Integrity block is invalid'});
  if(errors.length) return {valid:false,errors};
  try {
    const manifest=new Map(snapshot.knowledge_graph.attachments.map((item)=>[item.id,item]));
    for(const [id,encoded] of Object.entries(snapshot.attachment_payloads??{})){const item=manifest.get(id);if(!item)throw new Error(`Undeclared attachment ${id}`);const bytes=base64UrlToBytes(encoded);if(bytes.length!==attachmentLength(item,snapshot.knowledge_graph.schema_version)||await cryptoEngine.hashHex(bytes)!==item.sha256)throw new Error(`Attachment mismatch ${id}`);manifest.delete(id);}
    if(manifest.size) throw new Error(`Missing attachment ${manifest.keys().next().value}`);
    const core={snapshot_id:snapshot.snapshot_id,vault_id:snapshot.vault_id,snapshot_schema_version:snapshot.snapshot_schema_version,wizard_config_version:snapshot.wizard_config_version,created_at:snapshot.created_at,knowledge_graph:snapshot.knowledge_graph,attachment_payloads:snapshot.attachment_payloads};
    const expected={algorithm:'SHA-256',knowledge_sha256:await cryptoEngine.hashHex(canonicalBytes(snapshot.knowledge_graph)),attachment_manifest_sha256:await cryptoEngine.hashHex(canonicalBytes(snapshot.knowledge_graph.attachments)),snapshot_payload_sha256:await cryptoEngine.hashHex(canonicalBytes(core))};
    for(const key of Object.keys(expected)) if(snapshot.integrity[key]!==expected[key]) throw new Error(`Integrity mismatch: ${key}`);
  } catch(error){errors.push({code:'INTEGRITY_FAILED',path:'$.integrity',message:error.message});}
  return {valid:errors.length===0,errors};
}

export async function parseSnapshot(serialized) {
  let parsed; try { parsed=JSON.parse(serialized); } catch { throw new ValidationError('INVALID_SNAPSHOT_JSON','Snapshot is not valid JSON'); }
  const result=await validateSnapshot(parsed); if(!result.valid)throw new ValidationError('INVALID_SNAPSHOT','Snapshot validation failed',result.errors); return parsed;
}
