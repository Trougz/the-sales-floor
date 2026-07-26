# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business context

The Sales Floor is a real company cofounded by Zach (technical cofounder, owns the backend) and Nate Mills (sales-advice influencer, non-technical, brings an existing audience/positioning). It will eventually have multiple facets (courses, community, video production, merch), but the day-one product is a **recruiting firm**: collect a pool of B2B sales candidates, filter and rank them, and match top prospects against inbound requests from companies asking for a specific type of hire.

The team deliberately wants to own a proprietary ATS rather than buy one (Greenhouse/Lever/etc.), because the ranking/matching logic against company requests *is* the product, not incidental tooling. That ATS is a Django + Postgres backend (`backend/`) — candidates, companies, requisitions, and the match/pipeline state between them — with Django's built-in admin serving as the day-one internal recruiter UI. It's deployed on Render and is now the live backend for the public form; Google Sheets/Apps Script is kept around only as an untouched rollback path (not deleted) until the Django cutover has some real-world confidence behind it.

## What this is

Two parts today:
- A static public site (repo root), deployed via GitHub Pages (`CNAME` → `thesalesfloor.biz`), now **three pages**: `index.html` (a neutral "chooser" landing page — no form, just routes to one of the other two), `candidates.html` (the candidate intake form), and `employers.html` (the hiring-company intake form). Header/nav markup is duplicated across all three files by hand (no templating engine in this stack).
- A Django backend (`backend/`), deployed on Render (`salesfloor-api.onrender.com`) with a managed Postgres database. Two intake endpoints, each with its own client script: `script.js` → `/api/candidates/` (on `candidates.html`) and `employers.js` → `/api/employers/` (on `employers.html`). Both resolve to local Django on `localhost`/`127.0.0.1` and the Render URL in production. **Both confirmed working end-to-end on the live site** — real submissions through `thesalesfloor.biz` landed correctly in the Django admin.

**⚠️ GitHub Pages serves the repo root, so anything committed at the top level is publicly downloadable at `thesalesfloor.biz/<filename>`.** Internal brand/content research (Nate's video breakdowns, `brand/`, inspiration exports) was briefly published this way and is now gitignored — see the "Internal brand/content research" block in `.gitignore`. Don't commit internal material to the repo root. Note those files remain in git *history*; purging that needs a rewrite + force push, which hasn't been done.

## Running / testing locally

### Static site (root)
No build or test tooling. Open `index.html` directly in a browser, or serve the directory with any static file server, e.g. `python -m http.server 8000`. Verify changes by loading the page and exercising the form — no automated check exists.

### Django backend (`backend/`)
```
cd backend
.venv\Scripts\python.exe manage.py runserver
```
(Recreate the venv with `py -m venv backend\.venv` then `.venv\Scripts\python.exe -m pip install -r requirements.txt` if `.venv/` isn't present — it's gitignored.) First run, create your own admin login: `manage.py createsuperuser`. There is one automated test suite, `candidates/tests.py` (resume download auth) — run it with `.venv\Scripts\python.exe manage.py test candidates`; note the test runner forces `DEBUG=False`, which is what makes it a real check of production behaviour. Then visit `/admin/` to manage candidates, companies, requisitions, and matches. Uses SQLite locally (`db.sqlite3`, gitignored) automatically — `dj_database_url` only switches to Postgres when a `DATABASE_URL` env var is present, which is the case on Render, not locally.

### Deploying (Render)
`render.yaml` at the repo root is a Render Blueprint: it provisions the web service (`backend/` as root dir, gunicorn + whitenoise, a persistent disk at `/var/data` for resume uploads) and a Postgres database together from one file — create a Render account, connect this GitHub repo, and use "New Blueprint Instance" rather than clicking together services by hand. Two things this can't automate: the Render account/billing itself, and creating the admin login on the deployed instance (`manage.py createsuperuser` via Render's shell, same reasoning as local — it's a credential).

Config is read from environment variables so the same `salesfloor/settings.py` works in both places: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, `MEDIA_ROOT` all fall back to sane local-dev defaults when unset. **`MEDIA_ROOT` must point at the mounted persistent disk in production** (`render.yaml` sets it to `/var/data/media`) — without that, uploaded resumes are wiped on every redeploy since the base filesystem is ephemeral. Similarly, the Postgres plan in `render.yaml` must stay on a paid tier — Render deletes free-tier databases after 30 days, which would silently destroy real candidate data.

## Architecture

### Static site (root)
- `index.html` — the landing/chooser page. One job: route to `candidates.html` ("I'm looking for my next role") or `employers.html` ("I'm hiring sales talent") via the two-card `.chooser` section. No form here.
- `candidates.html` — the candidate intake page: hero copy, one long form (`#intake-form`) broken into `<fieldset>` sections (Contact Info, Current Role, Compensation, Location, Industries, CRM Tools, Additional/Resume), and a hidden `#success` state shown after submit. This is the only page that loads `script.js`.
- `employers.html` — a deliberately minimal networking capture ("Connect with me"): three fields (business name, email, optional phone), a "Let's Connect" button, and a hidden `#employer-success` state. Loads `employers.js`. It is **not** a job-posting form — on launch, employers are inbound contacts who already know there's no talent pool yet, so it collects who they are and nothing else. Uses `.form-page--narrow`.
- `style.css` — all styling, driven by CSS custom properties defined once in `:root` (colors, fonts). Responsive breakpoint at 640px collapses the grid/chooser layouts to a single column.
- `script.js` — client-side only, loaded on `candidates.html` only (it assumes `#intake-form`/`#success` exist). On submit: validates via native `checkValidity()`, POSTs the form directly as `multipart/form-data` (via `new FormData(form)`, resume file included — no manual encoding needed) to `API_URL`, which is the local Django API on `localhost`/`127.0.0.1` and the Render-hosted API in production. Reads the real JSON response and only shows the success state if the backend actually reports success — otherwise it re-enables the form and alerts the user so a failed submission is never silently lost.
- `employers.js` — the same pattern for `employers.html` (`#employer-intake-form`/`#employer-success`), posting to `/api/employers/`. Deliberately a separate file rather than branching inside `script.js`, since the two pages share no form fields. Both scripts also hide `.form-header` on success, so the pitch copy ("Takes 2 minutes") doesn't sit above the confirmation.
- `google-apps-script.js` — **retired but not deleted.** No longer wired to the live form (kept only as a rollback reference — the code + its Google Sheet/Drive setup still exist and could be repointed to quickly if Django/Render has a problem). Previously: appended form submissions as sheet rows and uploaded resumes to a "Sales Floor Resumes" Google Drive folder; sheet writes were wrapped in `LockService` to prevent concurrent-write collisions.

**Key coupling to watch**:
- Each form's `name=` attributes are sent to the API as-is, so field names must stay in sync with the matching view: `candidates.html` ↔ `submit_candidate` (`REQUIRED_FIELDS` + the `Candidate.objects.create(...)` call), and `employers.html` ↔ `submit_employer_request` (`EMPLOYER_REQUIRED_FIELDS` + the `Company` call). Adding/renaming a field means editing the HTML, the view, and likely the model together.
- `TITLE_CHOICES` (module-level in `models.py`) is shared by `Candidate.current_title` and `Requisition.role_type` on purpose — matching a candidate to a req depends on both sides using the same vocabulary. Don't fork it.
- Header/nav markup is duplicated by hand across all three HTML files (see below), and so is the inline flame `<svg>`.
- `.home-hero::before` (the ember glow) is absolutely positioned and sized `min(560px, 100%)`. It must stay width-constrained: at a fixed px width it overhangs the viewport on phones and forces a horizontal scrollbar — and because it's a pseudo-element, element-based overflow checks won't find it.
- Header/nav markup (logo + the two nav buttons, with an `active` class on whichever page you're on) is duplicated across all three HTML files by hand — there's no shared include/template. A nav change (new link, copy tweak, styling) means editing `index.html`, `candidates.html`, and `employers.html` together, not just one.

### Django backend (`backend/`)
Single app, `candidates`, in project `salesfloor`:
- `Candidate` — mirrors the public form's fields (contact info, current role, comp, preferences, resume) plus recruiting-workflow fields the form doesn't collect: `status` (new/screening/active/placed/rejected), `ranking_score`, `internal_notes`.
- `Company` — a client company asking for candidates, and the *only* thing the public employer form writes. `name` is unique, so `submit_employer_request` uses `get_or_create` (a repeat submitter reuses their row rather than hitting the constraint). Contact fields are refreshed from the latest submission *only where a value was supplied* — omitting an optional field must not erase what's on file.
- `Requisition` — an open role a `Company` wants filled; FK to `Company`, optional FK to `Industry`. `role_type` (shares `TITLE_CHOICES` with `Candidate.current_title`), `timeline`, and comp range exist for **recruiter-entered reqs in the admin**, not the public form — the employer page deliberately doesn't collect role details. The fields are kept because that's the workflow once a real conversation happens.
- `Match` — the join entity between `Candidate` and `Requisition`: pipeline `stage` (submitted/interviewing/offer/placed/rejected), `fit_score`, notes. This is what lets one candidate be considered for multiple roles, and is the actual matching workflow the business runs on.
- `Industry` / `CrmTool` / `WorkStyle` — small lookup tables (not hardcoded choices) so recruiters can add new values from the admin without a code change; seeded via a data migration (`candidates/migrations/0002_seed_lookups.py`) with the same values the current static form offers.
- **Resume access** — whitenoise only covers `STATIC_ROOT`, and the old `static(settings.MEDIA_URL, ...)` line in `salesfloor/urls.py` was `DEBUG`-only, so on Render every resume link 404'd. `MEDIA_URL` (`/media/`) is now backed by `serve_media` (`@staff_member_required`, streams from `default_storage`). It deliberately backs `MEDIA_URL` itself rather than adding a separate download route, because `FileField.url` is what the admin's file widget links to — a parallel route leaves that widget's link broken. Don't "fix" a future media 404 by adding a blanket `static()`/whitenoise media route: resume paths are guessable and these are candidate PII, so that would publish every resume to anyone with the URL.
- `candidates/admin.py` — all of the above registered with `list_display`/`list_filter`/`search_fields` tuned for triage (filter candidates by industry/CRM/relocation, sort by ranking, inline-edit status), and `Match` inlined on both `Candidate` and `Requisition` admin pages so recruiters can work the matching workflow from either side.

**Current status**: MVP is live. Both intake paths are deployed and confirmed working end-to-end through the real site (`thesalesfloor.biz` → Render → Postgres → Django admin), with CORS verified to allow the real origin and reject others.

**Visual design**: a **light** theme — warm off-white (`--bg: #F4F3F1`) with near-black text, brand red as the primary accent, and the flame motif; headings are Barlow Condensed heavy italic. Nate chose light over the earlier dark-charcoal version. Colour tokens carry contrast constraints in comments (`--ink-faint` and `--red-deep` are at their AA floors — don't lighten them). Gold survives in exactly one place, the hiring chooser card's top border, where it distinguishes the two audience paths at a glance; everything else that was gold is now `--red-deep`, because gold text reads muddy on a light background and clashed with the red flame beside it.

**Known loose ends**:
- A test record (`ZZZ TEST - DELETE ME`) was submitted through the live employer form to prove the path works. Delete it from the admin. Note it was created against the *old* multi-field form, so it also has a `Requisition` attached.
- The flame SVG in the nav is a hand-drawn placeholder path inlined in all three HTML files, not a real logo asset. When a real logo lands, it has to be swapped in three places.
- Submitting the live `candidates.html` form with LinkedIn/Title/% to Quota left blank still hasn't been explicitly re-tested on the live URL (it passes locally).
- On phones under ~400px the nav bar is tight — the logo and both nav labels are stepped down via a `@media (max-width: 400px)` block to fit. If a nav item is ever added, that bar will overflow and the labels likely need shortening instead.
- `candidates.html` keeps the full long-form intake; only the employer side was simplified.
- Any resume uploaded to the live site *before* the `/var/data` disk was mounted went to ephemeral storage and is gone from disk even though the `Candidate` row still references it. Those now show a 404 ("Resume file is missing from storage") rather than a 500. Worth spot-checking the earliest candidates and re-requesting resumes if any are missing.

**Not yet done**: no data migrated from the old Google Sheet into Postgres (Phase 3 — worth doing if anything pre-cutover is worth keeping); `google-apps-script.js` kept as an untouched rollback reference; no company-facing portal (internal-only by design for now); no rate limiting or spam protection on either public endpoint, which is worth considering now that both are live and unauthenticated.

**Known gotcha from this deploy** (fixed, but worth knowing): Django's `STORAGES` setting is all-or-nothing — adding a custom `'staticfiles'` entry (for whitenoise) without also specifying `'default'` silently breaks `FileField`/resume uploads (`InvalidStorageError`), since it replaces rather than merges with Django's built-in defaults. Also, Django's default logging swallows request-error tracebacks to nowhere useful when `DEBUG=False` unless a `LOGGING` config with a console handler is set (now is, in `settings.py`) — without it, Render's logs only show the access-log line, not the actual Python error.

## Git workflow

Commit and push work regularly as you go, not just at the end of a session — this repo has no CI/build pipeline and no other backup, so uncommitted or unpushed work is at real risk of being lost. Concretely:

- After completing a meaningful, working chunk of a task, commit it with a clean, descriptive message rather than batching many unrelated changes into one commit.
- Push to GitHub after committing so work is preserved remotely, not just locally.
- Keep commits scoped to one logical change each; avoid vague messages like "updates" or "fixes".
