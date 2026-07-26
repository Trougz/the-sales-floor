# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business context

The Sales Floor is a real company cofounded by Zach (technical cofounder, owns the backend) and Nate Mills (sales-advice influencer, non-technical, brings an existing audience/positioning). It will eventually have multiple facets (courses, community, video production, merch), but the day-one product is a **recruiting firm**: collect a pool of B2B sales candidates, filter and rank them, and match top prospects against inbound requests from companies asking for a specific type of hire.

The team deliberately wants to own a proprietary ATS rather than buy one (Greenhouse/Lever/etc.), because the ranking/matching logic against company requests *is* the product, not incidental tooling. That ATS is a Django + Postgres backend (`backend/`) — candidates, companies, requisitions, and the match/pipeline state between them — with Django's built-in admin serving as the day-one internal recruiter UI. It's deployed on Render and is now the live backend for the public form; Google Sheets/Apps Script is kept around only as an untouched rollback path (not deleted) until the Django cutover has some real-world confidence behind it.

## What this is

Two parts today:
- A static public site (repo root), deployed via GitHub Pages (`CNAME` → `thesalesfloor.biz`), now **three pages**: `index.html` (a neutral "chooser" landing page — no form, just routes to one of the other two), `candidates.html` (the candidate intake form — this used to be `index.html`'s content), and `employers.html` (a placeholder page for hiring companies — pitch + a `mailto:` link, no form yet). Header/nav markup is duplicated across all three files by hand (no templating engine in this stack).
- A Django backend (`backend/`), deployed on Render (`salesfloor-api.onrender.com`) with a managed Postgres database. `script.js` (loaded only on `candidates.html`) posts here for both local dev (`localhost`/`127.0.0.1` → local Django) and production (`thesalesfloor.biz` → the Render URL). **Confirmed working end-to-end on the live site** — a real submission through `thesalesfloor.biz` was tested and landed correctly in the Django admin.

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
- `index.html` — the landing/chooser page. One job: route to `candidates.html` ("I'm looking for my next role") or `employers.html` ("I'm hiring sales talent") via the two-card `.chooser` section. No form here.
- `candidates.html` — the candidate intake page: hero copy, one long form (`#intake-form`) broken into `<fieldset>` sections (Contact Info, Current Role, Compensation, Location, Industries, CRM Tools, Additional/Resume), and a hidden `#success` state shown after submit. This is the only page that loads `script.js`.
- `employers.html` — placeholder page for hiring companies: pitch copy + a `mailto:hello@thesalesfloor.biz` CTA styled like `.btn-submit`. No form, no backend wiring yet — deliberately deferred.
- `style.css` — all styling, driven by CSS custom properties defined once in `:root` (colors, fonts). Responsive breakpoint at 640px collapses the grid/chooser layouts to a single column.
- `script.js` — client-side only, loaded on `candidates.html` only (it assumes `#intake-form`/`#success` exist). On submit: validates via native `checkValidity()`, POSTs the form directly as `multipart/form-data` (via `new FormData(form)`, resume file included — no manual encoding needed) to `API_URL`, which is the local Django API on `localhost`/`127.0.0.1` and the Render-hosted API in production. Reads the real JSON response and only shows the success state if the backend actually reports success — otherwise it re-enables the form and alerts the user so a failed submission is never silently lost.
- `google-apps-script.js` — **retired but not deleted.** No longer wired to the live form (kept only as a rollback reference — the code + its Google Sheet/Drive setup still exist and could be repointed to quickly if Django/Render has a problem). Previously: appended form submissions as sheet rows and uploaded resumes to a "Sales Floor Resumes" Google Drive folder; sheet writes were wrapped in `LockService` to prevent concurrent-write collisions.

**Key coupling to watch**:
- `script.js`'s `FormData` field names must stay in sync with what `candidates/views.py`'s `submit_candidate` expects (`REQUIRED_FIELDS` list + the `Candidate.objects.create(...)` call) — since the HTML form's `name=` attributes are used as-is, adding/removing/renaming a form field means updating `candidates.html`, the view, and likely the `Candidate` model together.
- Header/nav markup (logo + the two nav buttons, with an `active` class on whichever page you're on) is duplicated across all three HTML files by hand — there's no shared include/template. A nav change (new link, copy tweak, styling) means editing `index.html`, `candidates.html`, and `employers.html` together, not just one.

### Django backend (`backend/`)
Single app, `candidates`, in project `salesfloor`:
- `Candidate` — mirrors the public form's fields (contact info, current role, comp, preferences, resume) plus recruiting-workflow fields the form doesn't collect: `status` (new/screening/active/placed/rejected), `ranking_score`, `internal_notes`.
- `Company` — a client company asking for candidates.
- `Requisition` — an open role a `Company` wants filled; FK to `Company`, optional FK to `Industry`.
- `Match` — the join entity between `Candidate` and `Requisition`: pipeline `stage` (submitted/interviewing/offer/placed/rejected), `fit_score`, notes. This is what lets one candidate be considered for multiple roles, and is the actual matching workflow the business runs on.
- `Industry` / `CrmTool` / `WorkStyle` — small lookup tables (not hardcoded choices) so recruiters can add new values from the admin without a code change; seeded via a data migration (`candidates/migrations/0002_seed_lookups.py`) with the same values the current static form offers.
- `candidates/admin.py` — all of the above registered with `list_display`/`list_filter`/`search_fields` tuned for triage (filter candidates by industry/CRM/relocation, sort by ranking, inline-edit status), and `Match` inlined on both `Candidate` and `Requisition` admin pages so recruiters can work the matching workflow from either side.

**Current status / next action**: deployed on Render (`salesfloor-api.onrender.com`) and confirmed working end-to-end through the real live site (`thesalesfloor.biz` → Django admin). Phase 2 (cutover) is done. Phase 4 (copy/optional-fields) and Phase 5 (candidates/employers page split + nav) are both live and visually confirmed by Zach ("looks ok"), but two specific things from that work have **not** been explicitly confirmed yet, worth checking if they matter for upcoming work:
- Submitting the live `candidates.html` form with LinkedIn/Title/% to Quota left blank hasn't been explicitly re-tested on the real site since the page moved (it was tested locally and on a previous deploy of the same code, just not on this exact live URL after the move).
- `employers.html`'s mailto CTA points at `hello@thesalesfloor.biz` — a placeholder guess, not a real address Zach/Nate gave. Confirm or replace before treating that page as truly done.

**Not yet done**: no data has been migrated from the old Google Sheet into Postgres (Phase 3 — worth doing if there's anything from before this cutover worth keeping); `google-apps-script.js` is still kept as an untouched rollback reference rather than deleted, pending more real-world confidence in the new path; `employers.html` has no form/backend wiring yet (deliberately deferred, placeholder only); no company-facing portal yet either (internal-only by design for now).

**Known gotcha from this deploy** (fixed, but worth knowing): Django's `STORAGES` setting is all-or-nothing — adding a custom `'staticfiles'` entry (for whitenoise) without also specifying `'default'` silently breaks `FileField`/resume uploads (`InvalidStorageError`), since it replaces rather than merges with Django's built-in defaults. Also, Django's default logging swallows request-error tracebacks to nowhere useful when `DEBUG=False` unless a `LOGGING` config with a console handler is set (now is, in `settings.py`) — without it, Render's logs only show the access-log line, not the actual Python error.

## Git workflow

Commit and push work regularly as you go, not just at the end of a session — this repo has no CI/build pipeline and no other backup, so uncommitted or unpushed work is at real risk of being lost. Concretely:

- After completing a meaningful, working chunk of a task, commit it with a clean, descriptive message rather than batching many unrelated changes into one commit.
- Push to GitHub after committing so work is preserved remotely, not just locally.
- Keep commits scoped to one logical change each; avoid vague messages like "updates" or "fixes".
