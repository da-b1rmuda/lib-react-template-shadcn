import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			// Polyfill Node's "path" for dependencies like @mdx-js/runtime/Babel helpers.
			path: 'path-browserify',
		},
	},
})
