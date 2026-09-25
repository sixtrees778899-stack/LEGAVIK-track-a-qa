begin;

create unique index if not exists recovery_map_versions_one_current_per_map
  on public.recovery_map_versions (recovery_map_id)
  where status = 'CURRENT';

create or replace function public.record_published_recovery_map_version(
  p_recovery_map_id text,
  p_version_id text,
  p_operation_id text,
  p_snapshot_id text,
  p_txid text,
  p_archive_sha256 text,
  p_archive_size_bytes bigint,
  p_network text,
  p_display_name text,
  p_plan text,
  p_published_at timestamptz,
  p_operation_state text,
  p_evidence_status text,
  p_verification_status text
)
returns table (
  recovery_map_row_id uuid,
  version_row_id uuid,
  published_version_number integer,
  created boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  map_row public.recovery_maps%rowtype;
  current_version public.recovery_map_versions%rowtype;
  published_version public.recovery_map_versions%rowtype;
  next_version_number integer;
  current_count integer;
  affected_rows integer;
begin
  if owner_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_operation_state <> 'COMPLETE'
     or p_evidence_status <> 'READY_FOR_INDEPENDENT_RECOVERY'
     or p_verification_status <> 'PASS' then
    raise exception 'STABLE_PUBLICATION_REQUIRED';
  end if;
  if p_recovery_map_id is null or p_version_id is null or p_operation_id is null
     or p_snapshot_id is null or p_txid !~ '^[-_A-Za-z0-9]{43}$'
     or p_archive_sha256 !~ '^[0-9a-f]{64}$' or p_archive_size_bytes < 0 then
    raise exception 'LIFECYCLE_IDENTITY_INVALID';
  end if;

  select * into map_row
  from public.recovery_maps
  where user_id = owner_id and recovery_map_id = p_recovery_map_id
  for update;
  if map_row.id is null then raise exception 'RECOVERY_MAP_NOT_FOUND'; end if;

  select * into published_version
  from public.recovery_map_versions
  where user_id = owner_id and operation_id = p_operation_id;
  if published_version.id is not null then
    if published_version.recovery_map_id <> map_row.id
       or published_version.version_id <> p_version_id
       or published_version.snapshot_id <> p_snapshot_id
       or published_version.txid <> p_txid
       or published_version.archive_sha256 <> p_archive_sha256
       or published_version.archive_size_bytes <> p_archive_size_bytes
       or published_version.network <> coalesce(nullif(p_network,''),'arweave-mainnet') then
      raise exception 'LIFECYCLE_IDEMPOTENCY_CONFLICT';
    end if;
    return query select map_row.id, published_version.id,
      published_version.version_number, false;
    return;
  end if;

  select count(*) into current_count
  from public.recovery_map_versions
  where recovery_map_id = map_row.id and status = 'CURRENT';
  select * into current_version
  from public.recovery_map_versions
  where id = map_row.current_version_id
    and recovery_map_id = map_row.id
    and user_id = owner_id
    and status = 'CURRENT'
  for update;
  if current_count <> 1 or current_version.id is null then
    raise exception 'CURRENT_VERSION_INVARIANT_VIOLATION';
  end if;

  select coalesce(max(version_number),0) + 1 into next_version_number
  from public.recovery_map_versions
  where recovery_map_id = map_row.id;

  insert into public.recovery_map_versions (
    user_id,recovery_map_id,version_id,version_number,operation_id,snapshot_id,
    txid,archive_sha256,archive_size_bytes,network,status,published_at
  ) values (
    owner_id,map_row.id,p_version_id,next_version_number,p_operation_id,p_snapshot_id,
    p_txid,p_archive_sha256,p_archive_size_bytes,
    coalesce(nullif(p_network,''),'arweave-mainnet'),'HISTORICAL',p_published_at
  ) returning * into published_version;

  update public.recovery_map_versions
  set status = 'HISTORICAL'
  where id = current_version.id and status = 'CURRENT';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then raise exception 'CURRENT_VERSION_SWITCH_FAILED'; end if;

  update public.recovery_map_versions
  set status = 'CURRENT'
  where id = published_version.id and status = 'HISTORICAL';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then raise exception 'NEW_VERSION_ACTIVATION_FAILED'; end if;

  update public.recovery_maps
  set current_version_id = published_version.id,
      display_name = coalesce(nullif(trim(p_display_name),''),display_name),
      plan = coalesce(nullif(trim(p_plan),''),plan),
      status = 'PUBLISHED',lifecycle_state = 'PUBLISHED',is_latest = true
  where id = map_row.id and user_id = owner_id;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then raise exception 'CURRENT_POINTER_UPDATE_FAILED'; end if;

  return query select map_row.id, published_version.id,
    next_version_number, true;
end;
$$;

revoke all on function public.record_published_recovery_map_version(
  text,text,text,text,text,text,bigint,text,text,text,timestamptz,text,text,text
) from public, anon;
grant execute on function public.record_published_recovery_map_version(
  text,text,text,text,text,text,bigint,text,text,text,timestamptz,text,text,text
) to authenticated;

comment on function public.record_published_recovery_map_version(
  text,text,text,text,text,text,bigint,text,text,text,timestamptz,text,text,text
) is 'Atomically publishes the next complete version for an authenticated owner after stable Mainnet verification; retries by operation_id are idempotent.';

commit;
