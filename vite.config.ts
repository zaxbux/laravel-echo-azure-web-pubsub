import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


import { defineConfig, splitVendorChunkPlugin } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		dts({
			rollupTypes: true,
		}),
		nodePolyfills({
			include: ['events'],
		}),
		splitVendorChunkPlugin(),
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
			fileName: 'laravel-echo-azure-web-pubsub',
		},
		rollupOptions: {
		},
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
