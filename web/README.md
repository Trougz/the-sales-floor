# The Sales Floor — marketing site (React + Vite)

Multipage site: `/` · `/talent` · `/companies` · `/process` · `/about` · `/resources` (+ `/resources/:slug`) · `/contact` · `/privacy`.

```bash
npm install
npm run dev              # dev server → http://localhost:5173
npm run build            # production build → dist/  (host needs an SPA fallback: every path → index.html)
npm run preview          # serve dist/ locally → http://localhost:4173
npm run build:preview    # one self-contained file → dist-preview/index.html (hash URLs, opens from disk)
```

## Where things live

| Path | What |
| --- | --- |
| `src/pages/` | One component per route |
| `src/components/layout` | Header (dropdowns), mobile menu, footer, scroll/focus manager |
| `src/components/ui` | Button, Tabs, Accordion, Badge, Placeholder, Reveal (scroll animation) |
| `src/components/forms` | `useForm`-driven fields + Candidate / Company / Contact / Newsletter forms |
| `src/components/sections` · `visuals` | Reusable page sections, the hero network visual, profile cards |
| `src/data/` | All copy and lists (roles, FAQ, steps, sample profiles/articles, nav, form options) |
| `src/styles/` | Plain CSS by concern; design tokens are at the top of `base.css` |

## Before this goes live

- **Forms are front-end only.** Replace `submitForm()` in `src/services/forms.js` to send them to the backend (its header lists which fields the current API accepts).
- **Sample content is labelled and must be replaced:** sample profiles, sample articles, testimonial / logo / story placeholders, and Nate Mills' bio (`[INSERT VERIFIED NATE MILLS BIO]`, plus a photo).
- **Roles:** `CORE_ROLES` (SDR, BDR, AE) vs `EXPANDING_ROLES` in `src/data/roles.js` — promote a role only when it's a real offering.
- The flame logo is still the hand-drawn placeholder (one file: `src/components/ui/Flame.jsx`).
- Review `src/pages/Privacy.jsx` — the new forms collect a few more fields than the live one.
