begin;

create extension if not exists citext;

alter table public.profiles
  add column if not exists username citext;

create unique index if not exists profiles_username_unique
  on public.profiles (username)
  where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username::text ~ '^[A-Za-z0-9_]{3,30}$');

create or replace function public.claim_username(desired_username text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text := trim(desired_username);
  claimed public.profiles;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if normalized !~ '^[A-Za-z0-9_]{3,30}$' then
    raise exception 'USERNAME_INVALID';
  end if;
  begin
    update public.profiles
      set username = normalized,
          updated_at = now()
      where user_id = auth.uid()
      returning * into claimed;
  exception when unique_violation then
    raise exception 'USERNAME_TAKEN';
  end;
  if claimed.user_id is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;
  return claimed;
end;
$$;

revoke all on function public.claim_username(text) from public, anon;
grant execute on function public.claim_username(text) to authenticated;

commit;
