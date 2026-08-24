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

This is a **static** site (`adapter-static` → `build/`). Cloudflare Pages serves `build/` directly — no Worker, no `wrangler.jsonc`.

### Why `vite: command not found` happens and how to fix it

```
Detected tools: bun@1.4.0, nodejs@22.16.0
Installing Bun v1.4.0...
Executing user command: bun run build
$ vite build
bun: command not found: vite
```

Cloudflare **provisions** Bun when you set `BUN_VERSION`, but **does not** run `bun install` automatically for the new text lockfile `bun.lock` (Bun ≥1.2). It only auto-detects `bun.lockb` (binary), `package-lock.json`, `yarn.lock`, etc. So `node_modules/.bin/vite` is never created → build fails. This is a known Cloudflare Pages gap (see https://khaledwaleed.com/writing/bun-on-cloudflare-pages).

This repo now includes **both** `bun.lock` (text, primary) and an **empty `bun.lockb`** (0 bytes) as a workaround — Bun locally prefers `bun.lock`, but Cloudflare detects `bun.lockb` and would auto-install. Even so, **you must chain the install** in the build command (the only reliable fix as of Aug 2026).

### Cloudflare Dashboard — correct settings

**Pages → your project → Settings → Builds & deployments → Build configuration → Edit:**

| Setting | Value |
|---|---|
| **Framework preset** | `SvelteKit` (or `None`) |
| **Build command** | `bun install --frozen-lockfile && bun run build` <br>*(if you get a 403 on Bun download, use `npm install -g --allow-scripts=bun bun && export PATH="$(npm prefix -g)/bin:$PATH" && bun install --frozen-lockfile && bun run build` — see https://m.ac/latest-bun-cloudflare-pages/)* |
| **Build output directory** | `build` |
| **Root directory** | `/` (leave empty) |
| **Production branch** | `main` |

**Pages → Settings → Variables and Secrets → Add:**

| Variable | Value | Type |
|---|---|---|
| `BUN_VERSION` | `1.4.0` | Plaintext |
| `SKIP_DEPENDENCY_INSTALL` | `true` | Plaintext *(optional but recommended — prevents Cloudflare from running `npm install` when it mis-detects `bun.lock`)* |
| `NODE_VERSION` | *(delete if present — not needed; Bun replaces Node)* | — |

**Do NOT** add `wrangler.jsonc` — not used for static Pages. The previous `wrangler.jsonc` (`assets: .svelte-kit/cloudflare`) was for `adapter-cloudflare` Workers and is now removed.

### Verify

Next deploy log should show:

```
Installing project dependencies: bun install --frozen-lockfile
...
56 packages installed
...
✓ built in ...s
Wrote site to "build"
```

If you see `npm install` in the log while you use Bun, the `SKIP_DEPENDENCY_INSTALL=true` + chained build command is not set correctly.

### Local → Cloudflare parity check

```bash
rm -rf node_modules build
bun install --frozen-lockfile && bun run build
# must succeed; if `bun run build` alone fails with `vite: command not found`, Cloudflare will also fail
```
