import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function build() {
	// Run Vite build
	console.log('Running Vite build...');
	try {
		await execAsync('vite build');
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

	// Ensure popup.css is in the correct location
	console.log('Copying popup.css...');
	const srcCssPath = path.resolve(__dirname, 'src', 'popup', 'popup.css');
	const distCssPath = path.join(distDir, 'popup.css');
	if (await fs.pathExists(srcCssPath)) {
		await fs.copy(srcCssPath, distCssPath, { overwrite: true });
	}

	// Copy manifest
	console.log('Copying manifest.json...');
	await fs.copy(
		path.resolve(__dirname, 'public', 'manifest.json'),
		path.join(distDir, 'manifest.json')
	);

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

	console.log('Build completed successfully!');
}

build().catch(console.error);
