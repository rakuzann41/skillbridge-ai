-- Step 5. Apply after 202610190002_demo_analyses.sql.
-- One roadmap per account; immutable reviewed content; completion via owner-scoped RPCs.
begin;

create table public.roadmap_stage_catalog (
    stage_key text primary key check (stage_key in ('python','sql','excel','pandas','visualization','project')),
    title text not null,
    description text not null,
    outcome text not null,
    skill_ids jsonb not null check (jsonb_typeof(skill_ids) = 'array'),
    resources jsonb not null check (jsonb_typeof(resources) = 'array')
);

insert into public.roadmap_stage_catalog(stage_key,title,description,outcome,skill_ids,resources)
select stage_key,title,description,outcome,skill_ids,resources from jsonb_to_recordset($catalog$[
  {
    "stage_key": "python",
    "title": "Python fundamentals",
    "description": "Work with variables, lists, loops, and small functions. Practice reading a simple data file.",
    "outcome": "Write a short script that reads records and summarizes a few values.",
    "skill_ids": ["python"],
    "resources": [{"label": "Python tutorial", "url": "https://docs.python.org/3/tutorial/", "note": "Official guide. Some basic programming knowledge is helpful."}]
  },
  {
    "stage_key": "sql",
    "title": "SQL and relational databases",
    "description": "Practice filtering, joins, and grouped summaries. Learn how tables connect through keys.",
    "outcome": "Join two tables and answer a question with a grouped SQL query.",
    "skill_ids": ["sql", "relational-databases"],
    "resources": [{"label": "SQLBolt interactive lessons", "url": "https://sqlbolt.com/", "note": "Browser exercises covering queries, joins, and aggregates."}]
  },
  {
    "stage_key": "excel",
    "title": "Excel and data cleaning",
    "description": "Organize a table, handle missing values and duplicates, and use formulas or a pivot table to summarize it.",
    "outcome": "Create a tidy spreadsheet and document the cleaning decisions you made.",
    "skill_ids": ["excel", "data-cleaning"],
    "resources": [{"label": "Excel help and learning", "url": "https://support.microsoft.com/en-us/excel/", "note": "Microsoft guides for formulas, tables, and data analysis. Software availability varies."}]
  },
  {
    "stage_key": "pandas",
    "title": "pandas and exploratory analysis",
    "description": "Load a table, inspect types and missing values, and explore distributions and grouped summaries.",
    "outcome": "Create a notebook with a cleaned dataset and three evidence-based observations.",
    "skill_ids": ["pandas", "statistics"],
    "resources": [{"label": "pandas getting started", "url": "https://pandas.pydata.org/docs/getting_started/", "note": "Official introductions and practical tutorials. Use after Python fundamentals."}]
  },
  {
    "stage_key": "visualization",
    "title": "Data visualization and Power BI",
    "description": "Choose charts that answer a clear question. Keep titles, labels, and comparisons easy to read.",
    "outcome": "Build a small report with two useful charts and a concise explanation of what they show.",
    "skill_ids": ["data-visualization", "power-bi", "tableau"],
    "resources": [{"label": "Microsoft Learn for Power BI", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "note": "Official learning paths. You can practice the chart principles with a spreadsheet too."}]
  },
  {
    "stage_key": "project",
    "title": "A small portfolio analysis",
    "description": "Choose a dataset and a focused question. Bring together cleaning, queries, analysis, and a readable explanation.",
    "outcome": "Finish a small analysis with the source, methods, limitations, and findings documented. Keep a simple version history.",
    "skill_ids": ["git"],
    "resources": [{"label": "Kaggle datasets", "url": "https://www.kaggle.com/datasets", "note": "Choose a manageable dataset and check its license. Some downloads require an account."}, {"label": "pandas tutorial examples", "url": "https://pandas.pydata.org/docs/getting_started/", "note": "Use the tutorial data if you prefer to begin with a small example."}]
  }
]
$catalog$::jsonb)
as s(stage_key text,title text,description text,outcome text,skill_ids jsonb,resources jsonb);

alter table public.analyses add constraint analyses_id_user_unique unique (id, user_id);
create table public.roadmaps (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    target_role text not null default 'Junior Data Analyst' check (target_role = 'Junior Data Analyst'),
    template_version text not null default 'junior-da-v1' check (template_version = 'junior-da-v1'),
    source_analysis_id uuid,
    profile_skills jsonb not null check (jsonb_typeof(profile_skills) = 'array' and jsonb_array_length(profile_skills) <= 11),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    foreign key (source_analysis_id, user_id) references public.analyses(id, user_id)
);
create index roadmaps_analysis_idx on public.roadmaps(source_analysis_id);
create table public.roadmap_items (
    id uuid primary key default gen_random_uuid(),
    roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
    stage_key text not null references public.roadmap_stage_catalog(stage_key),
    position integer not null check (position between 1 and 6),
    completed boolean not null default false,
    completed_at timestamptz,
    unique (roadmap_id, stage_key),
    unique (roadmap_id, position),
    check (completed = (completed_at is not null))
);

alter table public.roadmap_stage_catalog enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_items enable row level security;
create policy roadmap_catalog_read on public.roadmap_stage_catalog for select to authenticated using (true);
create policy roadmaps_read_owner on public.roadmaps for select to authenticated using ((select auth.uid()) = user_id);
create policy roadmap_items_read_owner on public.roadmap_items for select to authenticated
    using (exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.user_id = (select auth.uid())));
revoke all on public.roadmap_stage_catalog, public.roadmaps, public.roadmap_items from anon, authenticated;
grant select on public.roadmap_stage_catalog, public.roadmaps, public.roadmap_items to authenticated;

create function public.get_my_roadmap()
returns jsonb language sql stable security invoker set search_path = '' as $$
    select jsonb_build_object(
        'id', r.id, 'target_role', r.target_role, 'template_version', r.template_version,
        'source_analysis_id', r.source_analysis_id, 'source_type', a.source_type, 'analyzed_at', a.created_at,
        'profile_skills', r.profile_skills, 'created_at', r.created_at, 'updated_at', r.updated_at,
        'items', (select jsonb_agg(jsonb_build_object(
            'id', i.id, 'stage_key', i.stage_key, 'position', i.position,
            'completed', i.completed, 'completed_at', i.completed_at,
            'title', c.title, 'description', c.description, 'outcome', c.outcome,
            'skill_ids', c.skill_ids, 'resources', c.resources
        ) order by i.position) from public.roadmap_items i join public.roadmap_stage_catalog c using (stage_key) where i.roadmap_id = r.id)
    ) from public.roadmaps r left join public.analyses a on a.id = r.source_analysis_id and a.user_id = r.user_id
    where r.user_id = (select auth.uid());
$$;

create function public.create_my_roadmap(p_source_analysis_id uuid, p_stage_order text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
    owner_id uuid := auth.uid();
    roadmap_id uuid;
    saved_skills jsonb;
begin
    if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
    -- Serializes first creation and preserves an existing plan, including completed work.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text, 0));
    select id into roadmap_id from public.roadmaps where user_id = owner_id;
    if roadmap_id is not null then return roadmap_id; end if;
    if p_stage_order is null or pg_catalog.array_ndims(p_stage_order) <> 1
        or pg_catalog.array_lower(p_stage_order, 1) <> 1 or pg_catalog.array_length(p_stage_order, 1) <> 6
        or pg_catalog.cardinality(p_stage_order) <> 6
        or (select count(distinct s.stage_key) from pg_catalog.unnest(p_stage_order) as s(stage_key)) <> 6
        or exists (select 1 from pg_catalog.unnest(p_stage_order) as s(stage_key) where s.stage_key is null or not exists (select 1 from public.roadmap_stage_catalog c where c.stage_key = s.stage_key))
        or pg_catalog.array_position(p_stage_order, 'python') > pg_catalog.array_position(p_stage_order, 'pandas')
        or p_stage_order[6] <> 'project'
    then raise exception 'Invalid stage order' using errcode = '22023'; end if;
    if p_source_analysis_id is not null then
        select profile_skills into saved_skills from public.analyses where id = p_source_analysis_id and user_id = owner_id;
        if saved_skills is null then raise exception 'Analysis unavailable' using errcode = '42501'; end if;
    else
        if not exists (select 1 from public.profiles where user_id = owner_id) then
            raise exception 'Save profile first' using errcode = '22023';
        end if;
        select coalesce(jsonb_agg(jsonb_build_object('skill_id', s.skill_id, 'level', s.level) order by s.skill_id), '[]'::jsonb)
            into saved_skills from public.user_skills s where s.user_id = owner_id;
    end if;
    insert into public.roadmaps(user_id, source_analysis_id, profile_skills)
        values (owner_id, p_source_analysis_id, saved_skills) returning id into roadmap_id;
    insert into public.roadmap_items(roadmap_id, stage_key, position)
        select roadmap_id, stage_key, position::integer from pg_catalog.unnest(p_stage_order) with ordinality as stage(stage_key, position);
    return roadmap_id;
end;
$$;

create function public.set_my_roadmap_item(p_item_id uuid, p_completed boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
    owner_id uuid := auth.uid();
    owned_roadmap uuid;
begin
    if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
    if p_completed is null then raise exception 'Completion required' using errcode = '22023'; end if;
    select r.id into owned_roadmap from public.roadmaps r join public.roadmap_items i on i.roadmap_id = r.id
        where i.id = p_item_id and r.user_id = owner_id for update of r;
    if owned_roadmap is null then return false; end if;
    update public.roadmap_items set completed = p_completed,
        completed_at = case when p_completed then coalesce(completed_at, now()) else null end
        where id = p_item_id and roadmap_id = owned_roadmap;
    update public.roadmaps set updated_at = now() where id = owned_roadmap;
    return true;
end;
$$;

revoke all on function public.get_my_roadmap() from public, anon;
revoke all on function public.create_my_roadmap(uuid, text[]) from public, anon;
revoke all on function public.set_my_roadmap_item(uuid, boolean) from public, anon;
grant execute on function public.get_my_roadmap() to authenticated;
grant execute on function public.create_my_roadmap(uuid, text[]) to authenticated;
grant execute on function public.set_my_roadmap_item(uuid, boolean) to authenticated;
commit;
