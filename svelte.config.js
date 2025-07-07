import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			precompress: true,
			fallback: undefined
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				console.warn(`Warning: ${message} - ${path} (referenced from ${referrer})`);
			},
			handleMissingId: ({ path, id, referrers, message }) => {
				console.warn(`Warning: ${message} - ${id} in ${path} (referenced from ${referrers})`);
			},
			origin: 'https://anonymousgca.eu',
		}
	}
};

export default config;
