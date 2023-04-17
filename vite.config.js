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
	},
	worker: {
		plugins: [
			{
				name: 'remove-manifest',
				configResolved(c) {
					const manifestPlugin = c.worker.plugins.findIndex((p) => p.name === 'vite:manifest');
					c.worker.plugins.splice(manifestPlugin, 1);
					const ssrManifestPlugin = c.worker.plugins.findIndex(
						(p) => p.name === 'vite:ssr-manifest'
					);
					c.plugins.splice(ssrManifestPlugin, 1);
				}
			}
		]
	}
});
