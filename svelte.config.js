import adapter from '@sveltejs/adapter-node'; // Depending on deployment target, you may need to change this another adapter

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({

		})
	}
};

export default config;
