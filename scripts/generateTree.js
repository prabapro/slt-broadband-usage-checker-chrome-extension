// scripts/generateTree.js

import fs from 'fs/promises';
import path from 'path';

async function readProjectConfig() {
	const configPath = path.join(process.cwd(), 'project-config.json');
	const configFile = await fs.readFile(configPath, 'utf8');
	return JSON.parse(configFile);
}

async function shouldIgnore(filePath, config) {
	const fileName = path.basename(filePath);
	const stats = await fs.stat(filePath);
	const isDirectory = stats.isDirectory();

	// Check if the file or directory is explicitly allowed
	if (isDirectory && config.allow.directories.includes(fileName)) {
		return false;
	}
	if (!isDirectory && config.allow.files.includes(fileName)) {
		return false;
	}

	// Existing ignore checks
	if (
		config.ignore.system.includes(fileName) ||
		(fileName.startsWith('.') &&
			!config.allow.directories.includes(fileName)) ||
		fileName.endsWith('~')
	) {
		return true;
	}

	if (
		isDirectory &&
		config.ignore.directories.some((dir) => filePath.startsWith(dir))
	) {
		return true;
	}

	if (
		!isDirectory &&
		config.ignore.files.some((pattern) => {
			if (pattern.startsWith('*')) {
				return fileName.endsWith(pattern.slice(1));
			}
			return fileName === pattern;
		})
	) {
		return true;
	}

	return false;
}

async function generateTreeStructure(dir, prefix = '', config) {
	let output = '';
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		const isLast = i === entries.length - 1;
		const entryPath = path.join(dir, entry.name);
		const relativePath = path.relative(process.cwd(), entryPath);

		if (await shouldIgnore(relativePath, config)) continue;

		const connector = isLast ? '└── ' : '├── ';
		output += prefix + connector + entry.name + '\n';

		if (entry.isDirectory()) {
			const newPrefix = prefix + (isLast ? '    ' : '│   ');
			output += await generateTreeStructure(entryPath, newPrefix, config);
		}
	}

	return output;
}

async function generateTree() {
	try {
		const config = await readProjectConfig();
		console.log('Configuration:', config);

		const treeOutput = await generateTreeStructure(process.cwd(), '', config);

		await fs.writeFile('tree.txt', treeOutput);
		console.log('Tree structure has been saved to tree.txt');
	} catch (err) {
		console.error('Error:', err);
	}
}

generateTree();
