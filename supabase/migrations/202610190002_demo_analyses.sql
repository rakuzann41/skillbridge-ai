-- Step 3. Apply after 202610190001_profiles_and_skills.sql. No new secret key.
begin;

create table public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    source_type text not null default 'csv_demo' check (source_type = 'csv_demo'),
    sample_limit integer not null check (sample_limit between 1 and 50),
    profile_skills jsonb not null check (
        jsonb_typeof(profile_skills) = 'array' and jsonb_array_length(profile_skills) <= 11
    ),
    dataset_sha256 text not null check (dataset_sha256 ~ '^[a-f0-9]{64}$'),
    dataset_version text not null default 'synthetic-da-v1' check (dataset_version = 'synthetic-da-v1'),
    algorithm_version text not null default 'skill-overlap-v1' check (algorithm_version = 'skill-overlap-v1'),
    extraction_version text not null default 'canonical-aliases-v1' check (extraction_version = 'canonical-aliases-v1')
);

create index analyses_user_created_idx on public.analyses (user_id, created_at desc);
alter table public.analyses enable row level security;
create policy analyses_select_owner on public.analyses for select to authenticated
    using ((select auth.uid()) = user_id);
create policy analyses_insert_owner on public.analyses for insert to authenticated
    with check ((select auth.uid()) = user_id);

revoke all on public.analyses from anon, authenticated;
grant select on public.analyses to authenticated;
-- IDs, timestamps and version labels are database generated. Snapshots cannot be
-- updated or deleted through the public Data API. No scores or vacancy facts are
-- accepted/stored: FastAPI computes them from the pinned server-owned dataset.
grant insert (user_id, sample_limit, profile_skills, dataset_sha256)
    on public.analyses to authenticated;

commit;
