# Dialed Lifestyle

Health & lifestyle coaching platform: marketing landing page, coach console, and client portal.

Built around the four levers — light, food, environment, recovery — with tools for circadian scheduling, primal whole-foods grocery building (Whole Foods vs Costco), blood marker tracking, and detox protocol assignment.

## Run locally

Requires Node ≥ 18.

```bash
npm install
npm start
```

Then open **http://localhost:8000** in your browser.

URLs:

| Surface | URL |
|---|---|
| Landing page | http://localhost:8000/ |
| Coach console (Caden) | http://localhost:8000/coach.html |
| Client portal (Broc) | http://localhost:8000/client.html |

The server reads its persistent state from `data/db.json`. On first boot it copies `data/seed.json` into `data/db.json`. Edits made in the UI write to both `localStorage` (instant) and `data/db.json` via `PUT /api/state` (durable).

To reset to defaults:

```bash
curl -X POST http://localhost:8000/api/state/reset
# or just delete data/db.json and restart
```

## Layout

```
.
├── index.html         # Landing page
├── coach.html         # Coach console (Caden)
├── client.html        # Client portal (Broc Herrera, sample client)
├── assets/
│   ├── styles.css     # Function Health-inspired theme tokens
│   ├── data.js        # Front-end state cache + API client
│   └── app.js         # Shared helpers (solar math, grocery calc, detox templates)
├── server.js          # Express + JSON-file storage
├── package.json
└── data/
    ├── seed.json      # Default state (committed)
    └── db.json        # Live state (gitignored, created on first boot)
```

## Coach console — `/coach.html`

| Section | What it does |
|---|---|
| Overview | Active clients, MRR, collected/pending, next 4 calls, pipeline by stage. |
| Upcoming calls | Calls grouped by day. Open chart, join call. |
| CRM tracker | Per-client cards: stage, weight, food budget, T progress, detox protocol, editable notes. |
| Payments | Collected / pending / avg ticket KPIs and full ledger. |
| Diet & grocery | Primal whole-foods catalog × Whole Foods/Costco prices, against the client's weekly budget. |
| Circadian scheduler | NOAA-style solar position by lat/lon, lark/neutral/owl chronotype offsets, prescription card. |
| Blood markers | SVG trend lines per lab with goal line and on-track delta. |
| Detox builder | 3 templates (Standard Environmental, Mold + Heavy Metal, Plastics + Pesticide). |

## Client portal — `/client.html`

Sample client is **Broc Herrera** (NYC, 200 lb, $200/wk food budget, T 635 → 1000+ goal, Standard Environmental Detox).

Sections: Home, My plan, Appointments, My labs, Today's sun, Build my groceries, Recipes, Light & rhythm library.

## API surface

```
GET    /api/state                       # full state
PUT    /api/state                       # overwrite full state
POST   /api/state/reset                 # restore defaults

GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PATCH  /api/clients/:id

GET    /api/payments
POST   /api/payments

POST   /api/markers/:clientId/log       # body: { name, value, date? }

GET    /api/recipes
GET    /api/articles
```

## Design system

Tokens follow the Function Health-inspired palette in `DESIGN.md`:

- **Surfaces:** `#fef9ef` parchment / `#f5eee1` cream / `#d1c9bf` warm-mist
- **Accent:** `#b05a36` amber-glow
- **Type:** Inter for UI, Playfair Display for headings, Fira Code for mono
- **Radii:** 12px cards, 40px buttons, 1440px pill inputs
- **Shadow:** `rgba(42, 43, 47, 0.1) 12px 32px 80px 0px`

## Notes

- No build step. Vanilla JS, vanilla CSS, vanilla HTML — just `npm start`.
- No real auth. The "Coach login" / "Client portal" buttons are role-segregated by URL only.
- No real Stripe / video / lab integrations. Payments are seeded data.
- `data/db.json` is single-writer. Don't run two `npm start` processes against the same file.

## License

UNLICENSED — internal demo for Dialed Lifestyle.
