# Build
FROM oven/bun:1.4.4-alpine AS builder
WORKDIR /app

# Copy lockfile and manifest
COPY package.json bun.lock bunfig.toml ./

# Bun 1.4.4: download every dependency into the cache without creating node_modules
RUN bun pm fetch --no-env-file

COPY . .

# Install from the warm cache only; fail if package.json and bun.lock drift apart
RUN bun install --offline --frozen-lockfile --no-env-file

# Build static site
RUN bun run build

# Final stage
FROM oven/bun:1.4.4-alpine AS runtime
WORKDIR /app

# Copy static output and the lockfile used by `bunx` to resolve the pinned Vite version
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Preview server on 3000
EXPOSE 3000
ENV NODE_ENV=production

# Serve the adapter-static output explicitly: Vite preview defaults to `dist`, not `build`
CMD ["bun", "--bun", "x", "vite", "preview", "--outDir", "build", "--host", "0.0.0.0", "--port", "3000"]
