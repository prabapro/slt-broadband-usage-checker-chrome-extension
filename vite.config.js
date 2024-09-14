import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(version),
		__GA4_MEASUREMENT_ID__: JSON.stringify(process.env.GA4_MEASUREMENT_ID),
		__GA4_API_SECRET__: JSON.stringify(process.env.GA4_API_SECRET),
		__USE_MOCK_DATA__:
			process.env.NODE_ENV === 'production'
				? false
				: process.env.USE_MOCK_DATA === 'true',
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'src/popup/popup.html'),
				background: resolve(__dirname, 'src/background/background.js'),
				eventHandler: resolve(__dirname, 'src/background/eventHandler.js'),
				content: resolve(__dirname, 'src/content/content.js'),
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'shared/[name].[hash].js',
				assetFileNames: 'assets/[name].[ext]',
			},
		},
	},
	plugins: [
		{
			name: 'version-injection',
			transformIndexHtml(html) {
				return html.replace(/v\d+\.\d+\.\d+/g, `v${version}`);
			},
		},
		{
			name: 'manifest-version',
			writeBundle() {
				const manifestPath = resolve(__dirname, 'dist/manifest.json');
				const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
				manifest.version = version;
				fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
			},
		},
		{
			name: 'copy-utils',
			writeBundle() {
				const srcPath = resolve(__dirname, 'src/utils');
				const destPath = resolve(__dirname, 'dist/shared');
				fs.ensureDirSync(destPath);
				fs.copySync(srcPath, destPath);
			},
		},
	],
});
