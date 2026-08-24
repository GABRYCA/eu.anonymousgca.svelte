import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// --- Bun 1.4 optimizations ---
	// Vite 8 + Bun: native Bun runtime is ~3-4x faster than Node for dev/build.
	// These options reduce cold-start and improve HMR for SvelteKit static builds.
	server: {
		// Warm up frequently used files — eliminates first-request lag
		warmup: {
			clientFiles: ['./src/routes/+layout.svelte', './src/routes/+page.svelte']
		},
		fs: {
			// Strict FS is unnecessary for a local static site
			strict: false
		}
	},
	optimizeDeps: {
		// Pre-bundle heavy deps so Bun's fast resolver doesn't re-parse them
		include: ['bootstrap/dist/css/bootstrap.min.css']
	},
	build: {
		// Rolldown (Vite 8) + Bun: best compression for static Cloudflare Pages
		cssMinify: 'lightningcss',
		// Explicit target for modern Cloudflare edge (keeps bundle small)
		target: 'esnext'
	}
});
