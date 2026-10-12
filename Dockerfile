# Build
FROM oven/bun:1.4.3-alpine AS builder
WORKDIR /app

# Copy lockfile and manifest
COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --frozen-lockfile

COPY . .

# Build static site
RUN bun run build

# Final stage
FROM oven/bun:1.4.3-alpine AS runtime
WORKDIR /app

# Copy static output
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Preview server on 3000
EXPOSE 3000
ENV NODE_ENV=production

# `bun --bun vite preview --host 0.0.0.0 --port 3000`
CMD ["bun", "--bun", "x", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]