# --- Bun 1.4 builder for static SvelteKit site ---
# Produces `build/` (adapter-static) — no Node runtime needed at deploy.
# For local preview the same image can serve with `bun --bun vite preview` if desired.
FROM oven/bun:1.4-alpine AS builder
WORKDIR /app

# Leverage Bun layer caching: copy lockfile + manifest first
COPY package.json bun.lock* bunfig.toml* ./
RUN bun install --frozen-lockfile

COPY . .

# Build static site — runs Vite under Bun runtime (3-4x faster than Node)
RUN bun run build

# Final stage — tiny static server (Cloudflare Pages serves `build/` directly;
# this image is only for Docker preview / self-hosting if needed)
FROM oven/bun:1.4-alpine AS runtime
WORKDIR /app

# Copy static output
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Preview server on 3000 (`vite preview` serves static `build`)
EXPOSE 3000
ENV NODE_ENV=production

# Bun-native static serve: `bun --bun vite preview --host 0.0.0.0 --port 3000`
# (If deploying to Cloudflare Pages, this CMD is never used — Pages serves `build/` directly)
CMD ["bun", "--bun", "x", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]