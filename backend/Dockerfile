# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Copy source and compile TypeScript
COPY . .
RUN npx tsc

# --- Stage 2: Runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

# Only copy production dependencies
COPY package*.json ./
RUN npm install

# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/app.js"]
