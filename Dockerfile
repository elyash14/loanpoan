# Stage 1: deps
# Prisma 7 (@prisma/streams-local) requires Node >= 22
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 2: builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN yarn build

# Stage 3: full Prisma CLI (migrate deploy needs transitive deps like `effect`)
FROM node:22-alpine AS prisma-cli
RUN npm install -g prisma@7.8.0

# Stage 4: runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential public assets
COPY --from=builder /app/public ./public

# Set up the standalone server and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Full Prisma CLI with all dependencies (for entrypoint migrate deploy)
COPY --from=prisma-cli /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=prisma-cli /usr/local/bin/prisma /usr/local/bin/prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
