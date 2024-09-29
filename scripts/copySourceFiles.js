// scripts/copySourceFiles.js

import cpx from 'cpx2';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import Table from 'cli-table3';

const source = '**/*';
const destination = '__final__';

const fileTypeNames = {
	'.css': 'Styles',
	'.js': 'JavaScript',
	'.html': 'HTML',
	'.json': 'JSON',
	'.md': 'Markdown',
	'.txt': 'Text',
	'.png': 'Images',
	'.jpg': 'Images',
	'.jpeg': 'Images',
	'.gif': 'Images',
	'.svg': 'Vector Graphics',
	'': 'Other',
};

async function readProjectConfig() {
	const configPath = path.join(process.cwd(), 'project-config.json');
	const configFile = await fs.readFile(configPath, 'utf8');
	return JSON.parse(configFile).ignore;
}

async function copySourceFiles() {
	try {
		const ignoreConfig = await readProjectConfig();

		cpx.copy(
			source,
			destination,
			{
				clean: true,
				includeEmptyDirs: false,
				ignore: [
					...ignoreConfig.directories.map((dir) => `${dir}/**/*`),
					...ignoreConfig.files,
					...ignoreConfig.system,
				],
			},
			async (err) => {
				if (err) {
					console.error('Error during copying:', err);
					return;
				}

				await flattenDirectory(destination);
				const copiedFiles = await getUniqueFiles(destination);
				const groupedFiles = groupFilesByType(copiedFiles);
				printSummary(groupedFiles);
			}
		);
	} catch (err) {
		console.error('Error:', err);
	}
}

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
	return files.filter((file) =>
		fs.statSync(path.join(directory, file)).isFile()
	);
}

function groupFilesByType(files) {
	const groupedFiles = {};

	files.forEach((file) => {
		const ext = path.extname(file).toLowerCase();
		const typeName =
			fileTypeNames[ext] || fileTypeNames[''] || path.extname(file) || 'Other';
		if (!groupedFiles[typeName]) {
			groupedFiles[typeName] = [];
		}
		groupedFiles[typeName].push(file);
	});

	// Sort files within each group
	Object.keys(groupedFiles).forEach((type) => {
		groupedFiles[type].sort((a, b) =>
			a.localeCompare(b, undefined, { sensitivity: 'base' })
		);
	});

	// Sort groups by type name
	return Object.keys(groupedFiles)
		.sort()
		.reduce((obj, key) => {
			obj[key] = groupedFiles[key];
			return obj;
		}, {});
}

function printSummary(groupedFiles) {
	const table = new Table({
		head: [
			chalk.cyan('Destination Folder'),
			chalk.cyan('Files Copied'),
			chalk.cyan('File Names (Grouped by Type)'),
		],
		colWidths: [25, 15, 50],
		wordWrap: true,
	});

	const totalFiles = Object.values(groupedFiles).flat().length;
	let fileList = '';

	Object.entries(groupedFiles).forEach(([type, files]) => {
		fileList += chalk.yellow.underline(`${type}:\n`);
		files.forEach((file) => {
			fileList += `${chalk.magenta(file)}\n`;
		});
		fileList += '\n';
	});

	table.push([
		chalk.green(destination),
		chalk.yellow(totalFiles),
		fileList.trim(),
	]);

	console.log(table.toString());
}

copySourceFiles();
