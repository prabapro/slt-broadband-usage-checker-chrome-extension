// copy-source-files.js

import cpx from 'cpx2';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import Table from 'cli-table3';

const source = '**/*';
const destination = '__final__';

cpx.copy(
	source,
	destination,
	{
		clean: true,
		includeEmptyDirs: false,
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
	async (err) => {
		if (err) {
			console.error('Error during copying:', err);
			return;
		}

		await flattenDirectory(destination);
		const copiedFiles = await getUniqueFiles(destination);
		printSummary(copiedFiles);
	}
);

async function flattenDirectory(directory) {
	const items = await fs.readdir(directory, { withFileTypes: true });

	for (const item of items) {
		const fullPath = path.join(directory, item.name);

		if (item.isDirectory()) {
			await flattenDirectory(fullPath);

			const innerItems = await fs.readdir(fullPath);

			for (const innerItem of innerItems) {
				const innerPath = path.join(fullPath, innerItem);
				const destPath = path.join(directory, innerItem);

				if ((await fs.stat(innerPath)).isFile()) {
					await fs.move(innerPath, destPath, { overwrite: true });
				}
			}

			await fs.rmdir(fullPath);
		}
	}
}

async function getUniqueFiles(directory) {
	const files = await fs.readdir(directory);
	return files.filter(async (file) => {
		const stat = await fs.stat(path.join(directory, file));
		return stat.isFile();
	});
}

function printSummary(copiedFiles) {
	const table = new Table({
		head: [
			chalk.cyan('Destination Folder'),
			chalk.cyan('Files Copied'),
			chalk.cyan('File Names'),
		],
		colWidths: [25, 15, 50],
		wordWrap: true,
	});

	table.push([
		chalk.green(destination),
		chalk.yellow(copiedFiles.length),
		chalk.magenta(copiedFiles.join('\n')),
	]);

	console.log(table.toString());
}
