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
		adapter: adapter({
			// pages: 'build',
			// assets: 'build',
			// fallback: null
		})
		// paths: {
		// 	base: process.env.NODE_ENV === 'production' ? '/sveltekit-gh-pages' : ''
		// }
	}
};

export default config;
