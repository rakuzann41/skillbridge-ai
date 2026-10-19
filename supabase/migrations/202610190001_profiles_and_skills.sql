-- Run once in the Supabase SQL editor, or apply with Supabase migrations.
-- All requests use the user's JWT. No service-role key is required.
begin;

create table public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default '' check (char_length(display_name) <= 80),
    education text not null default '' check (char_length(education) <= 200),
    experience text not null default '' check (char_length(experience) <= 500),
    target_role text not null default 'Junior Data Analyst'
        check (target_role = 'Junior Data Analyst'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.user_skills (
    user_id uuid not null references public.profiles(user_id) on delete cascade,
    skill_id text not null check (skill_id in (
        'python', 'sql', 'excel', 'pandas', 'relational-databases', 'data-cleaning',
        'statistics', 'data-visualization', 'power-bi', 'tableau', 'git'
    )),
    level text not null check (level in ('not-yet', 'learning', 'comfortable')),
    primary key (user_id, skill_id)
);

alter table public.profiles enable row level security;
alter table public.user_skills enable row level security;

create policy profiles_owner on public.profiles
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy user_skills_owner on public.user_skills
    for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

revoke all on public.profiles, public.user_skills from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_skills to authenticated;

create function public.touch_profile_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profile_updated_at before update on public.profiles
    for each row execute function public.touch_profile_updated_at();

create function public.save_my_profile(
    p_display_name text,
    p_education text,
    p_experience text,
    p_skills jsonb
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
    owner_id uuid := auth.uid();
    result jsonb;
begin
    if owner_id is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;
    if jsonb_typeof(p_skills) is distinct from 'array' then
        raise exception 'Skills must be an array' using errcode = '22023';
    end if;
    if jsonb_array_length(p_skills) > 11 then
        raise exception 'Too many skills' using errcode = '22023';
    end if;

    insert into public.profiles (user_id, display_name, education, experience)
    values (owner_id, trim(p_display_name), trim(p_education), trim(p_experience))
    on conflict (user_id) do update set
        display_name = excluded.display_name,
        education = excluded.education,
        experience = excluded.experience;

    -- The upsert above locks the profile row, serializing simultaneous saves.
    -- Any invalid/duplicate skill rolls back the entire transaction.
    delete from public.user_skills where user_id = owner_id;
    insert into public.user_skills (user_id, skill_id, level)
    select owner_id, skill_id, level
    from jsonb_to_recordset(p_skills) as skill(skill_id text, level text);

    select jsonb_build_object(
        'display_name', p.display_name,
        'education', p.education,
        'experience', p.experience,
        'target_role', p.target_role,
        'updated_at', p.updated_at,
        'skills', coalesce((
            select jsonb_agg(jsonb_build_object('skill_id', s.skill_id, 'level', s.level) order by s.skill_id)
            from public.user_skills s where s.user_id = owner_id
        ), '[]'::jsonb)
    ) into result from public.profiles p where p.user_id = owner_id;
    return result;
end;
$$;

revoke all on function public.touch_profile_updated_at() from public, anon, authenticated;
revoke all on function public.save_my_profile(text, text, text, jsonb) from public, anon;
grant execute on function public.save_my_profile(text, text, text, jsonb) to authenticated;

commit;
