-- Step 6. Apply after migrations 001–003. Existing analyses and roadmap progress are preserved.
begin;

alter table public.analyses
    add column vacancy_snapshot jsonb,
    add column snapshot_signature text;

alter table public.analyses drop constraint analyses_source_type_check;
alter table public.analyses drop constraint analyses_dataset_version_check;
alter table public.analyses add constraint analyses_source_type_check
    check (source_type in ('csv_demo', 'live_api'));
alter table public.analyses add constraint analyses_source_snapshot_check check (
    (source_type = 'csv_demo' and dataset_version = 'synthetic-da-v1'
        and vacancy_snapshot is null and snapshot_signature is null)
    or
    (source_type = 'live_api' and dataset_version = 'headhunter-snapshot-v1'
        and sample_limit <= 10 and vacancy_snapshot is not null
        and jsonb_typeof(vacancy_snapshot) = 'object'
        and octet_length(vacancy_snapshot::text) <= 1048576
        and snapshot_signature is not null and snapshot_signature ~ '^[a-f0-9]{64}$')
);

-- Ownership RLS remains active. Facts are authenticated by FastAPI using a private
-- HMAC key before use; the public key and a user's JWT cannot forge that signature.
-- No scores, mutable snapshots, owner changes, or privileged browser credentials.
grant insert (source_type, dataset_version, vacancy_snapshot, snapshot_signature)
    on public.analyses to authenticated;

commit;
