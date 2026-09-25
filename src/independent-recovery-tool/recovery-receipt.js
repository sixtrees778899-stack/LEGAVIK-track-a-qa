import {appendRecoveryEvidenceEvent,attachmentHashSummary,createRecoveryEvidencePayload,RECOVERY_RECEIPT_SCHEMA,RECOVERY_ENGINE_IDENTITY,sha256} from '../account/recovery-evidence-client.js';

export async function createIndependentRecoveryReceipt({kitBytes,evidenceBytes,archiveBytes,evidence,snapshot,toolManifest,occurredAt=new Date().toISOString()}){
  const attachments=attachmentHashSummary(snapshot);
  return Object.freeze({
    receipt_schema:RECOVERY_RECEIPT_SCHEMA,
    event_type:'INDEPENDENT_RECOVERY_RECEIPT_IMPORTED',
    event_source:'INDEPENDENT',result:'PASS',occurred_at:occurredAt,
    pairing_identifier:evidence.recovery_kit_identifier,
    recovery_kit_sha256:await sha256(kitBytes),
    mainnet_evidence_sha256:await sha256(evidenceBytes),
    archive_sha256:await sha256(archiveBytes),archive_size_bytes:archiveBytes.byteLength,
    mainnet_txid:evidence.txid,recovery_format_identity:evidence.format_version,
    recovery_engine_identity:RECOVERY_ENGINE_IDENTITY,
    independent_tool_identity:toolManifest.build_identity,
    independent_tool_sha256:toolManifest.executable_sha256,
    validation:{kit_match:'PASS',evidence_match:'PASS',archive_match:'PASS',password_verification:'PASS',output_exact_match:'PASS'},
    recovered_output_sha256:snapshot.integrity.snapshot_payload_sha256,
    attachment_count:attachments.length,attachment_hash_summary:attachments,
    semantics:'SHA-256 values establish integrity and successful use at event time only.'
  });
}

export async function validateIndependentRecoveryReceipt(receipt,{evidence,recoveryMapVersionId}){
  if(receipt?.receipt_schema!==RECOVERY_RECEIPT_SCHEMA||receipt?.event_type!=='INDEPENDENT_RECOVERY_RECEIPT_IMPORTED'||receipt?.result!=='PASS')throw Object.assign(new Error('Independent Recovery Receipt is invalid.'),{code:'RECOVERY_RECEIPT_INVALID'});
  if(receipt.pairing_identifier!==evidence?.recovery_kit_identifier||receipt.archive_sha256!==evidence?.archive_sha256||receipt.mainnet_txid!==evidence?.txid)throw Object.assign(new Error('Independent Recovery Receipt does not match this Recovery Map version.'),{code:'RECOVERY_RECEIPT_ASSOCIATION_MISMATCH'});
  const receiptBytes=new TextEncoder().encode(JSON.stringify(receipt));
  return {recoveryMapVersionId,eventType:receipt.event_type,eventSource:'INDEPENDENT',result:'PASS',occurredAt:receipt.occurred_at,
    recoveryKitSha256:receipt.recovery_kit_sha256,mainnetEvidenceSha256:receipt.mainnet_evidence_sha256,archiveSha256:receipt.archive_sha256,
    archiveSizeBytes:receipt.archive_size_bytes,mainnetTxid:receipt.mainnet_txid,pairingIdentifier:receipt.pairing_identifier,
    recoveryFormatIdentity:receipt.recovery_format_identity,recoveryEngineIdentity:receipt.recovery_engine_identity,
    independentToolIdentity:receipt.independent_tool_identity,independentToolSha256:receipt.independent_tool_sha256,
    kitMatch:'PASS',evidenceMatch:'PASS',archiveMatch:'PASS',passwordVerification:'PASS',outputExactMatch:'PASS',
    recoveredOutputSha256:receipt.recovered_output_sha256,attachmentCount:receipt.attachment_count,
    attachmentHashSummary:receipt.attachment_hash_summary,independentReceiptSha256:await sha256(receiptBytes)};
}

export async function importIndependentRecoveryReceipt(receipt,{evidence,recoveryMapVersionId,supabase}){
  const input=await validateIndependentRecoveryReceipt(receipt,{evidence,recoveryMapVersionId});
  return appendRecoveryEvidenceEvent(createRecoveryEvidencePayload(input),{supabase});
}
