import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ precompress: true }),
			prerender: {
				handleHttpError: ({ path, referrer, message }) => {
					console.warn(`Warning: ${message} - ${path} (referenced from ${referrer})`);
				},

				handleMissingId: ({ path, id, referrers, message }) => {
					console.warn(`Warning: ${message} - ${id} in ${path} (referenced from ${referrers})`);
				}
			},
			paths: { origin: 'https://anonymousgca.eu' }
		})
	],
	server: {
		warmup: {
			clientFiles: ['./src/routes/+layout.svelte', './src/routes/+page.svelte']
		},
		fs: {
			strict: false
		}
	},
	optimizeDeps: {
		include: ['bootstrap/dist/css/bootstrap.min.css']
	},
	build: {
		cssMinify: 'lightningcss',
		target: 'esnext'
	}
});
