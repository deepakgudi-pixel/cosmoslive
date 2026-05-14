# CosmosLive 🌌

> Everything in space. One place. Live.

**CosmosLive** is a real-time multimedia space platform — satellite tracking, launch countdowns, ISS live feed, NASA imagery, and space news in one stunning interface.

---

## 🏗️ Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14+ App Router |
| Styling | Tailwind CSS + Custom CSS |
| Animations | Framer Motion |
| State | TanStack Query + Zustand |
| Backend | Express.js |
| Auth | Clerk |
| Cache | Upstash Redis |
| Database | NeonDB + Prisma |
| Jobs | node-cron |
| Deploy | Vercel + Railway |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

**Backend:**
```bash
cp backend/.env.example backend/.env
# Fill in: NASA_API_KEY, N2YO_API_KEY, UPSTASH_REDIS_*, DATABASE_URL
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
# Fill in: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_CESIUM_ION_TOKEN
```

### 3. Set up database

```bash
npm run prisma:generate
npm run prisma:push
```

### 4. Run in development

```bash
npm install          # Install concurrently at root
npm run dev          # Starts both frontend (3000) and backend (4000)
```

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/satellites/starlink` | All Starlink positions |
| `GET /api/launches/upcoming` | Upcoming launches (all agencies) |
| `GET /api/launches/previous` | Past launches |
| `GET /api/launches/spacex` | SpaceX data |
| `GET /api/iss/position` | ISS lat/lng (10s TTL) |
| `GET /api/iss/crew` | Current crew |
| `GET /api/iss/stream` | Live stream URL |
| `GET /api/media/apod` | Today's APOD |
| `GET /api/media/apod/archive` | APOD gallery |
| `GET /api/media/mars` | Mars rover photos |
| `GET /api/media/nasa` | NASA image search |
| `GET /api/news` | Space news feed |
| `GET /health` | Health check |

---

## 📄 Pages

| Route | Page |
|---|---|
| `/` | Hero · Stats · ISS · Launch · APOD · News |
| `/satellites` | Starlink constellation tracker |
| `/launches` | All agency launch tracker |
| `/iss` | ISS live video + crew + telemetry |
| `/media` | APOD · Mars · NASA gallery |
| `/news` | Aggregated space news |
| `/profile` | Bookmarks + alerts (auth required) |

---

## 🔑 API Keys Needed

| Service | Get key at |
|---|---|
| NASA APIs | https://api.nasa.gov |
| N2YO Satellites | https://www.n2yo.com/api/ |
| Clerk Auth | https://clerk.com |
| Upstash Redis | https://upstash.com |
| NeonDB | https://neon.tech |
| Cesium Ion (globe) | https://cesium.com/ion |

> SpaceX API, Launch Library 2, Open Notify, and Spaceflight News API are all free with no key required.

---

*CosmosLive — Director: Deep | Stack: Next.js · Express · NeonDB · Upstash Redis · CesiumJS*
