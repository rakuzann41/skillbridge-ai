# Deploy SkillBridge AI to Render

This configuration runs the existing Next.js frontend and FastAPI backend in one container. It keeps Supabase Auth/PostgreSQL, uses one public HTTPS address, and leaves HeadHunter credentials empty initially. Nothing has been deployed merely by adding these files.

## What you need

- A GitHub account and a private repository containing this project.
- A Render account connected to that repository.
- The existing Supabase Project URL and publishable key. These two configuration values are public; no service-role key or database password is required.
- Supabase migrations 001–004 applied once, in order. Existing accounts, skills, analyses, and roadmap progress are preserved.

Use the Free compute plan for this prototype. Render's free service sleeps after inactivity and has usage/build limits; the first request can take about a minute to wake it. Do not buy a custom domain or paid database for this setup. Free availability and limits are controlled by the provider: [current Render free-service documentation](https://render.com/docs/free).

## Deployment

1. Put the source in a **private** GitHub repository. Review the files before pushing. `.env`, `.env.local`, `node_modules`, `.next`, `.venv`, caches, logs, and personal local data are excluded by `.gitignore` and `.dockerignore`. Do not upload those files through the GitHub website either.
2. In Render, select **New → Blueprint**, connect the repository, and select its `render.yaml`.
3. Confirm the service is named `skillbridge-ai` (Render may assign a different available public hostname), uses Docker, and uses the **Free** plan. It creates one web service; no Render database or disk is needed.
4. Supply `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the existing project. Render passes these public values to Docker at build time and runtime. The backend uses them too unless explicit `SUPABASE_*` variables override them.
5. Render generates `ANALYSIS_SIGNING_KEY` privately. Preserve this value across future deployments; it verifies saved live results. The image build never reads it. Leave `HH_ACCESS_TOKEN` and `HH_USER_AGENT` empty for this initial deployment.
6. Start the Blueprint deployment. Wait for a successful image build, service startup, and `/api/health` health check. Save the **actual returned HTTPS URL**; never assume a hostname is available.
7. In Supabase → Authentication → URL Configuration, set **Site URL** to the deployed HTTPS origin and add `<actual-origin>/auth/confirm` as a Redirect URL. Keep both existing local confirmation URLs if local development should continue. Do not add a wildcard redirect.
8. Open the HTTPS site. Verify the landing page and `/api/health`, then sign in yourself, restore your profile and roadmap, and create/refresh an explicitly labeled Demo CSV analysis. Check that it is saved to your account. A local browser session does not transfer automatically to the hosted domain.
9. Use the resulting public URL for HeadHunter application registration. Its application-token flow does not use a browser callback. If the form requires a redirect value, register the deployed site root; no HeadHunter user-OAuth flow is currently implemented.

Render setup requires the account owner's sign-in/connection to GitHub. Never paste account passwords, access tokens, or the private signing key into chat, screenshots, a repository, or frontend environment variables.

## How it runs

`Dockerfile` builds Next.js standalone output using Node 24, then runs it beside Python 3.14/FastAPI. `backend/scripts/start_web.py` starts and stops both processes and exits if either fails. Render terminates HTTPS and routes to Next.js on `$PORT`; FastAPI listens only on the container's `127.0.0.1:8000`. Next.js forwards `/api/*` there. Browser requests use `/api`, avoiding a public backend URL and mixed HTTP/HTTPS requests.

`/api/health` checks that both the frontend proxy and API process respond. It does not claim Supabase or HeadHunter is connected. All private API endpoints still verify the user's Supabase token and retain ownership policies. Persistent account data stays in Supabase, so an idle container shutdown does not erase progress.

For a manual Docker build (only the two **public** values are build arguments):

```powershell
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=<project-url> --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key> -t skillbridge-ai .
docker run --rm --env-file backend/.env -p 3000:10000 skillbridge-ai
```

The runtime also needs the two public Supabase values if `backend/.env` does not define `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`. On Render they are supplied automatically. A local Docker run can use the existing backend values.

## Verification status

The Next.js production build and 82 backend tests passed while preparing this version; HeadHunter HTTP responses in tests were mocked. The built standalone Node server served the landing page (HTTP 200) and proxied `/api/health` successfully on a temporary local port. The user confirmed migration 004 succeeded. Docker is not installed on the development machine, so the Linux image and Render deployment must be verified by the actual host build. No live HeadHunter request or hosted snapshot save is claimed verified. Frontend presentation tests pass; actual hosted sign-in and saved-data checks are separate.
