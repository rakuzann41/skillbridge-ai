# SkillBridge AI

Turn real job-market requirements into a clear, personalized next-step plan.

A focused career-guidance MVP for students and early-career candidates pursuing **Junior Data Analyst** roles. [AGENTS.md](AGENTS.md) is the project source of truth.

## Current milestone: deployment preparation; HeadHunter access pending

- Next.js App Router landing page with TypeScript and Tailwind CSS.
- Email/password sign-up, confirmation handling, sign-in, and sign-out using Supabase Auth.
- An authenticated profile editor at `/setup`, with optional display name, education, experience, and confidence levels for 11 canonical skills.
- Profile review, an explicit save action, useful loading/error states, and restoration from PostgreSQL on return visits.
- FastAPI verifies every private request with Supabase Auth. The Data API receives that same user's access token, so Row Level Security (RLS) also applies.
- One PostgreSQL function saves the profile and replaces the skills in a single transaction.
- A bounded CSV provider with eight explicitly fictional vacancies, conservative canonical skill extraction, and versioned deterministic scoring.
- Account-owned analysis input snapshots, restored on refresh independently of later profile edits.
- A compact `/analysis` screen with demo labels, sample counts, skill gaps, score explanations, and extraction evidence.
- One private six-stage `/roadmap` checklist with reviewed resources, practice outcomes, completion/undo, and a compact progress summary.
- An official HeadHunter provider with bounded requests, timeouts, access/rate-limit errors, signed saved snapshots, and an explicit Demo CSV alternative. Real API access awaits an approved application and backend configuration.
- A single-service Docker/Render deployment configuration. See [the deployment guide](docs/deployment.md). A successful local build does not confirm public deployment.

Without HeadHunter credentials, the available working source is the synthetic demo CSV. It contains fictional vacancies and is labeled throughout. Gemini remains a later milestone. Skill confidence and stage completion are self-reported; a match score is recognized skill overlap, not hiring probability.

## Architecture

### Language and appearance

The header offers English, Қазақша (Kazakh), and Русский (Russian), plus a light/dark theme toggle. The initial theme follows the device preference. Both choices are saved in first-party preference cookies for one year in the current browser; they do not require new credentials or database migrations. Server-rendered content, document language, and page metadata use the language cookie, while language changes preserve the current form state.

Interface copy, skill descriptions, results explanations, roadmap guidance, and app messages are translated through `frontend/lib/messages.ts`. Dates and decimal numbers follow the selected language. Vacancy titles/descriptions and user-entered text retain their original language; external learning resources may use another language. Canonical skill IDs, scores, resource URLs, and account progress are independent of the display language.

The shared palette in `frontend/app/preferences.css` supplies both themes. Preference tests check translation placeholders, coverage of current UI/catalog content, and WCAG AA contrast for normal text on the main surfaces. Keyboard focus and the existing responsive layout remain available.

| Area | Technology | Responsibility |
| --- | --- | --- |
| Interface | Next.js, TypeScript, Tailwind CSS | Public pages, auth forms, profile editing, basic demo analysis |
| Identity | Supabase Auth JavaScript SDK | Email/password authentication, browser session persistence and refresh |
| API | Python, FastAPI, Pydantic, httpx | Token verification, validation, normalization, deterministic extraction/scoring |
| Storage | Supabase PostgreSQL and Data API | Profiles, skills, immutable analysis inputs, one roadmap per account, checklist progress, ownership policies |
| Job sources | Synthetic CSV and configured HeadHunter API | Bounded, clearly labeled samples behind a provider interface |
| Explanations (later) | Gemini in FastAPI | Explain deterministic results without inventing facts or scores |

The SDK manages the auth session in browser storage and auto-refreshes tokens. Private profile data is fetched only from FastAPI; it is never embedded in public/static HTML. A browser redirect is a usability gate, not the authorization boundary: the API verifies the bearer token through `/auth/v1/user` on every request, and PostgreSQL policies enforce `auth.uid() = user_id`.

There are no custom password tables, server-role credentials, decoded-but-unverified JWTs, or client-submitted owner IDs. FastAPI forwards the verified user's JWT to the Data API using the public project key. Sign-out ends this browser's Supabase session and clears the profile editor. On account changes, a fresh editor loads that account's data. Previously issued access tokens can remain valid until they expire, as with normal Supabase sessions; signing out is not a promise of instant JWT revocation.

Frontend and backend are separate processes. Requests time out, upstream error details are not returned to the browser, and profile responses use `Cache-Control: no-store`. A failed initial load never opens a blank editable form that could overwrite existing data. A save failure keeps the draft available for retry. Unsaved drafts are not persisted and are discarded when leaving the profile editor or signing out; browser refresh/close warns when possible.

The dev/build scripts select Next.js's supported webpack option because the default Turbopack CSS worker failed on this Windows environment. The visual system remains warm neutral surfaces, deep green actions, thin borders, and restrained typography.

## Supabase setup

### 1. Create a project and get two public settings

In the [Supabase dashboard](https://supabase.com/dashboard), create a project. Keep its database password private. Once ready, the project's **Connect** dialog provides:

- **Project URL**, such as `https://your-project.supabase.co`.
- **Publishable key**, starting with `sb_publishable_`. A legacy `anon` key also works.

No service-role key, database password, JWT secret, or Gemini key is needed. CSV analysis needs no HeadHunter credentials. Live access needs its approved application's token and contact header in the backend only. Do not put secrets in `NEXT_PUBLIC_*` variables.

### 2. Configure the local environment

From the repository root, copy these examples if local files do not already exist:

```powershell
if (-not (Test-Path frontend/.env.local)) { Copy-Item frontend/.env.example frontend/.env.local }
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `frontend/.env.local`. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env` to the same project's values. The API URL defaults to `http://127.0.0.1:8000`; the frontend origin defaults to `http://127.0.0.1:3000`.

These local files are ignored by Git. The example files intentionally contain no real values. FastAPI loads `backend/.env` using its absolute project location. Restart the processes after changing environment values; rebuild a production frontend after changing `NEXT_PUBLIC_*` values because they are bundled at build time.

Without Supabase settings the public landing page still works, account pages show a connection notice, and the API rejects private access. Analysis service tests can still run locally. There is no local fake account or fake-save fallback.

### 3. Apply the migration

Open **SQL Editor → New query** in your Supabase project. Copy the entire contents of [the migration](supabase/migrations/202610190001_profiles_and_skills.sql), then click **Run**. Run it once on the new project. Do not rerun it if the tables already exist; inspect the current schema first.

The migration creates:

- `profiles`: a primary key/FK to `auth.users`, fixed target role, bounded text fields, timestamps.
- `user_skills`: a profile FK, canonical skill/level constraints, and a composite primary key preventing duplicates.
- RLS ownership policies on both tables; anonymous access has no grants.
- `save_my_profile`: an authenticated, **security invoker** function that derives the owner from `auth.uid()`, with no owner parameter. Invalid skill data rolls the entire save back. Concurrent saves serialize on the profile row.

For step 3, run [202610190002_demo_analyses.sql](supabase/migrations/202610190002_demo_analyses.sql) once in the same SQL Editor, after the profile migration. It creates the owner-scoped `analyses` input table and grants only selection and insertion of allowed input columns. Browser callers cannot update saved snapshots or choose generated IDs, timestamps, or version labels. No extra environment variables or secret keys are required. Existing profiles and skills are preserved.

For step 5, run [202610190003_roadmap_progress.sql](supabase/migrations/202610190003_roadmap_progress.sql) once after the analysis migration. It adds a reviewed stage catalog, one `roadmaps` row per account, six unique ordered `roadmap_items`, RLS, and three narrowly scoped functions. Authenticated users may read their own plan but cannot directly edit content, resource URLs, owners, order, or completion timestamps. Creation and completion functions derive ownership from `auth.uid()`; they use a fixed empty search path and perform explicit owner checks. First creation is serialized per user, and item changes serialize on that user's roadmap row. No new secrets or environment variables are needed. Existing profile and analysis records are preserved.

The [optional roadmap SQL assertions](supabase/tests/roadmaps_rls.sql) exercise real PostgreSQL permissions, creation, idempotent completion, undo, and two-account ownership. Run separately as postgres after migration 003; all temporary fixtures are rolled back. Mocked API tests do not prove these hosted policies.

For this version, apply [202610190004_live_analysis_snapshots.sql](supabase/migrations/202610190004_live_analysis_snapshots.sql) once after migrations 001–003. It adds bounded live snapshots and signatures while preserving existing rows and ownership rules. New code selects these columns even for old CSV analyses, so apply it before deploying. Algorithm/extraction versions, IDs, timestamps, and saved rows remain immutable to the client. A private server HMAC key authenticates fetched vacancy facts and their associated profile snapshot before replay; RLS alone does not prove the authenticity of a caller-inserted snapshot. Never expose or regenerate this key casually: saved live results require the same key. Render generates it at initial service creation; local setup can generate it with the helper below.

### 4. Configure authentication URLs

Under **Authentication → URL Configuration** set:

- **Site URL**: `http://127.0.0.1:3000`
- **Redirect URLs**: `http://127.0.0.1:3000/auth/confirm` and `http://localhost:3000/auth/confirm`

Leave email/password sign-up enabled. With email confirmation enabled, the app asks the user to check their inbox before continuing. Use the default confirmation email template (`{{ .ConfirmationURL }}`) for this browser-managed flow. A custom SSR token-hash template would need a different callback implementation.

The browser SDK handles the confirmation redirect's token fragment. The app redirects to the fixed local `/setup` path after authentication and does not accept an arbitrary `next` URL. If an email link is expired or no session arrives, the callback offers sign-in/account creation.

If confirmation emails do not arrive, check the project's email delivery settings and [Supabase custom SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp). Provider limits and project email policies still apply. Do not disable RLS to troubleshoot email delivery.

## Run locally (PowerShell)

Prerequisites: Node.js 20.9 or newer with npm, Python 3.11 or newer. Checked with Node.js 24 and Python 3.14.

From the repository root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open [the website](http://127.0.0.1:3000). In a second terminal, from the repository root:

```powershell
python -m venv backend/.venv
cd backend
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Use [sign-up](http://127.0.0.1:3000/sign-up), [sign-in](http://127.0.0.1:3000/sign-in), or [your profile](http://127.0.0.1:3000/setup). API [health](http://127.0.0.1:8000/health) and [interactive documentation](http://127.0.0.1:8000/docs) remain available. Stop either process with `Ctrl+C`.

Save a profile, then use **Try demo skill analysis**, or open [the analysis screen](http://127.0.0.1:3000/analysis). Choose **Analyze vacancies**. The source is identified as **Demo CSV**, using fictional examples. The saved result has an account-private URL at `/analysis/{id}`; bookmark that URL to return to the same comparison. A full history/dashboard view is not part of this step.

The results have three keyboard-accessible views:

- **Skill gaps:** the highest-frequency gap, three initial priorities, confidence filters, expanded priorities, and comfortable skills. Priorities use mention counts; ties use the canonical skill ID, without changing overlap scores.
- **Job matches:** the backend ranking, matching/learning/missing skills, scored/unscored filters, and expandable exact credit calculations with source evidence. Zero overlap remains a scored result; missing skill evidence remains unscored.
- **How it works:** the confidence weights, formula, complete sample counts, source/version details, and limitations.

Session restoration, loading a result, and creating a comparison have distinct loading messages. Missing/private or invalid links offer a new analysis; version conflicts offer a fresh comparison; unsaved profiles link to setup; expired sessions offer sign-in renewal; transient failures offer retry. Pending requests are cancelled when leaving the view or changing accounts. Error screens never display raw server diagnostics. Route-level loading and error boundaries cover page transitions and unexpected render failures. There are no additional environment variables or migrations for this refinement.

## Demo analysis and score formula

The bundled [CSV](backend/data/demo_junior_data_analyst.csv) contains eight authored fictional examples, not HeadHunter listings. Its [provenance and format](backend/data/README.md) and the full [matching specification](docs/matching.md) are documented separately.

Algorithm `skill-overlap-v1` uses:

```
100 × (comfortable skill count + 0.5 × learning skill count)
    / distinct recognized vacancy skills
```

Not-yet/unlisted skills earn 0. Scores use one decimal with half-up rounding. This confidence weighting is an explicit heuristic, not verified proficiency. Zero recognized skills produces `null`/“Unscored,” rather than an invented precise score. Source tags and descriptions establish **mentions**, without mandatory/preferred weighting.

Extraction `canonical-aliases-v1` prefers exact structured aliases, supplements them with conservative whole-word matches in plain-text descriptions, and returns evidence. Duplicate mentions count once per vacancy. Obvious negated description clauses are omitted; nuanced language may be missed. No related skills are inferred: pandas does not automatically add Python, for example.

Skill mention percentages use the successfully normalized sample as denominator, including valid records with no recognized skills, and excluding skipped/duplicate rows. They describe this fictional sample only. The provider reads at most 1 MiB, scans at most 100 rows, and returns at most 50 records. There are no uploads, client-selected CSV paths, scraping, live-job claims, or AI calculations.

Saved analyses contain canonical profile skill inputs, source/version metadata, and the CSV SHA-256 fingerprint. Scores and vacancy facts are **recomputed from server-owned data**, never accepted from stored client output. Later profile changes do not alter earlier analyses. If the dataset bytes or supported versions change, replay returns 409 rather than silently changing results. This initial build ships one dataset version; retaining old versions is a later extension.

## Learning roadmap

Open **My roadmap** from the account navigation or **Open my roadmap** from results. Before first creation, choose **Create my roadmap**. Opening the page alone never creates a plan. Results pass their saved analysis ID so FastAPI can compute the initial order from that owned sample. Without an analysis, the default foundation order is used.

There is one plan per account. `POST /roadmap` is idempotent: an existing plan is returned before another analysis is considered. New analyses, profile edits, and page loads never regenerate items or reset progress. Starting confidence and the source analysis reference are saved with the plan. No automatic completion is inferred from confidence. This version has no reset/reorder command.

The reviewed [catalog](backend/data/roadmap_v1.json), also seeded into PostgreSQL by migration 003, contains six concise stages with practice outcomes and HTTPS resources. Catalog version `junior-da-v1` is immutable to app users. The API checks returned content against that version before rendering links. Python documentation, SQLBolt, pandas, Microsoft Excel help, Microsoft Learn Power BI, and the Kaggle dataset directory were checked during implementation on 2026-10-19. The Python tutorial assumes some programming basics; resource notes explain this and software/account considerations. Links open in a new tab with safe `rel` attributes and an accessible announcement.

For an analysis-based plan, each stage's initial priority is the sum of vacancy mention counts for its learning/not-yet skills. Each skill contributes its per-vacancy count, so this sum is a priority weight, not a distinct-vacancy count or displayed market statistic. A stable prerequisite-aware order chooses the greatest available weight, breaking ties by default catalog order. Python stays before pandas; the project stays last. This does not change any job score. Practice-focus labels use the confidence snapshot saved at creation. Replaying the roadmap does not depend on continued CSV availability.

Each checkbox sends only an item ID and strict completion boolean to FastAPI. PostgreSQL verifies the owner and sets or clears the completion timestamp. Repeating completion preserves its original timestamp. The response supplies the full confirmed checklist; the UI does not optimistically claim a save. During a save, other toggles are paused. A failed/unconfirmed change keeps the last confirmed view and requires a reload before more changes, because a timed-out write may still have reached the database.

The compact progress summary shows completed/total stages, the nearest whole percentage (half up), and the first incomplete stage in saved order. Completion is self-reported practice, not verified competence. All stages remain available and completion can be undone. The checklist uses native labeled checkboxes, a semantic ordered list, visible keyboard focus, descriptive external links, and readable scoped text sizes without redesigning existing pages.

## API contract

| Endpoint | Authentication | Behavior |
| --- | --- | --- |
| `GET /health` | Public | Process health, independent of Supabase |
| `GET /profile` | Supabase bearer token | Current user's profile and skills; empty defaults before first save |
| `PUT /profile` | Supabase bearer token | Save profile and replace its skill list atomically |
| `POST /analyses` | Supabase bearer token | Analyze a demo sample using the saved profile; persist inputs |
| `GET /analyses/{id}` | Supabase bearer token | Restore an owned analysis from its pinned source and inputs |
| `GET /roadmap` | Supabase bearer token | Saved roadmap, or JSON `null` before creation; never creates or resets data |
| `POST /roadmap` | Supabase bearer token | Create one roadmap from an optional owned `analysis_id`; return the existing roadmap if already present |
| `PUT /roadmap/items/{id}` | Supabase bearer token | Set only `completed` (strict boolean), including undo; return the confirmed roadmap |

Example `PUT /profile` body (all text fields are optional; `skills` is required):

```json
{
  "display_name": "Example student",
  "education": "Studying economics",
  "experience": "",
  "target_role": "Junior Data Analyst",
  "skills": [{ "skill_id": "sql", "level": "learning" }]
}
```

The response includes the saved fields plus nullable `updated_at`. Confidence levels are `not-yet`, `learning`, and `comfortable`. Empty skills are valid; the UI defaults unlisted skills to `not-yet` and saves all 11 current selections. Unknown skills/levels, duplicates, oversized fields, alternate roles, or extra fields such as `user_id` produce 422. Missing/invalid tokens return 401; unavailable auth/storage returns 503. No other user's ID can be selected in the request body.

`POST /analyses` requires an explicit source and optionally a bounded integer sample limit:

```json
{ "source": "csv_demo", "sample_limit": 8 }
```

For configured live access, use `{ "source": "headhunter", "sample_limit": 8, "accept_hh_terms": true }`. Live limits are 1–10; CSV limits remain 1–50. Client-supplied skills, scores, paths, owners, vacancies, or unknown fields are rejected with 422. An unsaved profile returns 409; a saved empty profile is valid. Unknown or another account's analysis ID returns 404. Source failures return a safe 503 with a bounded code and `fallback_available: true` where applicable; no CSV result is automatically created. Storage failures never claim a saved result. Successful responses include source labels, fingerprint/versions, analysis and fetch times, sample/scorable counts, demand, gaps, and per-vacancy evidence. Responses use `Cache-Control: no-store`.

## HeadHunter application setup

1. Sign in to [the developer portal](https://dev.hh.ru/admin) yourself and register SkillBridge AI. Describe the student/job-seeker audience, limited vacancy analysis, learning roadmap, and account-private saved analysis snapshots accurately. Do not enter HeadHunter account passwords into SkillBridge.
2. Use the public site URL after deployment. Application-token authentication does not use a browser redirect; if the registration form requires a redirect, register the site root for now. No user OAuth callback is implemented. Do not invent a URL or use a domain you do not control.
3. Follow the provider's application approval process. Check its current terms/access conditions; do not purchase paid access for this MVP. Free hosting does not guarantee permanently free third-party API access.
4. After approval, run the following from `backend/` in your own terminal:

```powershell
.venv/Scripts/python.exe scripts/setup_headhunter.py
```

The helper requests the contact email and hidden application client ID/secret, exchanges them once via `POST https://api.hh.ru/token`, and writes only the resulting application token, contact header, and stable signing key to ignored `backend/.env`. It does not store the client secret. Reissuing an application token revokes the prior token: do not rerun unnecessarily. Restart FastAPI afterwards. For deployment, configure `HH_ACCESS_TOKEN` and `HH_USER_AGENT` in Render's environment; do not replace Render's existing `ANALYSIS_SIGNING_KEY` with the local one.

The provider requests one search page of at most 20 candidates and at most 10 detail records, with no automatic retries or scraping. The title search covers English/Russian Data Analyst names, no-experience/1–3-year roles, all regions, and the last 30 days; explicit senior/lead titles, archived, undated, malformed, and stale records are skipped. Requests have five-second per-request timeouts and a 22-second overall collection deadline. Access/CAPTCHA/rate-limit failures stop collection. A single bounded process cache lasts five minutes; a collection gate/cooldown reduces repeated API calls. Multi-worker or multi-instance deployment would need a shared limit before scaling; the provided deployment uses one API process.

Only successfully normalized records enter the denominator; partial samples are labeled and never padded with demo records. Current extraction uses the existing curated vocabulary and does not claim full Russian-language coverage. Scores retain `skill-overlap-v1`. Live results replay from the authenticated saved snapshot rather than refetching changing job data. Original links identify the source, and availability may have changed. Provider approval and its current data-retention/archived-vacancy requirements must be resolved before enabling public live access; the initial deployment leaves live credentials empty. Raw vacancy data must not be forwarded to Gemini or another external AI provider.

## Verification

```powershell
# From frontend/
npm.cmd run build
npm.cmd run typecheck
npm.cmd test

# From backend/
.venv/Scripts/python.exe -m unittest discover -s tests -v
```

API tests use **mocked Supabase HTTP responses** and test identity validation, owner scoping, save/read round trips, replacement of skill values, invalid input, outages, and CORS. They do not prove hosted database persistence or Supabase email delivery.

Frontend presentation tests require Node 22.6+ (Node 24 is used locally). They cover priority ordering/filtering without modifying saved inputs, zero versus null scores, empty samples, and recovery actions without leaking server messages. They run with Node’s built-in test runner and TypeScript stripping; no test dependency is needed.

Analysis service tests cover CSV parsing/normalization limits, aliases, negation, unsafe HTML/links, unknown/duplicate skills, source-independent matching, partial credit, rounding, stable ordering, null versus zero scores, and correct sample denominators. Analysis API tests cover saved-input replay after profile changes, rejected client calculations/paths/owners, version changes, outages, and cross-account filtering. The service tests require no network or provider credentials.

During the step 2 local verification, the production build, TypeScript check, and 18 API tests passed. Against the configured hosted project, anonymous table access and unauthenticated API access were rejected. A real confirmed account successfully saved a test profile, restored it after refresh, updated skill levels, signed out, and restored the updated profile after a new password sign-in. Cross-account database assertions and a second-device check are separate from those checks and must not be assumed to have passed.

Step 3 verification: 58 backend tests passed, as did the frontend production build and TypeScript check. In the browser, the signed-in account created a saved eight-record demo analysis, inspected a credit calculation and extraction evidence, checked the unscored record, and restored the same analysis ID, timestamp, counts, and scores after refresh. The analysis migration was applied to the configured project. The optional two-account PostgreSQL assertion scripts remain separate and were not run during this verification.

Step 4 verification: the production build, TypeScript check, six frontend presentation tests, and all 58 backend regression tests passed. Browser checks covered the existing saved result, confidence filters, expanded priorities, arrow/End keyboard navigation between tabs, exact credit and source-evidence disclosures, the insufficient-data filter, complete sample counts, and a real 404 recovery link back to the analysis entry screen. A new comparison showed its creation loading state, opened a saved eight-record result, and restored the same ID, timestamp, and sample counts after refresh. These checks did not repeat email authentication or the optional hosted two-account SQL assertions.

Step 5 verification: all 70 backend tests and six frontend presentation tests passed, along with the production build and TypeScript checks. The 12 roadmap tests cover prerequisite-aware gap ordering, authenticated ownership, creation/read/complete/undo, idempotent creation, full completion, rejected owner/content/timestamp input, outdated analysis independence, malformed save confirmations, and storage outages. The user confirmed migration 003 succeeded. Against the hosted project, the signed-in account created the six-stage roadmap from its analysis, marked SQL complete using the keyboard, restored 1/6 (17%) after refresh, and opened it with another analysis ID without changing stage identities, source, order, or progress. The test SQL completion was undone. A focused checkbox now retains keyboard focus while a save is pending. A fresh password sign-in, second-device restoration, and the optional two-account PostgreSQL script were not repeated in this step and should not be inferred from mocked tests.

For actual PostgreSQL policy/transaction checks, run [profiles_rls.sql](supabase/tests/profiles_rls.sql) in the SQL Editor after the migration, with the postgres role. It inserts two temporary auth fixtures with no email or password, tests cross-account read/write protection and rollback on invalid saves, then rolls everything back. If any assertion errors, roll back the query/transaction before continuing. These tests never need a service-role key in the application.

The optional [analyses_rls.sql](supabase/tests/analyses_rls.sql) checks analysis ownership and immutable input/version privileges, also within a rolled-back transaction. These hosted two-account SQL assertions must be run separately; passing mocked API tests does not prove hosted RLS behavior.

Before calling step 2 fully verified, check with real accounts:

1. Create an account, confirm email if enabled, and sign in.
2. Enter a profile and several skill levels, review, and save. Only a confirmed response shows success.
3. Refresh; confirm the saved values return. Edit, save, and refresh again.
4. Sign out and sign in again; confirm restoration. A second device should restore the same data.
5. Sign in as a second test account; confirm it does not show the first account's profile. Check the RLS SQL assertions too.

## Next milestones

1. **Foundation:** implemented.
2. **Accounts and profile:** implemented and verified with one real account through sign-up, confirmation, save, update, refresh, sign-out, and a new password sign-in. The two-account SQL test and second-device check remain available for further verification.
3. **Repeatable analysis:** implemented: labeled synthetic CSV provider, normalization, conservative extraction, versioned scoring, saved input replay, and a basic demo results screen.
4. **Results refinement:** implemented: focused gap, match, and method views; progressive score/evidence disclosures; confidence and score filters; loading, empty, and actionable error states. Concise source labels distinguish demo records throughout.
5. **Roadmap and progress:** implemented: reviewed resources, one persisted checklist, undo completion, and compact progress; progress is preserved across analyses. Apply migration 003 before hosted use.
6. **Live jobs:** provider, explicit fallback, original links, signed storage, and regression tests are implemented. The user confirmed migration 004 succeeded. Application approval/configuration and verification against the actual API are pending. Public deployment is being prepared first. No original-site screenshot preview is added.
7. **Optional AI:** concise Gemini explanations with graceful failures.
8. **MVP acceptance:** end-to-end ownership, persistence, mobile/accessibility checks, and polish.

Do not expand to multiple tracks, a marketplace, social features, or decorative dashboards. Read `AGENTS.md` before each implementation step.

## References

- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
