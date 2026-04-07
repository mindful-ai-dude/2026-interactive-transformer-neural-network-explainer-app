import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import 'src/styles/variables.scss';`
			}
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'src/**/*.svelte.{test,spec}.{js,ts}'],
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }]
		}
	}
});
