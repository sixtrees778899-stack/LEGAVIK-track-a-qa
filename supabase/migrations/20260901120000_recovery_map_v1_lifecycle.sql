begin;

alter table public.recovery_maps
  add column if not exists display_name text,
  add column if not exists lifecycle_state text not null default 'LEGACY',
  add column if not exists published_at timestamptz;

create table if not exists public.recovery_map_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id uuid not null references public.recovery_maps(id) on delete cascade,
  version_id text not null,
  version_number integer not null check (version_number > 0),
  operation_id text not null,
  snapshot_id text not null,
  txid text not null check (txid ~ '^[-_A-Za-z0-9]{43}$'),
  archive_sha256 text not null check (archive_sha256 ~ '^[0-9a-f]{64}$'),
  archive_size_bytes bigint not null check (archive_size_bytes >= 0),
  network text not null default 'arweave-mainnet',
  status text not null check (status in ('CURRENT','HISTORICAL')),
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, version_id),
  unique (user_id, operation_id),
  unique (recovery_map_id, version_number)
);

alter table public.recovery_maps
  add column if not exists current_version_id uuid references public.recovery_map_versions(id) on delete set null;

drop trigger if exists recovery_map_versions_set_updated_at on public.recovery_map_versions;
create trigger recovery_map_versions_set_updated_at before update on public.recovery_map_versions
for each row execute function public.set_updated_at();

alter table public.recovery_map_versions enable row level security;

drop policy if exists recovery_map_versions_select_own on public.recovery_map_versions;
create policy recovery_map_versions_select_own on public.recovery_map_versions
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists recovery_map_versions_insert_own on public.recovery_map_versions;
create policy recovery_map_versions_insert_own on public.recovery_map_versions
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists recovery_map_versions_update_own on public.recovery_map_versions;
create policy recovery_map_versions_update_own on public.recovery_map_versions
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists recovery_map_versions_delete_own on public.recovery_map_versions;
create policy recovery_map_versions_delete_own on public.recovery_map_versions
for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.recovery_map_versions from anon;
grant select on public.recovery_map_versions to authenticated;

create or replace function public.record_published_recovery_map_v1(
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
returns table (recovery_map_row_id uuid, version_row_id uuid, created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  map_row public.recovery_maps%rowtype;
  version_row public.recovery_map_versions%rowtype;
  was_created boolean := false;
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

  insert into public.recovery_maps (
    user_id,recovery_map_id,creation_id,display_name,plan,status,is_latest,
    attachment_usage_bytes,lifecycle_state,published_at
  ) values (
    owner_id,p_recovery_map_id,p_operation_id,nullif(trim(p_display_name),''),
    coalesce(nullif(trim(p_plan),''),'未指定'),'PUBLISHED',true,0,
    'PUBLISHED',p_published_at
  )
  on conflict (user_id,recovery_map_id) do update set
    display_name=coalesce(excluded.display_name,public.recovery_maps.display_name),
    plan=excluded.plan,
    status='PUBLISHED',
    lifecycle_state='PUBLISHED',
    published_at=coalesce(public.recovery_maps.published_at,excluded.published_at),
    is_latest=true
  returning * into map_row;

  select * into version_row from public.recovery_map_versions
  where user_id=owner_id and operation_id=p_operation_id;
  if version_row.id is null then
    insert into public.recovery_map_versions (
      user_id,recovery_map_id,version_id,version_number,operation_id,snapshot_id,
      txid,archive_sha256,archive_size_bytes,network,status,published_at
    ) values (
      owner_id,map_row.id,p_version_id,1,p_operation_id,p_snapshot_id,p_txid,
      p_archive_sha256,p_archive_size_bytes,coalesce(nullif(p_network,''),'arweave-mainnet'),
      'CURRENT',p_published_at
    ) returning * into version_row;
    was_created := true;
  elsif version_row.recovery_map_id <> map_row.id
     or version_row.version_id <> p_version_id
     or version_row.txid <> p_txid
     or version_row.archive_sha256 <> p_archive_sha256 then
    raise exception 'LIFECYCLE_IDEMPOTENCY_CONFLICT';
  end if;

  update public.recovery_maps set current_version_id=version_row.id
  where id=map_row.id and user_id=owner_id;

  return query select map_row.id,version_row.id,was_created;
end;
$$;

revoke all on function public.record_published_recovery_map_v1(
  text,text,text,text,text,text,bigint,text,text,text,timestamptz,text,text,text
) from public, anon;
grant execute on function public.record_published_recovery_map_v1(
  text,text,text,text,text,text,bigint,text,text,text,timestamptz,text,text,text
) to authenticated;

comment on table public.recovery_map_versions is
  'Non-secret immutable publication lifecycle metadata. Never stores Recovery Map content or recovery secrets.';

commit;
