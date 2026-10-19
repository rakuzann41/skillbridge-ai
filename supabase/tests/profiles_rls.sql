-- Optional database integration test. Run AFTER the migration as postgres.
-- Fixtures have no email or password. Every change is rolled back at the end.
-- These assertions test actual PostgreSQL policies, not a mocked API.
begin;

select set_config('skillbridge.test_user_a', gen_random_uuid()::text, true);
select set_config('skillbridge.test_user_b', gen_random_uuid()::text, true);
insert into auth.users (id) values
    (current_setting('skillbridge.test_user_a')::uuid),
    (current_setting('skillbridge.test_user_b')::uuid);

set local role authenticated;
select set_config('request.jwt.claims', jsonb_build_object(
    'sub', current_setting('skillbridge.test_user_a'), 'role', 'authenticated'
)::text, true);

do $$
declare saved jsonb;
begin
    saved := public.save_my_profile('RLS fixture A', '', '', '[{"skill_id":"sql","level":"learning"}]'::jsonb);
    if saved->>'display_name' <> 'RLS fixture A' then
        raise exception 'Failed: profile save';
    end if;
    if (select count(*) from public.profiles) <> 1 then
        raise exception 'Failed: owner cannot see profile';
    end if;
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object(
    'sub', current_setting('skillbridge.test_user_b'), 'role', 'authenticated'
)::text, true);

do $$
begin
    if exists (select 1 from public.profiles) or exists (select 1 from public.user_skills) then
        raise exception 'Failed: account B can read account A data';
    end if;
    update public.profiles set display_name = 'not allowed'
        where user_id = current_setting('skillbridge.test_user_a')::uuid;
    if found then raise exception 'Failed: cross-account profile update'; end if;
    delete from public.user_skills where user_id = current_setting('skillbridge.test_user_a')::uuid;
    if found then raise exception 'Failed: cross-account skill delete'; end if;
    begin
        insert into public.user_skills (user_id, skill_id, level)
        values (current_setting('skillbridge.test_user_a')::uuid, 'python', 'learning');
        raise exception 'Failed: cross-account skill insert';
    exception when insufficient_privilege then null;
    end;
    perform public.save_my_profile('RLS fixture B', '', '', '[]'::jsonb);
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object(
    'sub', current_setting('skillbridge.test_user_a'), 'role', 'authenticated'
)::text, true);

do $$
begin
    if (select display_name from public.profiles) <> 'RLS fixture A' then
        raise exception 'Failed: account A data changed';
    end if;
    if (select count(*) from public.user_skills) <> 1 then
        raise exception 'Failed: skill count after cross-account attempt';
    end if;
    begin
        perform public.save_my_profile('must roll back', '', '', '[{"skill_id":"unknown","level":"learning"}]'::jsonb);
        raise exception 'Failed: invalid skill accepted';
    exception when check_violation then null;
    end;
    if (select display_name from public.profiles) <> 'RLS fixture A'
        or (select count(*) from public.user_skills) <> 1 then
        raise exception 'Failed: invalid save partially changed profile or skills';
    end if;
    perform public.save_my_profile('RLS fixture A', '', '', '[]'::jsonb);
    if exists (select 1 from public.user_skills) then
        raise exception 'Failed: clearing skills';
    end if;
end;
$$;

reset role;
rollback;
