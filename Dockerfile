# ── Backend ──
FROM node:22-alpine AS backend-base
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .

FROM backend-base AS backend-dev
CMD ["npm", "run", "dev"]

FROM backend-base AS backend-build
RUN npm run typecheck

FROM node:22-alpine AS backend-prod
WORKDIR /app/backend
COPY --from=backend-base /app/backend/node_modules ./node_modules
COPY --from=backend-base /app/backend/ .
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]

# ── Frontend ──
FROM node:22-alpine AS frontend-base
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .

FROM frontend-base AS frontend-dev
CMD ["npm", "run", "dev"]

FROM frontend-base AS frontend-build
RUN npm run build

FROM node:22-alpine AS frontend-prod
WORKDIR /app/frontend
COPY --from=frontend-build /app/frontend/.next ./.next
COPY --from=frontend-build /app/frontend/public ./public
COPY --from=frontend-build /app/frontend/package.json ./
COPY --from=frontend-build /app/frontend/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
