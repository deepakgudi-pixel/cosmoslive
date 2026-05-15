# CosmosLive 🌌

> Everything in space. One place. Live.

**CosmosLive** is a high-performance, real-time aerospace data platform. It aggregates live telemetry from the ISS, Starlink constellation tracking, global launch countdowns, NASA imagery, and curated space news into a single, immersive interface.

---

## 🏗️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19 |
| **Styling** | Vanilla CSS, Tailwind CSS 4, Framer Motion |
| **State Management** | TanStack Query v5, Zustand |
| **Backend** | Node.js (ESM), Express.js |
| **Authentication** | Clerk |
| **Database** | NeonDB (PostgreSQL) + Prisma ORM |
| **Cache** | Upstash Redis |
| **Infrastructure** | Vercel (Frontend + Backend) |

---

## 🚀 Getting Started

### 1. Pre-requisites
Ensure you have Node.js 20+ and npm installed.

### 2. Installation
Clone the repository and install dependencies for both frontend and backend:
```bash
npm run install:all
```

### 3. Environment Configuration
Create environment files in their respective directories:

**Backend (`backend/.env`):**
```env
PORT=4000
DATABASE_URL="your_neon_db_url"
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
NASA_API_KEY="your_nasa_key"
CLERK_SECRET_KEY="your_clerk_secret"
FRONTEND_URL="http://localhost:3000"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
CLERK_SECRET_KEY="your_clerk_secret"
NEXT_PUBLIC_CESIUM_ION_TOKEN="your_cesium_token"
```

### 4. Database Setup
```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Running Locally
```bash
# Start both servers concurrently
npm run dev

# Or for GitHub Codespaces optimized environment
npm run dev:codespaces
```

---

## 🛰️ API Architecture

The backend is built using **Node ESM**. All internal imports use `.js` extensions for compatibility with modern runtimes and Vercel serverless functions.

| Endpoint | Description |
|---|---|
| `GET /api/satellites/starlink` | Live Starlink TLE/Position data |
| `GET /api/launches/upcoming` | Global launch schedule (Upcoming) |
| `GET /api/iss/position` | Real-time ISS coordinates (10s TTL) |
| `GET /api/media/apod` | NASA Astronomy Picture of the Day |
| `GET /api/news` | Aggregated space articles |
| `GET /api/internal/cron/:job` | Internal cache warming triggers |

---

## 🚢 Deployment

### Vercel (Monorepo Setup)
This project is structured as a monorepo. Both `frontend` and `backend` are deployed as separate projects on Vercel.

1. **Backend Deployment**:
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npx prisma generate`
   - Output Directory: `dist` (or leave default for serverless functions)

2. **Frontend Deployment**:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Environment Variable: `NEXT_PUBLIC_API_URL` should point to your deployed backend URL.

---

## 🔑 API Keys Reference

| Service | Source |
|---|---|
| NASA APIs | [api.nasa.gov](https://api.nasa.gov) |
| N2YO Satellites | [n2yo.com/api](https://www.n2yo.com/api/) |
| Clerk Auth | [clerk.com](https://clerk.com) |
| Upstash Redis | [upstash.com](https://upstash.com) |
| NeonDB | [neon.tech](https://neon.tech) |
| Cesium Ion | [cesium.com/ion](https://cesium.com/ion) |

---

*CosmosLive — Architect: Deep | Optimized for LEO and Beyond.*
