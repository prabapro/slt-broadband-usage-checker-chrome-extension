// scripts/runTestsAndGenerateReport.js

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Run Jest with JSON reporter
execSync('npm test -- --json --outputFile=jest-results.json', {
	stdio: 'inherit',
});

// Read the JSON results
const results = JSON.parse(fs.readFileSync('jest-results.json', 'utf-8'));

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = packageJson.version;

// Generate markdown content
let markdownContent = `# Test Results for v${version}\n\n`;
markdownContent += `Date: ${new Date().toISOString()}\n\n`;
markdownContent += `Total Tests: ${results.numTotalTests}\n`;
markdownContent += `Passed: ${results.numPassedTests}\n`;
markdownContent += `Failed: ${results.numFailedTests}\n\n`;

// Add details for failed tests
if (results.numFailedTests > 0) {
	markdownContent += `## Failed Tests\n\n`;
	results.testResults.forEach((testFile) => {
		testFile.assertionResults.forEach((test) => {
			if (test.status === 'failed') {
				markdownContent += `- ${test.fullName}\n`;
				markdownContent += `  Error: ${test.failureMessages.join('\n')}\n\n`;
			}
		});
	});
}

// Write to file
const fileName = `test-results-v${version}.md`;
const filePath = path.join('test-results', fileName);
fs.mkdirSync('test-results', { recursive: true });
fs.writeFileSync(filePath, markdownContent);

console.log(`Test results written to ${filePath}`);

// Clean up JSON file
fs.unlinkSync('jest-results.json');
