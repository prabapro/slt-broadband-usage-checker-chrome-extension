import cpx from 'cpx2';
import path from 'path';
import fs from 'fs-extra';

// Define source and destination directories
const source = '**/*';
const destination = '__final__';

// Use cpx to copy files
cpx.copy(
	source,
	destination,
	{
		clean: true, // Clean the destination folder before copying
		includeEmptyDirs: false, // Don't include empty directories
		ignore: [
			'copy-source-files.js',
			'dist/**/*',
			'dist_zip/**/*',
			'node_modules/**/*',
			'package-lock.json',
			'available-in-chrome.png',
			'README.md',
			'.env.me',
			'.env.vault',
			'*.code-workspace',
			'resources/**/*',
			'coverage/**/*',
			'public/images/**/*',
		],
	},
	(err) => {
		if (err) {
			console.error('Error during copying:', err);
			return;
		}

		// Move files from subdirectories to the root of __final__
		flattenDirectory(destination);
	}
);

// Function to flatten the copied directory
async function flattenDirectory(directory) {
	const files = await fs.readdir(directory, { withFileTypes: true });

	for (const file of files) {
		const fullPath = path.join(directory, file.name);

		if (file.isDirectory()) {
			await flattenDirectory(fullPath); // Recursively flatten subdirectories

			const innerFiles = await fs.readdir(fullPath);

			for (const innerFile of innerFiles) {
				const innerFilePath = path.join(fullPath, innerFile);
				const destinationPath = path.join(directory, innerFile);

				await fs.move(innerFilePath, destinationPath);
			}

			await fs.rmdir(fullPath);
		}
	}
}
