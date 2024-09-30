// scripts/copySourceFiles.js
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import Table from 'cli-table3';

const destination = '__copied_files__';

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
	'.yml': 'Configuration',
	'.tml': 'Configuration',
	'': 'Other',
};

async function readProjectConfig() {
	const configPath = path.join(process.cwd(), 'project-config.json');
	const configFile = await fs.readFile(configPath, 'utf8');
	return JSON.parse(configFile);
}

async function shouldInclude(filePath, config) {
	const relativePath = path.relative(process.cwd(), filePath);
	const fileName = path.basename(filePath);
	const isDirectory = await fs
		.stat(filePath)
		.then((stat) => stat.isDirectory());

	// Always exclude node_modules
	if (relativePath.startsWith('node_modules')) {
		return false;
	}

	// Check if the file or directory is explicitly allowed
	if (isDirectory && config.allow.directories.includes(fileName)) {
		return true;
	}
	if (!isDirectory && config.allow.files.includes(fileName)) {
		return true;
	}

	// Check system ignores
	if (
		config.ignore.system.includes(fileName) ||
		(fileName.startsWith('.') &&
			!config.allow.directories.includes(fileName)) ||
		fileName.endsWith('~')
	) {
		return false;
	}

	// Check directories
	if (
		isDirectory &&
		config.ignore.directories.some((dir) => relativePath.startsWith(dir))
	) {
		return false;
	}

	// Check files
	if (
		!isDirectory &&
		config.ignore.files.some((pattern) => {
			if (pattern.startsWith('*')) {
				return fileName.endsWith(pattern.slice(1));
			}
			return fileName === pattern;
		})
	) {
		return false;
	}

	return true;
}

async function copySourceFiles() {
	try {
		const config = await readProjectConfig();

		// Ensure destination directory is empty
		await fs.emptyDir(destination);

		const copyPromises = [];
		const copiedFiles = new Set();

		const walkDir = async (currentPath) => {
			const entries = await fs.readdir(currentPath, { withFileTypes: true });
			for (const entry of entries) {
				const srcPath = path.join(currentPath, entry.name);

				if (await shouldInclude(srcPath, config)) {
					if (entry.isDirectory()) {
						await walkDir(srcPath);
					} else {
						const fileName = entry.name;
						let destPath = path.join(destination, fileName);
						let counter = 1;

						// Handle duplicate file names
						while (copiedFiles.has(destPath)) {
							const parsedPath = path.parse(fileName);
							destPath = path.join(
								destination,
								`${parsedPath.name}_${counter}${parsedPath.ext}`
							);
							counter++;
						}

						copyPromises.push(fs.copy(srcPath, destPath));
						copiedFiles.add(destPath);
					}
				}
			}
		};

		await walkDir(process.cwd());
		await Promise.all(copyPromises);

		const groupedFiles = groupFilesByType(
			Array.from(copiedFiles).map((file) => path.basename(file))
		);
		printSummary(groupedFiles);
	} catch (err) {
		console.error('Error:', err);
	}
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
