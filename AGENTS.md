# SkillBridge AI - Codex Project Instructions

## 1. Project purpose

SkillBridge AI is a focused career-guidance MVP for students and early-career candidates. The first and only supported career track is **Junior Data Analyst**.

The service compares a user's self-reported skills with requirements extracted from real job vacancies, explains why each vacancy is or is not a good match, identifies skill gaps, and provides one practical learning roadmap. The roadmap contains a curated list of learning stages and trusted resource links. Users can mark stages complete and return later to continue from their saved progress.

The core promise is:

> Turn real job-market requirements into a clear, personalized next-step plan.

Do not turn this MVP into a general-purpose job platform, course marketplace, social network, resume builder, or multi-career product.

## 2. Product principles

- Keep the product focused, clear, and usable for a student or junior candidate.
- Prefer a small number of useful screens over a dashboard full of widgets.
- Use real job data when available. Clearly distinguish live vacancies from demo or CSV data.
- Make matching explainable. Never show a match percentage without a consistent, documented calculation.
- Use AI to explain structured results and help phrase recommendations. Do not let an LLM invent vacancy facts, skill frequencies, or matching scores.
- A failure of the AI provider must not break job analysis, skill matching, or roadmap progress.
- Save account-specific profile, analysis, roadmap, and progress data persistently.
- Use curated, reviewed learning links in the initial roadmap instead of asking AI to invent URLs.
- Build a working MVP first. Do not add features simply because they are technically possible.

## 3. Technology stack

### Frontend
- **Next.js** with the App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** only for small, useful charts if needed

Frontend responsibilities:
- Public landing page
- Sign up and sign in screens
- User profile and skill input
- Job analysis form and loading/error states
- Results page with job matches and concise explanations
- Skill-gap summary
- Interactive roadmap checklist
- Compact progress dashboard

### Backend
- **Python + FastAPI**
- Pydantic models for request/response validation
- `httpx` or `requests` for external HTTP requests
- Python standard library and small helper modules for deterministic skill extraction and scoring

Backend responsibilities:
- Validate profile and analysis input
- Fetch and normalize job vacancy data
- Extract skills from structured skill fields and descriptions
- Calculate match scores and skill gaps deterministically
- Generate concise AI explanations and roadmap guidance
- Store and retrieve user-specific data securely
- Handle upstream API errors, timeouts, rate limits, and missing fields

### Database and authentication
- **Supabase** for managed PostgreSQL and Supabase Auth, using the free tier within its current limits
- The frontend uses Supabase Auth for account creation and sessions.
- Backend endpoints must verify the user's identity/token before reading or changing private data.
- Use Row Level Security (RLS) policies for user-owned data where appropriate.
- Never expose the Supabase service-role key to the browser.
- Keep secrets in environment variables; provide `.env.example` with placeholders, not real keys.

Supabase is the chosen initial persistence/auth solution to avoid implementing password storage and session security from scratch. FastAPI remains responsible for the analysis logic.

### Job data
- **HeadHunter API** as the initial live job-source integration, subject to current API access, rate limits, and terms.
- **CSV dataset fallback** for local development, repeatable testing, and demos if live API access is unavailable.
- Keep job-source logic behind a dedicated provider/service interface so a different source can be added without rewriting the analysis algorithm.
- Do not scrape websites that prohibit it or attempt to bypass CAPTCHA, authentication, or rate limits.
- Show when results came from live API data versus a static dataset.
- Normalize job records before analysis. External vacancy data is untrusted input.

### AI
- **Gemini API** for short explanations and recommendations, using a free tier only if currently available and within its limits.
- Keep all AI calls in the backend.
- Never expose the API key in HTML, client-side JavaScript, or public repositories.
- The app must remain useful if Gemini is unavailable or a quota is exhausted.
- AI receives a compact summary of structured results, not an entire dataset of vacancies.
- AI must not be the source of truth for job data, match percentages, skill frequency statistics, or roadmap completion state.

### Developer tools
- Git and GitHub for version control
- VS Code or another editor
- `.gitignore` must exclude `.env`, virtual environments, caches, local datasets when appropriate, and generated files containing personal data.

## 4. Main user journey

1. A visitor opens the landing page and understands the product in a few seconds.
2. The visitor creates an account or signs in.
3. The user fills out a short profile:
   - skills and approximate proficiency or confidence;
   - education/experience if relevant;
   - target role, initially fixed to Junior Data Analyst.
4. The user starts an analysis.
5. The backend obtains a manageable set of relevant vacancies from HeadHunter, or uses the clearly labeled CSV fallback when live data is unavailable.
6. The backend normalizes vacancies and extracts known skills.
7. The deterministic analysis calculates:
   - skills the user already has;
   - missing or weaker skills;
   - how often skills appear in the analyzed vacancy sample;
   - explainable match scores for each vacancy.
8. The results page presents the most useful findings without overwhelming the user.
9. The service proposes one roadmap for the Junior Data Analyst path, prioritizing gaps supported by the analyzed vacancy sample.
10. The user checks off roadmap stages as they learn.
11. The roadmap and progress are saved to the user's account and restored on their next visit.

## 5. MVP feature scope

### A. Accounts and profile
- Sign up, sign in, sign out.
- Basic profile with skills and target role.
- Allow the user to edit their skills later.
- The only target role in the MVP is Junior Data Analyst.

### B. Job analysis
- Search/analyze a limited, relevant sample of vacancies.
- Prefer structured vacancy skill fields when available, and supplement them with conservative keyword/alias matching against descriptions.
- Normalize job title, employer, location, publication date, source, URL, description, experience level, and extracted skills when those fields are available.
- Handle missing or malformed external fields safely.
- Do not claim a vacancy is current unless its source and publication date support that claim.
- Provide a CSV fallback for development and demos.
- Do not attempt to ingest the entire job market or maintain an unnecessarily large local vacancy database.

### C. Skill Gap Analysis
- Compare the user's skills with normalized vacancy requirements.
- Show a concise list of strengths and missing/underdeveloped skills.
- Show skill demand as a count or percentage of the analyzed sample, with the sample size and analysis date visible.
- Do not imply that a small sample represents the entire labor market.

### D. Explainable Job Match
- Show a match percentage or score for each vacancy.
- Use a documented, deterministic formula based on skills that are present, missing, and optionally explicitly marked as required/preferred when this distinction can be reliably extracted.
- Show a brief explanation such as:
  - matching skills;
  - important missing skills;
  - a concise reason for the score.
- The same inputs should produce the same score.
- Do not let Gemini generate or alter the numerical score.
- Describe the score as an estimate of requirement overlap, not as a probability of being hired.
- If a reliable score cannot be calculated due to insufficient data, say so instead of manufacturing precision.

### E. One interactive Roadmap
- One ordered, checklist-style Junior Data Analyst roadmap.
- Keep the roadmap as a readable list, not a complex node diagram or project-management board.
- Initial curated stages may include:
  1. Python fundamentals
  2. SQL and relational databases
  3. Excel and data cleaning
  4. pandas and exploratory data analysis
  5. Data visualization / Power BI
  6. A small portfolio analysis project
- The exact order and emphasis can be adjusted based on the user's skill gaps and vacancy sample.
- Each stage has a short description and a small number of reviewed external learning-resource links.
- Prefer trustworthy, stable documentation or learning resources, for example official Python, pandas, Microsoft Learn, and SQLBolt resources.
- Users can mark stages complete and undo completion.
- Persist roadmap stages and their completion state in the database.
- Reopening the site or signing in on another device must restore the saved state.
- Avoid generating a large new roadmap every time the page loads. Create or update a roadmap only when appropriate, and do not silently overwrite user progress.
- Do not imply that a checked stage proves mastery; it represents user-reported completion.

### F. Compact Progress Dashboard
- Show overall roadmap completion as a simple percentage or progress bar.
- Show completed stages out of total stages.
- Optionally show the next incomplete stage.
- Keep the dashboard compact. Do not add a large set of charts, streaks, badges, leaderboards, or gamification systems.

### G. AI assistant
- Provide a concise “Explain my results” action and, if feasible within the MVP, a small question input.
- AI may explain:
  - why certain skills matter for the analyzed vacancies;
  - what the user's gaps mean;
  - how to approach the next roadmap stage;
  - a short summary of the analysis.
- AI must use the structured analysis passed by the backend and acknowledge when evidence is insufficient.
- Keep answers short and actionable.
- If AI fails, show a non-blocking message. The job results, score calculations, roadmap, and progress must continue to work.

## 6. Suggested data model

Adapt names and exact columns to implementation needs, but preserve the following concepts:

- `profiles`
  - user ID tied to Supabase Auth
  - display name and optional education/experience fields
  - target role
- `user_skills`
  - user ID
  - canonical skill ID/name
  - self-reported level or confidence
- `jobs`
  - source and external job ID
  - title, employer, location, URL, publication date
  - description and experience information where available
  - source type, such as live API or CSV
  - last fetched/normalized timestamp
- `job_skills`
  - job ID
  - canonical skill ID/name
  - evidence/source field if useful
  - required/preferred status only when reliably supported
- `analyses`
  - user ID
  - timestamp
  - data source and sample size
  - skill-demand summary
  - matching algorithm/version
- `job_matches`
  - analysis ID
  - job ID
  - deterministic score
  - matching skills and missing skills
  - short explanation data
- `roadmaps`
  - user ID
  - target role
  - creation/update timestamps
  - optional source analysis ID
- `roadmap_items`
  - roadmap ID
  - title, description, order
  - curated resource URLs
  - completion state and completion timestamp

Use foreign keys and appropriate indexes. Add unique constraints to prevent duplicate source job records and duplicate user-skill or roadmap-item records where suitable. Enforce user ownership in authorization checks and database policies. Do not store secrets in database records.

## 7. Suggested project structure

Keep modules small and focused. The exact structure can evolve, but prefer a clear separation similar to:

```text
skillbridge-ai/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   └── (app)/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
└── backend/
    ├── app/
    │   ├── main.py
    │   ├── api/
    │   ├── core/
    │   ├── models/
    │   ├── schemas/
    │   ├── services/
    │   │   ├── job_sources/
    │   │   ├── skill_extractor.py
    │   │   ├── matcher.py
    │   │   ├── roadmap.py
    │   │   └── ai_service.py
    │   └── repositories/
    ├── tests/
    └── requirements.txt
```

Do not create every possible module before it is needed. Keep the implementation understandable for a student developer.

## 8. UI and visual direction

The interface should feel intentional, calm, modern, and practical. Avoid a generic AI-SaaS look.

### Avoid or use very sparingly
- Harsh gradients everywhere. Gradients may be used only in a small, purposeful accent if they genuinely improve hierarchy.
- Pure white as the dominant page background. Prefer a subtle warm or neutral background with sufficient contrast.
- Rainbow coloring or unrelated colors for every card, metric, and skill.
- Drop shadows on every component. Use borders, spacing, and surface contrast first.
- Emojis as interface icons or decoration.
- Liquid-glass effects and excessive blur.
- Too many rounded corners. Use a restrained radius system; not every element needs to be a pill or rounded card.
- Purple and black as the default color scheme everywhere.
- Radial orbs, dot grids, sparkle icons, neon colors, and generic decorative AI motifs.
- Hover animations on every element. Use motion only when it communicates a real state change.
- Many colored left borders or stripe accents.
- Excessive checkmark bullets. Use checkboxes only where the user is actually marking progress.
- Basic pastel colors as the entire visual identity.
- Large numbers of cards, badges, charts, or visual effects competing for attention.

These are design constraints, not absolute prohibitions. A color, shadow, gradient, or animation may be used when it has a clear purpose and fits the context. Do not apply every item mechanically or remove useful visual emphasis just to obey a list.

### Prefer
- A restrained, coherent palette with a small number of purposeful semantic colors.
- Clear typography and a visible hierarchy between page title, section title, body text, metadata, and actions.
- Whitespace and alignment to organize information.
- Thin borders and subtle surface differences instead of shadows everywhere.
- Consistent spacing and a small, deliberate radius scale.
- Simple, consistent icons from one icon library if icons improve clarity.
- Accessible color contrast, visible keyboard focus, clear labels, and readable form errors.
- Responsive layouts for desktop and mobile.
- Short explanations and progressive disclosure: show the key finding first, with details available when requested.
- Small, functional transitions only where they help the user understand an interaction.

### Main screens
1. Landing page: explain the product and one primary call to action.
2. Authentication: clean sign-up/sign-in forms.
3. Profile/setup: short skill-entry flow, not a long survey.
4. Results: compact skill-gap summary, explainable job matches, and a clear next action.
5. Roadmap: one readable interactive checklist with resource links and progress.
6. Dashboard: compact progress summary and next incomplete roadmap stage.

Do not put every result on one giant page. Keep navigation simple and the number of top-level sections low.

## 9. API and service boundaries

Use clear backend endpoints, for example:

- `GET /health`
- `GET /profile`
- `PUT /profile`
- `GET /skills`
- `PUT /skills`
- `POST /analyses`
- `GET /analyses/{analysis_id}`
- `GET /analyses/{analysis_id}/matches`
- `GET /roadmap`
- `PUT /roadmap/items/{item_id}`
- `POST /ai/explain`

These are suggested contracts, not a reason to over-engineer. Adjust endpoints as needed, document them, and validate inputs and outputs with Pydantic.

Keep job-provider code isolated from skill extraction and matching. The matching service should accept normalized vacancy data regardless of whether it came from HeadHunter or CSV.

## 10. Reliability, privacy, and security

- Validate all incoming user data.
- Set sensible HTTP timeouts and handle rate limits, upstream errors, malformed JSON, and missing data.
- Never run unbounded polling or unbounded job collection.
- Do not trust client-submitted match scores or completion permissions.
- Verify authentication on all private backend endpoints.
- Ensure users cannot read or modify other users' profiles, analyses, or roadmaps.
- Keep API keys and database secrets in environment variables.
- Do not log access tokens, secrets, or unnecessary personal data.
- Use safe external links, with appropriate `rel` attributes when opening a new tab.
- Treat vacancy descriptions as untrusted content. Do not execute HTML or scripts from job descriptions.
- Add tests for score calculations, skill extraction, authorization boundaries, and roadmap persistence.
- Provide clear empty, loading, success, and error states.
- If the live job API is unavailable, offer the CSV/demo source with a clear label rather than pretending live data was retrieved.
- If Gemini is unavailable, preserve all non-AI functionality.

## 11. Matching and skill-extraction guidance

- Start with a curated canonical skill vocabulary for Junior Data Analyst, for example Python, SQL, Excel, statistics, pandas, Power BI, Tableau, data cleaning, data visualization, Git, and relational databases.
- Support known aliases conservatively, such as `PostgreSQL`/`Postgres`, `Power BI`/`PowerBI`, and `scikit-learn`/`sklearn` if relevant.
- Prefer structured skills from the source over inferred keywords in free text.
- Avoid treating every word in a job description as a skill.
- Distinguish a skill being mentioned from a skill being explicitly required when the source supports that distinction.
- Make the scoring method understandable and version it so results can be compared consistently.
- Skill-frequency percentages must use the number of successfully analyzed vacancies as the denominator. State the sample size.
- Avoid claiming that a vacancy's match score predicts hiring success.

## 12. Roadmap content guidance

Maintain one reviewed default roadmap for Junior Data Analyst, then personalize emphasis based on user gaps. The MVP does not need a general roadmap generator for multiple occupations.

Possible resources include:
- Python tutorial: https://docs.python.org/3/tutorial/
- SQLBolt: https://sqlbolt.com/
- pandas getting started: https://pandas.pydata.org/docs/getting_started/
- Microsoft Learn for Power BI: https://learn.microsoft.com/training/powerplatform/power-bi/
- Kaggle datasets for a practice project: https://www.kaggle.com/datasets

Verify URLs and relevance during implementation. Each roadmap stage should have a concise outcome and a small number of resources. A completed checkbox is user-reported progress, not verified competence. Do not reset progress just because the user runs a new analysis.

## 13. Development approach

Implement incrementally. Do not generate the entire system in one enormous change.

Recommended order:
1. Inspect the repository and existing code before changing anything.
2. Establish the project structure and environment examples.
3. Create the basic Next.js UI and FastAPI health endpoint.
4. Add Supabase Auth and secure profile persistence.
5. Create a CSV-based job provider and sample data for repeatable local development.
6. Normalize job records and implement skill extraction.
7. Implement and test deterministic skill-gap and job-match calculations.
8. Build the results interface and explanations.
9. Add the default roadmap and persistent checklist state.
10. Add the compact progress dashboard.
11. Integrate HeadHunter API with timeouts, rate-limit handling, and a clearly labeled fallback.
12. Integrate Gemini explanations with graceful failure behavior.
13. Test access control, edge cases, mobile layout, and the complete user journey.
14. Polish the visual design only after the main flow works.

At each step:
- Make the smallest coherent change.
- Explain what was changed and why.
- Run relevant tests or checks when available.
- Do not claim tests passed unless they were actually run.
- Do not silently replace working code or remove existing functionality.
- If a required credential is unavailable, provide an `.env.example` and a clear setup instruction; do not fabricate a credential.

## 14. MVP acceptance criteria

The MVP is ready when:

- A user can create an account, sign in, and sign out.
- A user can enter and update their skills.
- The service can analyze a limited vacancy sample using HeadHunter API or clearly labeled CSV data.
- The results show a skill-gap summary and job matches.
- Each match score is calculated deterministically and has a concise explanation of matching and missing skills.
- Skill-demand statistics show the analyzed sample size and do not overstate market coverage.
- The user receives one Junior Data Analyst roadmap with reviewed links.
- The user can mark a roadmap stage complete or incomplete.
- Roadmap progress persists after refresh, sign-out/sign-in, and return visits.
- The dashboard displays overall completion and the next incomplete stage without unnecessary clutter.
- AI explanations are useful when available, but AI outages do not break analysis or progress tracking.
- The UI is responsive, accessible, restrained, and follows the design guidance above.
- Secrets are not committed, and one user cannot access another user's private data.

## 15. Explicitly out of scope

Do not add these to the MVP unless the product owner explicitly changes scope:
- Multiple career tracks beyond Junior Data Analyst
- Social features, messaging, or community
- Resume/CV builder or automatic job applications
- Portfolio hosting or a project-submission platform
- Course marketplace or large content library
- Complex gamification, streaks, leaderboards, or achievement systems
- A complex node-based roadmap or project-management board
- A custom-trained model or local LLM
- Paid infrastructure as a requirement
- Unrestricted scraping or attempts to bypass third-party protections
- Large, decorative dashboards with many charts
- Extra features that do not improve the core journey from job requirements to a practical learning plan

## 16. Codex working rules

When working on this repository:
1. Read this file first and follow it as the project-level source of truth.
2. Inspect the current code and preserve existing conventions unless there is a good reason to change them.
3. Prefer simple, maintainable code suitable for a student developer.
4. Keep the frontend, API layer, job providers, matching logic, persistence, and AI service separated.
5. Keep all calculations that affect displayed scores deterministic and testable.
6. Never invent data, API results, test outcomes, resource links, or credentials.
7. Keep UI copy concise and user-focused.
8. Avoid unrequested scope expansion.
9. If a product or architecture decision is genuinely ambiguous and materially affects implementation, ask before making a large irreversible change. Otherwise choose the simplest reasonable approach and document it.
10. Update README/setup instructions when environment variables, commands, or architecture change.
