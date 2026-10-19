-- Optional real PostgreSQL checks after migration 202610190002.
-- Run as postgres. All fixtures and input snapshots are rolled back.
begin;
select set_config('skillbridge.test_a', gen_random_uuid()::text, true);
select set_config('skillbridge.test_b', gen_random_uuid()::text, true);
insert into auth.users (id) values
    (current_setting('skillbridge.test_a')::uuid),
    (current_setting('skillbridge.test_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('skillbridge.test_a'), 'role', 'authenticated')::text, true);
insert into public.analyses (user_id, sample_limit, profile_skills, dataset_sha256)
values (auth.uid(), 8, '[]'::jsonb, repeat('a', 64));
do $$
begin
    if (select count(*) from public.analyses) <> 1 then
        raise exception 'Failed: owner cannot read saved analysis';
    end if;
    begin
        update public.analyses set sample_limit = 1;
        raise exception 'Failed: input snapshot can be modified';
    exception when insufficient_privilege then null;
    end;
    begin
        insert into public.analyses (user_id, sample_limit, profile_skills, dataset_sha256, algorithm_version)
        values (auth.uid(), 8, '[]'::jsonb, repeat('a', 64), 'skill-overlap-v1');
        raise exception 'Failed: caller can choose version metadata';
    exception when insufficient_privilege then null;
    end;
end;
$$;
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('skillbridge.test_b'), 'role', 'authenticated')::text, true);
do $$
begin
    if exists (select 1 from public.analyses) then
        raise exception 'Failed: another account can read saved analysis';
    end if;
    begin
        insert into public.analyses (user_id, sample_limit, profile_skills, dataset_sha256)
        values (current_setting('skillbridge.test_a')::uuid, 8, '[]'::jsonb, repeat('a', 64));
        raise exception 'Failed: another account can choose owner';
    exception when insufficient_privilege then null;
    end;
end;
$$;
reset role;
rollback;
