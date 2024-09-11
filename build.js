import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { build as viteBuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function build() {
	// Get version from package.json
	const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
	const version = packageJson.version;

	console.log(`Building version ${version}...`);

	// Run Vite build
	console.log('Running Vite build...');
	try {
		await viteBuild();
	} catch (error) {
		console.error('Vite build failed:', error);
		process.exit(1);
	}

	const distDir = path.resolve(__dirname, 'dist');

	// Move popup.html to the correct location
	console.log('Moving popup.html...');
	const wrongPopupPath = path.join(distDir, 'src', 'popup', 'popup.html');
	const correctPopupPath = path.join(distDir, 'popup.html');
	if (await fs.pathExists(wrongPopupPath)) {
		await fs.move(wrongPopupPath, correctPopupPath, { overwrite: true });
	}

	// Update version in popup.html
	console.log('Updating version in popup.html...');
	let popupHtml = await fs.readFile(correctPopupPath, 'utf-8');
	popupHtml = popupHtml.replace(/v\d+\.\d+\.\d+/g, `v${version}`);
	await fs.writeFile(correctPopupPath, popupHtml);

	// Ensure popup.css is in the correct location
	console.log('Copying popup.css...');
	const srcCssPath = path.resolve(__dirname, 'src', 'popup', 'popup.css');
	const distCssPath = path.join(distDir, 'popup.css');
	if (await fs.pathExists(srcCssPath)) {
		await fs.copy(srcCssPath, distCssPath, { overwrite: true });
	}

	// Copy and update manifest
	console.log('Copying and updating manifest.json...');
	const manifestSrcPath = path.resolve(__dirname, 'public', 'manifest.json');
	const manifestDestPath = path.join(distDir, 'manifest.json');
	let manifest = JSON.parse(await fs.readFile(manifestSrcPath, 'utf-8'));
	manifest.version = version;
	await fs.writeJson(manifestDestPath, manifest, { spaces: 2 });

	// Copy images
	console.log('Copying images...');
	await fs.copy(
		path.resolve(__dirname, 'public', 'images'),
		path.join(distDir, 'images')
	);

	// Clean up unnecessary directories
	console.log('Cleaning up...');
	const srcDir = path.join(distDir, 'src');
	if (await fs.pathExists(srcDir)) {
		await fs.remove(srcDir);
	}

	console.log(`Build for version ${version} completed successfully!`);
}

build().catch(console.error);
