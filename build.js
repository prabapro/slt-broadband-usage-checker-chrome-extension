import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { build as viteBuild } from 'vite';
import archiver from 'archiver';
import dotenv from 'dotenv';
import { minify } from 'html-minifier-terser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function zipDirectory(sourceDir, outPath) {
	const archive = archiver('zip', { zlib: { level: 9 } });
	const stream = fs.createWriteStream(outPath);

	return new Promise((resolve, reject) => {
		archive
			.directory(sourceDir, false)
			.on('error', (err) => reject(err))
			.pipe(stream);

		stream.on('close', () => resolve());
		archive.finalize();
	});
}

function logBuildInfo(
	isProduction,
	useMockData,
	displayVersion,
	manifestVersion
) {
	const buildType = isProduction ? 'Production' : 'Development';
	const mockDataStatus = isProduction ? 'N/A' : useMockData ? 'Yes' : 'No';

	console.log('\n');
	console.log('='.repeat(50));
	console.log('Build Configuration');
	console.log('='.repeat(50));
	console.table({
		'Build Type': buildType,
		'Using Mock Data': mockDataStatus,
		'Display Version': displayVersion,
		'Manifest Version': manifestVersion,
	});
	console.log('='.repeat(50));
	console.log('\n');
}

async function cleanupFiles(distDir, isProduction) {
	console.log('Cleaning up unnecessary files...');

	// Remove unhashed helpers.js if it exists
	const unhashedHelpersPath = path.join(distDir, 'helpers.js');
	if (await fs.pathExists(unhashedHelpersPath)) {
		await fs.remove(unhashedHelpersPath);
		console.log('Removed unhashed helpers.js');
	}

	// Remove mockData.js in production
	if (isProduction) {
		const mockDataPath = path.join(distDir, 'shared', 'mockData.js');
		if (await fs.pathExists(mockDataPath)) {
			await fs.remove(mockDataPath);
			console.log('Removed mockData.js');
		}
	}

	// Remove src directory if it exists
	const srcDir = path.join(distDir, 'src');
	if (await fs.pathExists(srcDir)) {
		await fs.remove(srcDir);
		console.log('Removed src directory');
	}

	// Remove duplicate popup.css from root
	const rootPopupCssPath = path.join(distDir, 'popup.css');
	if (await fs.pathExists(rootPopupCssPath)) {
		await fs.remove(rootPopupCssPath);
		console.log('Removed duplicate popup.css from root');
	}
}

async function minifyHtml(htmlContent) {
	const minifyOptions = {
		collapseWhitespace: true,
		removeComments: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		useShortDoctype: true,
		minifyCSS: true,
		minifyJS: true,
	};

	return await minify(htmlContent, minifyOptions);
}

async function build() {
	const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
	const baseVersion = packageJson.version;

	const isProduction = process.env.NODE_ENV === 'production';
	const useMockData = !isProduction && process.env.USE_MOCK_DATA === 'true';
	const displayVersion = isProduction ? baseVersion : `${baseVersion}-d`;

	console.log(`Building version ${displayVersion}...`);

	logBuildInfo(isProduction, useMockData, displayVersion, baseVersion);

	console.log('Running Vite build...');
	try {
		await viteBuild({
			mode: isProduction ? 'production' : 'development',
		});
	} catch (error) {
		console.error('Vite build failed:', error);
		process.exit(1);
	}

	const distDir = path.resolve(__dirname, 'dist');

	// Move popup.html to the correct location
	console.log('Moving and minifying popup.html...');
	const wrongPopupPath = path.join(distDir, 'src', 'popup', 'popup.html');
	const correctPopupPath = path.join(distDir, 'popup.html');
	if (await fs.pathExists(wrongPopupPath)) {
		let popupHtml = await fs.readFile(wrongPopupPath, 'utf-8');
		popupHtml = popupHtml.replace(/v\d+\.\d+\.\d+(-d)?/g, `v${displayVersion}`);
		popupHtml = await minifyHtml(popupHtml);
		await fs.writeFile(correctPopupPath, popupHtml);
		await fs.remove(wrongPopupPath);
	}

	// Copy and update manifest
	console.log('Copying and updating manifest.json...');
	const manifestSrcPath = path.resolve(__dirname, 'public', 'manifest.json');
	const manifestDestPath = path.join(distDir, 'manifest.json');
	let manifest = JSON.parse(await fs.readFile(manifestSrcPath, 'utf-8'));
	manifest.version = baseVersion; // Always use the base version for manifest
	await fs.writeJson(manifestDestPath, manifest, { spaces: 2 });

	// Copy images
	console.log('Copying images...');
	await fs.copy(
		path.resolve(__dirname, 'public', 'images'),
		path.join(distDir, 'images')
	);

	// Clean up unnecessary files
	await cleanupFiles(distDir, isProduction);

	console.log(`Build for version ${displayVersion} completed successfully!`);

	// Create zip file only for production builds
	if (isProduction) {
		const distZipDir = path.resolve(__dirname, 'dist_zip');
		await fs.ensureDir(distZipDir);

		const zipFileName = `release_v${baseVersion}.zip`;
		const zipFilePath = path.join(distZipDir, zipFileName);
		console.log(`Creating ${zipFileName} in dist_zip folder...`);
		await zipDirectory(distDir, zipFilePath);
		console.log(`${zipFileName} created successfully in dist_zip folder!`);
	} else {
		console.log('Skipping zip file creation for development build.');
	}
}

build().catch(console.error);
