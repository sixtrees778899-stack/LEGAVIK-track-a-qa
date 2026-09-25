import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const migration=await readFile(new URL('../../supabase/migrations/20260903120000_recovery_map_version_publish.sql',import.meta.url),'utf8');

test('version publisher is owner-bound and accepts only stable publications',()=>{
  assert.match(migration,/owner_id uuid := auth\.uid\(\)/);
  assert.match(migration,/where user_id = owner_id and recovery_map_id = p_recovery_map_id/);
  assert.match(migration,/STABLE_PUBLICATION_REQUIRED/);
  assert.match(migration,/grant execute[\s\S]*to authenticated/);
  assert.match(migration,/revoke all[\s\S]*from public, anon/);
});

test('next version is server-calculated for V2, V3 and later',()=>{
  assert.match(migration,/coalesce\(max\(version_number\),0\) \+ 1/);
  assert.doesNotMatch(migration,/next_version_number\s*:=\s*2/);
  assert.match(migration,/unique index if not exists recovery_map_versions_one_current_per_map/);
});

test('current switch and pointer update occur inside one transaction',()=>{
  assert.match(migration,/^begin;/m);
  assert.match(migration,/set status = 'HISTORICAL'/);
  assert.match(migration,/set status = 'CURRENT'/);
  assert.match(migration,/set current_version_id = published_version\.id/);
  assert.match(migration,/CURRENT_VERSION_SWITCH_FAILED/);
  assert.match(migration,/NEW_VERSION_ACTIVATION_FAILED/);
  assert.match(migration,/CURRENT_POINTER_UPDATE_FAILED/);
  assert.match(migration,/^commit;/m);
});

test('operation retry returns the existing version without advancing',()=>{
  const retry=migration.slice(migration.indexOf('select * into published_version'),migration.indexOf('select count(*) into current_count'));
  assert.match(retry,/operation_id = p_operation_id/);
  assert.match(retry,/published_version\.version_number, false/);
  assert.match(retry,/LIFECYCLE_IDEMPOTENCY_CONFLICT/);
});

test('existing V1 RPC and recovery contracts are outside this migration',()=>{
  assert.doesNotMatch(migration,/create or replace function public\.record_published_recovery_map_v1/);
  assert.doesNotMatch(migration,/alter table public\.(recovery_materials|mainnet_evidence)/);
  assert.doesNotMatch(migration,/recovery_kit|snapshot structure|encryption/i);
});
