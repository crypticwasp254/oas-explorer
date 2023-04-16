import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$identity: path.resolve('./src/identity'),
			$components: path.resolve('./src/components'),
			$icons: path.resolve('./src/icons'),
			$images: path.resolve('./src/images')
		}
	}
});
