# CouncilOS — Engineering College Counselling Platform

India's full-stack JoSAA/CSAB counselling platform. Covers **30 premier engineering colleges** (IITs, NITs, IIITs, DTU, BITS) with rank-based prediction, placement analytics, cutoff explorer, department profiles, hostel data, internship stats and alumni network data.

---

## Quick Start (Development)

### Prerequisites
- Node.js 20+ (`node -v`)
- pnpm 9+ (`npm install -g pnpm`)

### Install & Run

```bash
# Install all dependencies
pnpm install

# Start both services together (recommended)
PORT=8080 pnpm --filter @workspace/api-server run dev &
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/counselling run dev
```

Open **http://localhost:5000** — the Vite dev server proxies all `/api/*` calls to the API on port 8080.

---

## Project Structure

```
/
├── artifacts/
│   ├── api-server/              # Express 5 REST API (TypeScript + esbuild)
│   │   ├── src/
│   │   │   ├── app.ts           # Express app + middleware + static-file SPA serving
│   │   │   ├── index.ts         # Port binding
│   │   │   ├── routes/          # colleges, counsellings, predict, stats, health
│   │   │   └── data/            # JSON flat-file database (no PostgreSQL needed)
│   │   │       ├── colleges.json       # 30 colleges — profile, stats, labs, alumni
│   │   │       ├── cutoffs.json        # 6,047 JoSAA cutoff records (deduplicated)
│   │   │       ├── placements.json     # Year-wise placement stats per college
│   │   │       ├── departments.json    # All departments for all 30 colleges
│   │   │       ├── hostels.json        # Hostel data for all 30 colleges
│   │   │       ├── internships.json    # Internship stats for all 30 colleges
│   │   │       ├── counsellings.json   # JoSAA, CSAB and other counsellings
│   │   │       └── rounds.json         # Round schedule and dates
│   │   └── build.mjs                   # esbuild bundler config
│   └── counselling/                    # React 19 + Vite 7 + Tailwind v4 SPA
│       └── src/
│           ├── App.tsx                 # wouter router — all page routes
│           ├── pages/                  # Home, CollegeDetail, Compare, Predict, Fit, …
│           └── components/             # AvatarLogo, Skeleton, Tooltip, …
├── packages/
│   ├── api-spec/            # OpenAPI 3 spec — source of truth for all endpoints
│   ├── api-client-react/    # Orval-generated React Query hooks (useListColleges, …)
│   └── db/                  # Drizzle ORM schema (reserved for future PostgreSQL)
└── pnpm-workspace.yaml
```

---

## Available Scripts

| Command | What it does |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm --filter @workspace/api-server run build` | Build API only |
| `pnpm --filter @workspace/counselling run build` | Build frontend only |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks from OpenAPI spec |

---

## Deploying to Production

### On Replit (one click)

This project is pre-configured for **Replit Autoscale** deployment.

1. Open the **Publish** panel in Replit.
2. Click **Publish**.

What happens automatically:

| Step | Command |
|---|---|
| Build | `pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/counselling run build` |
| Run | `PORT=5000 node artifacts/api-server/dist/index.mjs` |

The API server detects `artifacts/counselling/dist/public/` and serves the frontend as a SPA — **single process, single port, zero extra config**.

---

### On any Node.js host (Railway, Render, Fly.io, VPS)

```bash
# 1. Install
pnpm install --frozen-lockfile

# 2. Build API
pnpm --filter @workspace/api-server run build

# 3. Build frontend
pnpm --filter @workspace/counselling run build

# 4. Run
PORT=5000 node artifacts/api-server/dist/index.mjs
```

Set `PORT` to whatever your host exposes (most PaaS providers set `$PORT` automatically).

---

### Docker

```dockerfile
FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server run build
RUN pnpm --filter @workspace/counselling run build
ENV PORT=5000 NODE_ENV=production
EXPOSE 5000
CMD ["node", "artifacts/api-server/dist/index.mjs"]
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | **Yes** | — | Port for the production server |
| `NODE_ENV` | No | `development` | Set to `production` in prod |
| `DATABASE_URL` | No | — | PostgreSQL URL (reserved for future use; app runs without it) |

---

## Features

| Feature | Route | Description |
|---|---|---|
| **Rank Predictor** | `/counsellings/:id/predict` | Enter JEE rank, category, quota, gender → matched colleges sorted by closing rank |
| **College Profiles** | `/colleges/:slug` | Full profile: Placements, Cutoffs, Departments, Hostels, Internships, Labs, LinkedIn & Alumni |
| **Compare** | `/compare` | Side-by-side comparison of any two colleges across 10+ metrics with a winner verdict |
| **Shortlist** | `/shortlist` | Save colleges locally; auto-classify Safe / Moderate / Reach by rank |
| **Fit Engine** | `/fit` | 3-step wizard → personalised fit score per college weighted by career goal and priorities |
| **Branches** | `/branches` | Browse all branches available for your rank, filtered by family and college type |
| **JoSAA List** | `/josaa-list` | Full institute-branch cutoff list with search and filters |
| **Counsellings** | `/counsellings` | All counsellings with status (JoSAA/CSAB active, others coming soon) |

---

## API Endpoints

All routes served under `/api`:

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/colleges` | List all colleges (`?search=`, `?type=`, `?state=`, `?featured=true`) |
| GET | `/api/colleges/:id` | Single college full profile |
| GET | `/api/colleges/:id/placements` | Placement stats |
| GET | `/api/colleges/:id/cutoffs` | Cutoffs (`?year=`, `?round=`, `?branch=`, `?category=`) |
| GET | `/api/colleges/:id/departments` | Department list |
| GET | `/api/colleges/:id/hostels` | Hostel data |
| GET | `/api/colleges/:id/internships` | Internship stats |
| GET | `/api/cutoffs` | Global cutoffs — all records, filter by category/quota/gender/year/rank |
| GET | `/api/counsellings` | List all counsellings |
| GET | `/api/counsellings/:id` | Single counselling |
| GET | `/api/counsellings/:id/predict` | Rank-based college prediction |
| GET | `/api/stats` | Platform-wide stats |

---

## Data Coverage

All 30 colleges have complete data across every tab:

| College | Type | Departments | Hostels | Internships | Placements |
|---|---|---|---|---|---|
| IIT Bombay | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Delhi | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Madras | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Kanpur | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Kharagpur | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Roorkee | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Guwahati | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Hyderabad | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT BHU Varanasi | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Indore | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT ISM Dhanbad | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Patna | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Ropar | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Gandhinagar | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Mandi | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Jodhpur | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Bhubaneswar | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Tirupati | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Palakkad | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Dharwad | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Bhilai | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Goa | IIT | ✓ | ✓ | ✓ | ✓ |
| IIT Jammu | IIT | ✓ | ✓ | ✓ | ✓ |
| NIT Trichy | NIT | ✓ | ✓ | ✓ | ✓ |
| NIT Surathkal | NIT | ✓ | ✓ | ✓ | ✓ |
| NIT Warangal | NIT | ✓ | ✓ | ✓ | ✓ |
| NIT Calicut | NIT | ✓ | ✓ | ✓ | ✓ |
| IIIT Hyderabad | IIIT | ✓ | ✓ | ✓ | ✓ |
| DTU Delhi | DTU | ✓ | ✓ | ✓ | ✓ |
| BITS Pilani | BITS | ✓ | ✓ | ✓ | ✓ |

---

## Adding a New College

1. Add an entry to `artifacts/api-server/src/data/colleges.json` (copy an existing entry as template).
2. Add departments to `departments.json` under the college's `id` key (array of department objects).
3. Add hostel data to `hostels.json` under the college's `id` key.
4. Add internship data to `internships.json` under the college's `id` key.
5. Add placement data to `placements.json` under the college's `id` key.
6. Add cutoff rows to `cutoffs.json` (`year`, `round`, `branch`, `category`, `quota`, `gender`, `openRank`, `closeRank`).
7. Drop the college logo as `artifacts/counselling/public/logos/<slug>.png`.
8. Restart the API server.

---

## College Logo Convention

Logos live in `artifacts/counselling/public/logos/` as PNG files.
Naming: `{college-slug}.png` (e.g. `iit-madras.png`, `nit-trichy.png`).

The `AvatarLogo` component automatically shows the logo if it exists, or a coloured initial fallback if it doesn't.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, pnpm workspaces |
| API | Express 5, pino logger, Zod v4 validation |
| Frontend | React 19, Vite 7, Tailwind CSS v4, wouter, TanStack Query v5, Recharts |
| Type safety | TypeScript 5.9, Orval OpenAPI codegen, drizzle-zod |
| Build | esbuild (API bundle), Vite (frontend SPA) |
| Deployment | Replit Autoscale (single process serves API + static frontend) |

---

## Gotchas

- **Express 5 wildcard routes** — Express 5 uses `path-to-regexp` v8 which rejects bare `*`. Use `app.use(handler)` for SPA fallback, not `app.get("*", handler)`.
- **JSON data is loaded at startup** — The API bundles data into memory from `src/data/` at boot. After editing any JSON file, restart the API server for changes to take effect.
- **Active counsellings** — Only `josaa` and `csab` are active. Others show "Coming Soon" — controlled by `JEE_ACTIVE_IDS` constant in `artifacts/counselling/src/pages/Home.tsx`.
- **Cutoff data years** — Data exists for 2025 Round 6 and 2026 Round 1 only. Rounds 2–5 are disabled in the predictor UI until data is available.
- **Dev proxy** — The Vite dev server proxies `/api → http://localhost:8080`. In production, the same Express process serves both the API and the static frontend with no proxy needed.
