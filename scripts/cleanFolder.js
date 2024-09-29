// scripts/cleanFolder.js

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const folderToClean = process.argv[2];

if (!folderToClean) {
	console.error(chalk.red('Please specify a folder to clean'));
	process.exit(1);
}

const folderPath = path.resolve(process.cwd(), folderToClean);

try {
	// Ensure the directory exists
	fs.ensureDirSync(folderPath);

	// Read the contents of the directory
	const files = fs.readdirSync(folderPath);

	console.log(
		chalk.cyan(`\nCleaning folder: ${chalk.yellow(folderToClean)}\n`)
	);

	// Remove each file/directory inside
	for (const file of files) {
		const filePath = path.join(folderPath, file);
		fs.removeSync(filePath);
		console.log(
			`${chalk.red('Removed:')} ${chalk.magenta(
				path.join(path.basename(folderPath), file)
			)}`
		);
	}

	console.log(
		chalk.green(`\nSuccessfully cleaned folder: ${chalk.yellow(folderToClean)}`)
	);
	console.log(
		chalk.green(`Total items removed: ${chalk.yellow(files.length)}`)
	);
} catch (error) {
	console.error(chalk.red(`\nError cleaning folder: ${error.message}`));
	process.exit(1);
}
