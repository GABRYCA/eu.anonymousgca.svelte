# AnonymousGCA Website

Official AnonymousGCA's Website.

Made with SvelteKit 3 + Svelte 5 + Bun 1.4.4.

🔗 [Live Website](https://www.anonymousgca.eu/)

## Stack

- **Runtime / Package Manager:** [Bun 1.4.4](https://bun.sh)
- **Framework:** SvelteKit 3 + Svelte 5
- **Build:** Vite 8 (Rolldown) running under Bun runtime
- **Adapter:** `@sveltejs/adapter-static`
- **Deploy target:** `build/` → Cloudflare Pages (static)

## Quality

```bash
# Svelte diagnostics + JS typecheck (svelte-check + `bun check --no-script`)
bun run check

# Fast JS typecheck via Bun 1.4.4's built-in checker
bun run check:types

# Bun's built-in Prettier-compatible formatter (Svelte support included)
bun run format        # check files changed from the default branch
bun run format:write  # format those files
bun fmt               # format the whole tree
```

## Developing

Requires **Bun ≥1.4.4**

```bash
# install dependencies
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

### Docker

The multi-stage `Dockerfile` uses Bun 1.4.4's `bun pm fetch` to populate the install cache before copying source, then installs offline with `--frozen-lockfile`. The runtime stage serves the adapter-static `build` directory through `vite preview --outDir build`.

```bash
docker build -t anonymousgca-website .
docker run --rm -p 3000:3000 anonymousgca-website
```

### DEBUG: Error `vite: command not found`

```
Detected tools: bun@1.4.4, nodejs@22.16.0
Installing Bun v1.4.4...
Executing user command: bun run build
$ vite build
bun: command not found: vite
```

Cloudflare **provisions** Bun when `BUN_VERSION` is set, but **does not** run `bun install` automatically for the text lockfile `bun.lock` (Bun ≥1.2). It only auto-detects `bun.lockb` (binary), `package-lock.json`, `yarn.lock`, etc. So `node_modules/.bin/vite` is never created and the build fails. This is a known Cloudflare Pages gap (see https://khaledwaleed.com/writing/bun-on-cloudflare-pages).

The repo includes **both** `bun.lock` (text, primary) and an **empty `bun.lockb`** (0 bytes) as a workaround. Bun locally prefers `bun.lock`, but Cloudflare detects `bun.lockb`. Even so, **chain the install** in the build command.

### Cloudflare Dashboard

**Pages → your project → Settings → Builds/deployments → Build configuration → Edit:**

| Setting                    | Value                                                                                                                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework preset**       | `SvelteKit` (or `None`)                                                                                                                                                                                                                                                                  |
| **Build command**          | `bun install --frozen-lockfile && bun run build` <br>_(In case of a 403 bun download error, use `npm install -g --allow-scripts=bun bun && export PATH="$(npm prefix -g)/bin:$PATH" && bun install --frozen-lockfile && bun run build` — see https://m.ac/latest-bun-cloudflare-pages/)_ |
| **Build output directory** | `build`                                                                                                                                                                                                                                                                                  |
| **Root directory**         | `/` (leave empty)                                                                                                                                                                                                                                                                        |
| **Production branch**      | `main`                                                                                                                                                                                                                                                                                   |

**Pages → Settings → Variables and Secrets → Add:**

| Variable                  | Value   | Type                                                                                                                   |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `BUN_VERSION`             | `1.4.4` | Plaintext                                                                                                              |
| `SKIP_DEPENDENCY_INSTALL` | `true`  | Plaintext _(optional but recommended — prevents Cloudflare from running `npm install` when it mis-detects `bun.lock`)_ |

### Verify

Deploy log should show:

```
Installing project dependencies: bun install --frozen-lockfile
...
XYZ packages installed
...
✓ built in ...s
Wrote site to "build"
```

If you see `npm install` in the log while you use Bun, the `SKIP_DEPENDENCY_INSTALL=true` + chained build command is not set correctly.

### Local → Cloudflare parity check

```bash
rm -rf node_modules build
bun install --frozen-lockfile && bun run build
# must succeed. If `bun run build` alone fails with `vite: command not found`, Cloudflare will also fail
```
