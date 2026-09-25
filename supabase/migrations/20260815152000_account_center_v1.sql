begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recovery_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id text not null,
  creation_id text not null,
  plan text not null default '未指定',
  status text not null default 'CREATED',
  is_latest boolean not null default true,
  attachment_usage_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recovery_map_id),
  unique (user_id, creation_id)
);

create table if not exists public.recovery_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id uuid not null references public.recovery_maps(id) on delete cascade,
  material_type text not null check (material_type in ('RECOVERY_KIT','MAINNET_RECOVERY_EVIDENCE','LOCAL_ENCRYPTED_BACKUP')),
  filename text not null,
  downloadable boolean not null default false,
  created_at timestamptz not null default now(),
  unique (recovery_map_id, material_type)
);

create table if not exists public.mainnet_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id uuid not null references public.recovery_maps(id) on delete cascade,
  txid text not null,
  archive_sha256 text not null,
  archive_size_bytes bigint not null check (archive_size_bytes >= 0),
  evidence_version text not null,
  filename text not null,
  created_at timestamptz not null default now(),
  unique (recovery_map_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id uuid references public.recovery_maps(id) on delete set null,
  order_number text not null unique,
  plan text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null,
  payment_status text not null,
  provider_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.annual_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recovery_map_id uuid not null references public.recovery_maps(id) on delete cascade,
  status text not null default 'NOT_STARTED',
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recovery_map_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists recovery_maps_set_updated_at on public.recovery_maps;
create trigger recovery_maps_set_updated_at before update on public.recovery_maps
for each row execute function public.set_updated_at();

drop trigger if exists annual_reviews_set_updated_at on public.annual_reviews;
create trigger annual_reviews_set_updated_at before update on public.annual_reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, email_verified)
  values (new.id, coalesce(new.email, ''), new.email_confirmed_at is not null)
  on conflict (user_id) do update
    set email = excluded.email,
        email_verified = excluded.email_verified,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, email_confirmed_at on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.recovery_maps enable row level security;
alter table public.recovery_materials enable row level security;
alter table public.mainnet_evidence enable row level security;
alter table public.orders enable row level security;
alter table public.annual_reviews enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles','recovery_maps','recovery_materials','mainnet_evidence','orders','annual_reviews']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_select_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_insert_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_update_own', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_delete_own', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
  end loop;
end;
$$;

revoke all on public.profiles, public.recovery_maps, public.recovery_materials,
  public.mainnet_evidence, public.orders, public.annual_reviews from anon;
grant select, insert, update, delete on public.profiles, public.recovery_maps,
  public.recovery_materials, public.mainnet_evidence, public.orders,
  public.annual_reviews to authenticated;

commit;
