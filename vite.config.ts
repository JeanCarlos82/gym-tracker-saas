import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: ['es2020', 'safari14', 'chrome87', 'firefox78']
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
