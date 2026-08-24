# AnonymousGCA Website — SvelteKit 2 + Svelte 5 + Bun 1.4

Official AnonymousGCA's Website. Static site deployed on **Cloudflare Pages** via `@sveltejs/adapter-static`.

🔗 [Live Website](https://www.anonymousgca.eu/)

## Stack

- **Runtime / Package Manager:** [Bun 1.4.0](https://bun.sh) — replaces Node.js / npm
- **Framework:** SvelteKit `2.70.3` + Svelte `5.56.10`
- **Build:** Vite `8.2.2` (Rolldown) running under Bun runtime — 3-4× faster than Node
- **Adapter:** `@sveltejs/adapter-static` with `precompress: true` (generates `.br` + `.gz`)
- **Deploy target:** `build/` → Cloudflare Pages (static, no Worker)

## Developing

Requires **Bun ≥1.4.0** (`bun --version` should show `1.4.0`). Install via https://bun.sh.

```bash
# install dependencies (uses bun.lock text lockfile, binary cache)
bun install

# dev server — Vite + SvelteKit under Bun runtime
bun run dev
# or with explicit Bun runtime flag for max speed
bun --bun run dev

# open in browser
bun run dev -- --open --host
```

## Building

```bash
# production static build → build/
bun run build

# preview the static output locally
bun run preview
# or explicitly
bun --bun vite preview --host --port 3000
```

> The project no longer requires Node.js. All scripts run under Bun. If you have `node`/`npm` installed they are ignored; `engines.bun` and `packageManager: bun@1.4.0` enforce Bun.

## Deployment — Cloudflare Pages (static)

See `Cloudflare` section below for dashboard steps.
