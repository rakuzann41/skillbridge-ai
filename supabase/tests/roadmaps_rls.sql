-- Optional PostgreSQL ownership, transaction, and progress checks after migration 003.
-- Run as postgres in the SQL Editor. Everything is rolled back; no emails/passwords.
begin;
select set_config('skillbridge.test_a', gen_random_uuid()::text, true);
select set_config('skillbridge.test_b', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('skillbridge.test_a')::uuid), (current_setting('skillbridge.test_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('skillbridge.test_a'), 'role', 'authenticated')::text, true);
select public.save_my_profile('', '', '', '[]'::jsonb);

do $$
declare
    roadmap_id uuid;
    item_id uuid;
    first_stamp timestamptz;
begin
    if public.get_my_roadmap() is not null then raise exception 'Failed: new account has a roadmap'; end if;
    begin
        perform public.create_my_roadmap(null, array['python','python','excel','pandas','visualization','project']);
        raise exception 'Failed: duplicate stages accepted';
    exception when invalid_parameter_value then null; end;
    if exists (select 1 from public.roadmaps) then raise exception 'Failed: invalid creation was not atomic'; end if;
    roadmap_id := public.create_my_roadmap(null, array['python','sql','excel','pandas','visualization','project']);
    if (select count(*) from public.roadmap_items) <> 6 then raise exception 'Failed: six stages not saved'; end if;
    select id into item_id from public.roadmap_items where position = 1;
    perform set_config('skillbridge.item_a', item_id::text, true);
    if not public.set_my_roadmap_item(item_id, true) then raise exception 'Failed: owner completion rejected'; end if;
    select completed_at into first_stamp from public.roadmap_items where id = item_id;
    if first_stamp is null then raise exception 'Failed: server completion time absent'; end if;
    perform public.set_my_roadmap_item(item_id, true);
    if (select completed_at from public.roadmap_items where id = item_id) <> first_stamp then raise exception 'Failed: idempotent update changed completion time'; end if;
    if public.create_my_roadmap(null, array['sql','excel','python','pandas','visualization','project']) <> roadmap_id then raise exception 'Failed: duplicate roadmap created'; end if;
    if not (select completed from public.roadmap_items where id = item_id) then raise exception 'Failed: reopening reset progress'; end if;
    perform public.set_my_roadmap_item(item_id, false);
    if (select completed_at is not null or completed from public.roadmap_items where id = item_id) then raise exception 'Failed: undo did not clear completion and timestamp'; end if;
    begin
        update public.roadmap_items set completed = true, completed_at = now();
        raise exception 'Failed: direct completion/timestamp mutation permitted';
    exception when insufficient_privilege then null; end;
    begin
        update public.roadmap_stage_catalog set resources = '[]'::jsonb;
        raise exception 'Failed: resource editing permitted';
    exception when insufficient_privilege then null; end;
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('skillbridge.test_b'), 'role', 'authenticated')::text, true);
do $$
begin
    if public.get_my_roadmap() is not null or exists (select 1 from public.roadmaps) or exists (select 1 from public.roadmap_items) then
        raise exception 'Failed: another account can read private progress';
    end if;
    if public.set_my_roadmap_item(current_setting('skillbridge.item_a')::uuid, true) then raise exception 'Failed: another account can complete a stage'; end if;
    begin
        insert into public.roadmaps(user_id, profile_skills) values (current_setting('skillbridge.test_a')::uuid, '[]'::jsonb);
        raise exception 'Failed: direct roadmap owner selection permitted';
    exception when insufficient_privilege then null; end;
end;
$$;
reset role;
set local role anon;
do $$
begin
    begin
        perform public.get_my_roadmap();
        raise exception 'Failed: anonymous roadmap RPC access';
    exception when insufficient_privilege then null; end;
end;
$$;
reset role;
rollback;
