# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# skip postinstall (prisma generate) — we run it explicitly below
RUN npm ci --ignore-scripts

COPY . .

# generate Prisma client without a live DB connection
RUN DATABASE_URL="postgresql://placeholder:x@localhost:5432/placeholder" \
    npx prisma generate

# DATABASE_URL must be set so prisma.ts module can be loaded;
# no actual DB connection is made during build (all pages are force-dynamic)
RUN DATABASE_URL="postgresql://placeholder:x@localhost:5432/placeholder" \
    NEXT_TELEMETRY_DISABLED=1 \
    npm run build

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs \
                    /app/.next            ./.next
COPY --from=builder /app/node_modules     ./node_modules
COPY --from=builder /app/package.json     ./package.json
# needed by `prisma migrate deploy` in the Railway release command
COPY --from=builder /app/prisma           ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated    ./src/generated

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
