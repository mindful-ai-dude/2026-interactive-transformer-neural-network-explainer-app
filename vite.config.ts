import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use '${path.resolve('./src/styles/variables.scss')}' as *;`
			}
		}
	},
	build: {
		cssMinify: 'lightningcss'
	},
	server: {
		fs: {
			allow: ['..']
		},
		forwardConsole: true
	}
});
