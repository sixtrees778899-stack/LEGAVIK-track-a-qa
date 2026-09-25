begin;

-- Profile identity fields mirror auth.users and are maintained only by the
-- security-definer trigger. Browser clients may read their own row but cannot
-- forge email verification state or alter another identity field.
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;

commit;
