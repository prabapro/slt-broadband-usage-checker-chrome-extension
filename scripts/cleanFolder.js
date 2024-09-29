// scripts/cleanFolder.js

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const foldersToClean = process.argv.slice(2);

if (foldersToClean.length === 0) {
	console.error(chalk.red('Please specify at least one folder to clean'));
	process.exit(1);
}

let totalItemsRemoved = 0;

for (const folderToClean of foldersToClean) {
	const folderPath = path.resolve(process.cwd(), folderToClean);

	try {
		// Ensure the directory exists
		fs.ensureDirSync(folderPath);

		// Read the contents of the directory
		const files = fs.readdirSync(folderPath);

		console.log(
			chalk.cyan(`\nCleaning folder: ${chalk.yellow(folderToClean)}`)
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
			chalk.green(
				`\nSuccessfully cleaned folder: ${chalk.yellow(folderToClean)}`
			)
		);
		console.log(chalk.green(`Items removed: ${chalk.yellow(files.length)}`));

		totalItemsRemoved += files.length;
	} catch (error) {
		console.error(
			chalk.red(`\nError cleaning folder ${folderToClean}: ${error.message}`)
		);
	}
}

console.log(
	chalk.green(
		`\nTotal items removed across all folders: ${chalk.yellow(
			totalItemsRemoved
		)}`
	)
);
