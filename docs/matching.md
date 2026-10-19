# Deterministic demo analysis, version 1

This milestone compares self-reported confidence with **recognized skill mentions in a synthetic CSV**. It does not analyze real market demand, verify competence, or predict hiring. No Gemini or other LLM participates in normalization, extraction, counts, scores, or explanations.

## Source and normalization

The only enabled source is `csv_demo`, with dataset version `synthetic-da-v1`. All eight records are authored fictional fixtures. There are no live employers, application URLs, or invented publication dates. See [dataset provenance](../backend/data/README.md).

The provider implements a small `JobProvider` interface. It returns normalized records before the matching service runs. A future provider can feed the same normalized vacancy/skill structures without changing the score formula. The current API intentionally rejects live sources and client-provided paths or datasets.

- UTF-8 or UTF-8 BOM; standard CSV quoting. Required columns: `external_id,title,description`.
- Select the first N valid, unique records in file order: default 8, maximum 50. This is not random sampling.
- Read at most 1 MiB and examine at most 100 rows; reject parse/encoding failures rather than claiming a partial successful sample.
- Skip empty IDs/titles, duplicate source IDs, malformed rows, or overlong fields. Record the skipped count separately from sample size.
- Preserve available employer, location, description, experience, safe HTTP(S) URL, and publication date. Missing values remain unknown. Omit unsafe URLs and invalid dates with warnings. Date-only values remain dates; datetime values need an explicit timezone.
- Convert HTML to plain text and drop script/style contents. No vacancy HTML is rendered or executed.
- Return source labels and a SHA-256 fingerprint of the CSV bytes. Never call a demo vacancy active/current.

## Extraction: `canonical-aliases-v1`

The vocabulary matches the 11 skills accepted by the profile API. Common aliases include `PowerBI` → Power BI, `MS Excel` → Excel, and `Postgres`/`PostgreSQL` → relational databases.

1. Normalize case, Unicode compatibility characters, and whitespace for matching.
2. Prefer exact reviewed aliases in structured tags (`|` separated in this CSV).
3. Supplement with whole-word/phrase matches in plain-text descriptions. Do not extract from job titles or arbitrary generic words.
4. Deduplicate by canonical skill ID. Structured evidence wins over description evidence.
5. Return one evidence record per skill: canonical ID/name, source field, matched alias, and `requirement_status: mentioned`.

Related skills are not invented: pandas alone does not add Python; PostgreSQL alone does not add SQL. Word boundaries avoid matching Git inside GitHub, SQL inside NoSQL/SQLAlchemy, or Excel inside “excellent.” Unknown tags are ignored.

As a conservative negation heuristic, description clauses containing `no`, `not`, `without`, `never`, or `unnecessary` are omitted. Clauses split on `. ; ! ?`, newlines, and `but`. For example, “Python is not required, but SQL is required” yields SQL only. Structured tags still take precedence. This is deliberately simple and can miss positive or nuanced mentions; it is not a full language/requirements parser. English aliases are supported in this first version. Change the extraction version when these rules change.

No reliable required/preferred distinction is extracted in this version. All recognized mentions have equal weight, including a positive optional mention. Consequently, the metric is explicitly skill-mention overlap rather than a comprehensive job-fit assessment.

## Score: `skill-overlap-v1`

For each distinct recognized vacancy skill, map the user's saved confidence to credit:

| Confidence | Credit |
| --- | ---: |
| Comfortable | 1 |
| Learning | 0.5 |
| Not yet, or absent from the profile | 0 |

```
score = 100 × earned credits / number of distinct recognized vacancy skills
```

Example: a fixture mentions SQL, Python, and Excel. The user is comfortable with SQL, learning Python, and has not explored Excel. Credits are `1 + 0.5 + 0 = 1.5`; score is `100 × 1.5 / 3 = 50.0%`.

This weighting is an explicit product heuristic, not a validated conversion from confidence to ability. Arithmetic uses integer half-credit units and Python `Decimal`; percentages use one decimal and `ROUND_HALF_UP`. The same canonical inputs give the same score. Repeating a skill does not increase its weight, and unrelated user skills do not increase the score.

Vacancies with zero recognized skills have `score: null` and an insufficient-data explanation. A vacancy with recognized skills and no overlap has an actual `0.0` score. These cases are not interchangeable.

Each result partitions recognized skills into comfortable/matching, developing/learning, and missing/not-yet. The API supplies counts, earned credits, and a deterministic explanation. The UI only formats those results; it never calculates or accepts scores from a client.

Rank by descending numeric score; unscored records appear last. Break ties by source and external ID. Order demand by descending count, then canonical skill ID.

## Sample statistics and gaps

Count each canonical skill at most once per successfully normalized vacancy. Divide by the number of successfully normalized/analyzed records, **including valid records with zero recognized skills**. Skipped or duplicate rows do not enter the denominator. Return `sample_size`, `scorable_count`, `rows_examined`, `skipped_rows`, analysis time, and warnings so the distinction is visible.

For example, two SQL mentions across three valid vacancies produce `2/3 = 66.7%`, even if the third record has no recognized skills. This is a statement about those fixtures only. It is not a labor-market statistic.

Strengths are sample-mentioned skills marked comfortable; developing skills are marked learning; missing skills are not-yet/unlisted. Skills absent from the sample are not claimed as sample-supported gaps. The first demo dataset deliberately includes one unscorable record.

## Account-specific replay

`POST /analyses` accepts only `{"source":"csv_demo","sample_limit":8}`. FastAPI verifies the session, loads that user's saved profile, reads the server-owned CSV, and persists an analysis input snapshot. An unsaved profile must be saved first; all-not-yet or empty saved profiles are allowed.

The `analyses` table stores the owner, generated ID/time, profile skill snapshot, sample limit, dataset fingerprint/version, and scoring/extraction versions. It does **not** accept or store client-authored scores, demand statistics, vacancy facts, or explanations. FastAPI reconstructs those values from the fingerprinted source on every read. This keeps the stored record small and avoids treating editable client output as truth.

`GET /analyses/{id}` applies owner filtering and RLS and recomputes using the saved skill snapshot, not the current profile. Another account receives 404. Table privileges allow insertion of input columns and selection of owned records; no browser updates/deletes or caller-chosen version/time columns are granted.

If CSV bytes or supported algorithm/extraction versions change, replay returns 409 instead of silently changing a historical comparison. Original inputs remain in place. This first version ships only one dataset version; retaining old datasets/algorithm implementations can be added when needed. Scores remain deterministic; different runs naturally have different IDs and analysis times.

This service only creates analyses on an explicit user action. It never runs on profile load, modifies profile skills, or resets roadmap progress. Gemini and HeadHunter are not called.
