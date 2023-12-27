import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import autoExternal from 'rollup-plugin-auto-external'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		dts({
			rollupTypes: true,
			//outDir: 'dist',
		}),
		splitVendorChunkPlugin(),
		autoExternal({ packagePath: './package.json' }),
	],
	optimizeDeps: {
		include: [],
	},
	build: {
		copyPublicDir: false,
		sourcemap: true,
		lib: {
			entry: resolve(__dirname, 'lib/index.ts'),
			name: 'LaravelEchoAzureWebPubSub',
			fileName: "laravel-echo-azure-web-pubsub"
			//formats: ['es'],
		},
		// rollupOptions: {
		// 	output: {},
		// 	external: [],
		// },
	},
	resolve: {
		alias: [
			{
				find: '@',
				replacement: fileURLToPath(new URL('./lib', import.meta.url)),
			},
		],
	},
})
