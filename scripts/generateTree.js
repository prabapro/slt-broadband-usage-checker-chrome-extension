// scripts/generateTree.js

import fs from 'fs/promises';
import path from 'path';

async function readProjectConfig() {
	const configPath = path.join(process.cwd(), 'project-config.json');
	const configFile = await fs.readFile(configPath, 'utf8');
	return JSON.parse(configFile).ignore;
}

async function shouldIgnore(filePath, ignoreConfig) {
	const fileName = path.basename(filePath);
	const stats = await fs.stat(filePath);
	const isDirectory = stats.isDirectory();

	// Check system ignores
	if (
		ignoreConfig.system.includes(fileName) ||
		fileName.startsWith('.') ||
		fileName.endsWith('~')
	) {
		return true;
	}

	// Check directories
	if (
		isDirectory &&
		ignoreConfig.directories.some((dir) => filePath.startsWith(dir))
	) {
		return true;
	}

	// Check files
	if (
		!isDirectory &&
		ignoreConfig.files.some((pattern) => {
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

async function generateTreeStructure(dir, prefix = '', ignoreConfig) {
	let output = '';
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		const isLast = i === entries.length - 1;
		const entryPath = path.join(dir, entry.name);
		const relativePath = path.relative(process.cwd(), entryPath);

		if (await shouldIgnore(relativePath, ignoreConfig)) continue;

		const connector = isLast ? '└── ' : '├── ';
		output += prefix + connector + entry.name + '\n';

		if (entry.isDirectory()) {
			const newPrefix = prefix + (isLast ? '    ' : '│   ');
			output += await generateTreeStructure(entryPath, newPrefix, ignoreConfig);
		}
	}

	return output;
}

async function generateTree() {
	try {
		const ignoreConfig = await readProjectConfig();
		console.log('Ignore configuration:', ignoreConfig);

		const treeOutput = await generateTreeStructure(
			process.cwd(),
			'',
			ignoreConfig
		);

		await fs.writeFile('tree.txt', treeOutput);
		console.log('Tree structure has been saved to tree.txt');
	} catch (err) {
		console.error('Error:', err);
	}
}

generateTree();
