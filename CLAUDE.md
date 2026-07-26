# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business context

The Sales Floor is a real company cofounded by Zach (technical cofounder, owns the backend) and Nate Mills (sales-advice influencer, non-technical, brings an existing audience/positioning). It will eventually have multiple facets (courses, community, video production, merch), but the day-one product is a **recruiting firm**: collect a pool of B2B sales candidates, filter and rank them, and match top prospects against inbound requests from companies asking for a specific type of hire.

The team deliberately wants to own a proprietary ATS rather than buy one (Greenhouse/Lever/etc.), because the ranking/matching logic against company requests *is* the product, not incidental tooling. That ATS is a Django + Postgres backend (`backend/`) — candidates, companies, requisitions, and the match/pipeline state between them — with Django's built-in admin serving as the day-one internal recruiter UI. It's deployed on Render and is now the live backend for the public form; Google Sheets/Apps Script is kept around only as an untouched rollback path (not deleted) until the Django cutover has some real-world confidence behind it.

## What this is

Two parts today:
- A static public landing page + candidate intake form (repo root), deployed via GitHub Pages (`CNAME` → `thesalesfloor.biz`). This is what's actually live, and it does not change as part of the backend work below — the address people go to never moves.
- A Django backend (`backend/`), deployed on Render (`salesfloor-api.onrender.com`) with a managed Postgres database. `script.js` posts here for both local dev (`localhost`/`127.0.0.1` → local Django) and production (`thesalesfloor.biz` → the Render URL). **Just cut over — pending a real end-to-end test on the live site before Apps Script/`google-apps-script.js` can be considered safe to eventually retire.**

## Running / testing locally

### Static site (root)
No build or test tooling. Open `index.html` directly in a browser, or serve the directory with any static file server, e.g. `python -m http.server 8000`. Verify changes by loading the page and exercising the form — no automated check exists.

### Django backend (`backend/`)
```
cd backend
.venv\Scripts\python.exe manage.py runserver
```
(Recreate the venv with `py -m venv backend\.venv` then `.venv\Scripts\python.exe -m pip install -r requirements.txt` if `.venv/` isn't present — it's gitignored.) First run, create your own admin login: `manage.py createsuperuser`. Then visit `/admin/` to manage candidates, companies, requisitions, and matches. Uses SQLite locally (`db.sqlite3`, gitignored) automatically — `dj_database_url` only switches to Postgres when a `DATABASE_URL` env var is present, which is the case on Render, not locally.

### Deploying (Render)
`render.yaml` at the repo root is a Render Blueprint: it provisions the web service (`backend/` as root dir, gunicorn + whitenoise, a persistent disk at `/var/data` for resume uploads) and a Postgres database together from one file — create a Render account, connect this GitHub repo, and use "New Blueprint Instance" rather than clicking together services by hand. Two things this can't automate: the Render account/billing itself, and creating the admin login on the deployed instance (`manage.py createsuperuser` via Render's shell, same reasoning as local — it's a credential).

Config is read from environment variables so the same `salesfloor/settings.py` works in both places: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, `MEDIA_ROOT` all fall back to sane local-dev defaults when unset. **`MEDIA_ROOT` must point at the mounted persistent disk in production** (`render.yaml` sets it to `/var/data/media`) — without that, uploaded resumes are wiped on every redeploy since the base filesystem is ephemeral. Similarly, the Postgres plan in `render.yaml` must stay on a paid tier — Render deletes free-tier databases after 30 days, which would silently destroy real candidate data.

## Architecture

### Static site (root)
- `index.html` — single page: a nav header, one long form (`#intake-form`) broken into `<fieldset>` sections (Contact Info, Current Role, Compensation, Location, Industries, CRM Tools, Additional/Resume), and a hidden `#success` state shown after submit.
- `style.css` — all styling, driven by CSS custom properties defined once in `:root` (colors, fonts). Responsive breakpoint at 640px collapses the grid layouts to a single column.
- `script.js` — client-side only. On submit: validates via native `checkValidity()`, POSTs the form directly as `multipart/form-data` (via `new FormData(form)`, resume file included — no manual encoding needed) to `API_URL`, which is the local Django API on `localhost`/`127.0.0.1` and the Render-hosted API in production. Reads the real JSON response and only shows the success state if the backend actually reports success — otherwise it re-enables the form and alerts the user so a failed submission is never silently lost.
- `google-apps-script.js` — **retired but not deleted.** No longer wired to the live form (kept only as a rollback reference — the code + its Google Sheet/Drive setup still exist and could be repointed to quickly if Django/Render has a problem). Previously: appended form submissions as sheet rows and uploaded resumes to a "Sales Floor Resumes" Google Drive folder; sheet writes were wrapped in `LockService` to prevent concurrent-write collisions.

**Key coupling to watch**: `script.js`'s `FormData` field names must stay in sync with what `candidates/views.py`'s `submit_candidate` expects (`REQUIRED_FIELDS` list + the `Candidate.objects.create(...)` call) — since the HTML form's `name=` attributes are used as-is, adding/removing/renaming a form field means updating `index.html`, the view, and likely the `Candidate` model together.

### Django backend (`backend/`)
Single app, `candidates`, in project `salesfloor`:
- `Candidate` — mirrors the public form's fields (contact info, current role, comp, preferences, resume) plus recruiting-workflow fields the form doesn't collect: `status` (new/screening/active/placed/rejected), `ranking_score`, `internal_notes`.
- `Company` — a client company asking for candidates.
- `Requisition` — an open role a `Company` wants filled; FK to `Company`, optional FK to `Industry`.
- `Match` — the join entity between `Candidate` and `Requisition`: pipeline `stage` (submitted/interviewing/offer/placed/rejected), `fit_score`, notes. This is what lets one candidate be considered for multiple roles, and is the actual matching workflow the business runs on.
- `Industry` / `CrmTool` / `WorkStyle` — small lookup tables (not hardcoded choices) so recruiters can add new values from the admin without a code change; seeded via a data migration (`candidates/migrations/0002_seed_lookups.py`) with the same values the current static form offers.
- `candidates/admin.py` — all of the above registered with `list_display`/`list_filter`/`search_fields` tuned for triage (filter candidates by industry/CRM/relocation, sort by ranking, inline-edit status), and `Match` inlined on both `Candidate` and `Requisition` admin pages so recruiters can work the matching workflow from either side.

**Current status / next action**: deployed on Render (`salesfloor-api.onrender.com`) and `script.js` has been cut over to post there in production. **Not yet done**: an actual real-world submission through the live `thesalesfloor.biz` site hasn't been confirmed end-to-end (only local + direct API checks so far) — do that before treating Apps Script as safe to delete. No company-facing portal yet either (internal-only by design for now). No data has been migrated from the old Google Sheet into Postgres yet, if there's anything worth carrying over from before this cutover.

## Git workflow

Commit and push work regularly as you go, not just at the end of a session — this repo has no CI/build pipeline and no other backup, so uncommitted or unpushed work is at real risk of being lost. Concretely:

- After completing a meaningful, working chunk of a task, commit it with a clean, descriptive message rather than batching many unrelated changes into one commit.
- Push to GitHub after committing so work is preserved remotely, not just locally.
- Keep commits scoped to one logical change each; avoid vague messages like "updates" or "fixes".
