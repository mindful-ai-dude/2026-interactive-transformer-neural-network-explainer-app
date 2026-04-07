import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import 'src/styles/variables.scss';`
			}
		}
	},
	build: {
		cssMinify: 'lightningcss' // Bundled with Vite 8, no install needed
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		},
		forwardConsole: true // NEW Vite 8: Browser console logs appear in terminal
	},
	esbuild: false // Rolldown/Oxc handles all transformations in Vite 8
});
