import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';

const distZipDir = path.resolve(process.cwd(), 'dist_zip');

try {
	// Ensure the dist_zip directory exists
	fs.ensureDirSync(distZipDir);

	// Read the contents of the dist_zip directory
	const files = fs.readdirSync(distZipDir);

	// Find the latest zip file (assuming it's the production build)
	const latestZip = files
		.filter((file) => file.endsWith('.zip'))
		.sort(
			(a, b) =>
				fs.statSync(path.join(distZipDir, b)).mtime.getTime() -
				fs.statSync(path.join(distZipDir, a)).mtime.getTime()
		)[0];

	if (!latestZip) {
		console.error('No zip file found in dist_zip directory');
		process.exit(1);
	}

	const zipPath = path.join(distZipDir, latestZip);
	const unzipDirName = path.parse(latestZip).name; // Get the filename without extension
	const unzipDir = path.join(distZipDir, unzipDirName);

	// Ensure the unzip directory exists and is empty
	fs.emptyDirSync(unzipDir);

	// Unzip the file
	const zip = new AdmZip(zipPath);
	zip.extractAllTo(unzipDir, true);

	console.log(`Unzipped ${latestZip} to ${unzipDir}`);
} catch (error) {
	console.error(`Error unzipping production build: ${error.message}`);
	process.exit(1);
}
