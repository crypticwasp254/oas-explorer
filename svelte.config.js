import adapter from '@sveltejs/adapter-vercel';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		sveltePreprocess({
			scss: {
				charset: false
			}
		})
	],
	kit: {
		adapter: adapter({}),
		files: {
			serviceWorker: 'src/sw.js'
		}
	}
};

export default config;
