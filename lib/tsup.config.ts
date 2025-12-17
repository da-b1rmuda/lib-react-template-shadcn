import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	minify: true,
	// React is kept external so consumers use their own React.
	// MDX packages are also external so that bundlers like Vite can handle them
	// and apply browser-specific polyfills/aliases (e.g. for "path").
	external: ['react', 'react-dom', '@mdx-js/react', '@mdx-js/runtime'],
	loader: {
		'.css': 'empty',
	},
})
