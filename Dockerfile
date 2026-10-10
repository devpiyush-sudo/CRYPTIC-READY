# One image that serves everything: Express API + Socket.io + the built React app.
# Build from the repository root:
#   docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_... -t bytechat .

# ---------- Stage 1: build the React app (Vite) ----------
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Empty = the browser calls /api and /socket.io on the same host as the page.
ENV VITE_API_URL=
# The publishable key is public by design; Vite embeds it into the JS bundle at build time.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# ---------- Stage 2: install production dependencies of the API ----------
FROM node:22-bookworm-slim AS backend-deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# ---------- Stage 3: runtime ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./public

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]
