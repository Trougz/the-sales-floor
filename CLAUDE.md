# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business context

The Sales Floor is a real company cofounded by Zach (technical cofounder, owns the backend) and Nate Mills (sales-advice influencer, non-technical, brings an existing audience/positioning). It will eventually have multiple facets (courses, community, video production, merch), but the day-one product is a **recruiting firm**: collect a pool of B2B sales candidates, filter and rank them, and match top prospects against inbound requests from companies asking for a specific type of hire.

The team deliberately wants to own a proprietary ATS rather than buy one (Greenhouse/Lever/etc.), because the ranking/matching logic against company requests *is* the product, not incidental tooling. That ATS is being built as a Django + Postgres backend (`backend/`) — candidates, companies, requisitions, and the match/pipeline state between them — with Django's built-in admin serving as the day-one internal recruiter UI. It supersedes the Google Sheets/Apps Script setup described below once the public form is repointed at it (not yet done); until then, the static site + Apps Script is the live, must-stay-up system of record and should not be taken down or left non-functional mid-migration.

## What this is

Two parts today:
- A static public landing page + candidate intake form (repo root), deployed via GitHub Pages (`CNAME` → `thesalesfloor.biz`). This is what's actually live.
- A Django backend (`backend/`) — the in-progress proprietary ATS described above. Runnable locally today; **hosting decision made (Render, via `render.yaml`) but not yet actually deployed there.** `script.js` already branches on hostname: on `localhost`/`127.0.0.1` it posts straight to the local Django API, but the live `thesalesfloor.biz` origin still posts to Apps Script until the Render deploy is confirmed working.

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
- `script.js` — client-side only. On submit: validates via native `checkValidity()`, base64-encodes the resume file, POSTs a JSON payload to the Google Apps Script Web App URL (`SHEETS_URL` constant), reads the real JSON response, and only shows the success state if the backend actually reports success — otherwise it re-enables the form and alerts the user so a failed submission is never silently lost. (Content-Type is kept as `text/plain` so the request stays a CORS "simple request" and avoids a preflight; Apps Script's response carries `Access-Control-Allow-Origin`, so the response is actually readable — this is not a `no-cors` fire-and-forget request.)
- `google-apps-script.js` — **not deployed from this repo.** This is the source-of-truth copy of the backend that must be manually pasted into the Google Apps Script editor bound to the destination Google Sheet (see the deploy steps in the file's header comment). It appends form submissions as sheet rows and uploads the resume file to a "Sales Floor Resumes" Google Drive folder, returning a shareable link stored in the sheet. Sheet writes are wrapped in `LockService` so concurrent submissions can't interleave or drop rows.

**Key coupling to watch**: `script.js`'s submitted field names/order, `google-apps-script.js`'s `HEADERS` array, and the `doPost` row-building logic must all stay in sync. Adding/removing/renaming a form field requires updating all three, plus redeploying the Apps Script (a new deployment, or updating the existing one) since this repo's copy of `google-apps-script.js` is not automatically synced to the live script.

### Django backend (`backend/`)
Single app, `candidates`, in project `salesfloor`:
- `Candidate` — mirrors the public form's fields (contact info, current role, comp, preferences, resume) plus recruiting-workflow fields the form doesn't collect: `status` (new/screening/active/placed/rejected), `ranking_score`, `internal_notes`.
- `Company` — a client company asking for candidates.
- `Requisition` — an open role a `Company` wants filled; FK to `Company`, optional FK to `Industry`.
- `Match` — the join entity between `Candidate` and `Requisition`: pipeline `stage` (submitted/interviewing/offer/placed/rejected), `fit_score`, notes. This is what lets one candidate be considered for multiple roles, and is the actual matching workflow the business runs on.
- `Industry` / `CrmTool` / `WorkStyle` — small lookup tables (not hardcoded choices) so recruiters can add new values from the admin without a code change; seeded via a data migration (`candidates/migrations/0002_seed_lookups.py`) with the same values the current static form offers.
- `candidates/admin.py` — all of the above registered with `list_display`/`list_filter`/`search_fields` tuned for triage (filter candidates by industry/CRM/relocation, sort by ranking, inline-edit status), and `Match` inlined on both `Candidate` and `Requisition` admin pages so recruiters can work the matching workflow from either side.

**Current status / next action**: hosting decision is made (Render, via `render.yaml` — see "Deploying" above) and the code is production-ready, but nothing is deployed there yet. **The next concrete step is on Zach, not code**: create a Render account, deploy via "New Blueprint Instance" pointed at this repo, create the admin login via Render's shell (`manage.py createsuperuser`), and confirm `/admin/` loads on the resulting public URL. Once that's confirmed, the remaining work is code again: point `script.js`'s production branch (currently still posting to Apps Script) at the live Render URL, verify the real live site end-to-end, then retire `google-apps-script.js`. No company-facing portal yet either (internal-only by design for now).

## Git workflow

Commit and push work regularly as you go, not just at the end of a session — this repo has no CI/build pipeline and no other backup, so uncommitted or unpushed work is at real risk of being lost. Concretely:

- After completing a meaningful, working chunk of a task, commit it with a clean, descriptive message rather than batching many unrelated changes into one commit.
- Push to GitHub after committing so work is preserved remotely, not just locally.
- Keep commits scoped to one logical change each; avoid vague messages like "updates" or "fixes".
