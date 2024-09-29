import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const baseVersion = packageJson.version;

export default defineConfig(({ command, mode }) => {
	const isProduction = mode === 'production';
	const useMockData = !isProduction && process.env.USE_MOCK_DATA === 'true';
	const displayVersion = isProduction ? baseVersion : `${baseVersion}-d`;
	const uiDisplayVersion = useMockData ? `${displayVersion}-m` : displayVersion;

	return {
		define: {
			__APP_VERSION__: JSON.stringify(displayVersion),
			__GA4_MEASUREMENT_ID__: JSON.stringify(process.env.GA4_MEASUREMENT_ID),
			__GA4_API_SECRET__: JSON.stringify(process.env.GA4_API_SECRET),
			__USE_MOCK_DATA__: useMockData,
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
				external: [/\/__tests__\//, /\.test\.js$/, /\.spec\.js$/],
			},
		},
		plugins: [
			{
				name: 'exclude-mock-data',
				resolveId(source) {
					if (isProduction && source.includes('mockData.js')) {
						return false;
					}
				},
			},
			{
				name: 'version-injection',
				transformIndexHtml(html) {
					return html.replace(
						/v\d+\.\d+\.\d+(-dev)?(-mock)?/g,
						`v${uiDisplayVersion}`
					);
				},
			},
			{
				name: 'manifest-version',
				writeBundle() {
					const manifestPath = resolve(__dirname, 'dist/manifest.json');
					const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
					manifest.version = baseVersion; // Always use the base version for manifest
					fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
				},
			},
			{
				name: 'clean-up-utils',
				writeBundle(options, bundle) {
					const distPath = resolve(__dirname, 'dist');
					const sharedPath = resolve(distPath, 'shared');

					// Remove unhashed helpers.js if it exists
					const unhashedHelpersPath = resolve(distPath, 'helpers.js');
					if (fs.existsSync(unhashedHelpersPath)) {
						fs.unlinkSync(unhashedHelpersPath);
					}

					// Remove mockData.js in production
					if (isProduction) {
						const mockDataPath = resolve(sharedPath, 'mockData.js');
						if (fs.existsSync(mockDataPath)) {
							fs.unlinkSync(mockDataPath);
						}
					}
				},
			},
		],
	};
});
