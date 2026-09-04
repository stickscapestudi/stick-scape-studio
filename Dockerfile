# Multi-stage Docker build for Stick Scape Studio Fullstack
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and server package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# Install dependencies
RUN npm ci && npm --prefix server ci

# Copy all source files
COPY . .

# Generate Prisma client and build frontend & backend
RUN npm run db:generate
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built server and dist frontend
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Install production dependencies only
RUN npm ci --omit=dev && npm --prefix server ci --omit=dev && npm run db:generate

EXPOSE 5000

CMD ["npm", "start"]
