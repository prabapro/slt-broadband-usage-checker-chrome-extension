import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'src/popup/popup.html'),
				background: resolve(__dirname, 'src/background/background.js'),
				content: resolve(__dirname, 'src/content/content.js'),
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[ext]',
			},
		},
	},
});
