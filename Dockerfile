# Produces `build/` (adapter-static)
# For local preview the same image can serve with `bun --bun vite preview` if desired.
FROM oven/bun:1.4.3-alpine AS builder
WORKDIR /app

# Leverage Bun layer caching: copy lockfile and manifest first
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

# Bun-native static serve: `bun --bun vite preview --host 0.0.0.0 --port 3000`
CMD ["bun", "--bun", "x", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]