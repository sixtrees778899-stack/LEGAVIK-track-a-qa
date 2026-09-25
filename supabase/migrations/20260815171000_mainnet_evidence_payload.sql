begin;

alter table public.mainnet_evidence
  add column if not exists evidence_payload jsonb;

alter table public.mainnet_evidence
  drop constraint if exists mainnet_evidence_payload_object;

alter table public.mainnet_evidence
  add constraint mainnet_evidence_payload_object
  check (evidence_payload is null or jsonb_typeof(evidence_payload) = 'object');

comment on column public.mainnet_evidence.evidence_payload is
  'Non-secret Mainnet Recovery Evidence document used for authenticated re-download. Never stores recovery passwords or key material.';

commit;
