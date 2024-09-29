// scripts/runTestsAndGenerateReport.js

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
	// Run Jest with JSON reporter
	execSync('npx jest --json --outputFile=jest-results.json', {
		stdio: 'inherit',
	});

	// Read the JSON results
	const results = JSON.parse(fs.readFileSync('jest-results.json', 'utf-8'));

	// Read package.json for version
	const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
	const version = packageJson.version;

	// Generate HTML content
	let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results for v${version}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        h2 { color: #666; }
        .pass { color: green; }
        .fail { color: red; }
        .test-file { margin-bottom: 20px; }
        .test-suite { margin-left: 20px; }
        .test-case { margin-left: 40px; }
    </style>
</head>
<body>
    <h1>Test Results for v${version}</h1>
    <p>Date: ${new Date().toISOString()}</p>
    <p>Total Tests: ${results.numTotalTests}</p>
    <p>Passed: ${results.numPassedTests}</p>
    <p>Failed: ${results.numFailedTests}</p>
    <h2>Test Details</h2>
`;

	results.testResults.forEach((testFile) => {
		const relativePath = path.relative(process.cwd(), testFile.name);
		htmlContent += `<div class="test-file"><h3>${relativePath}</h3>`;

		let currentDescribe = '';
		testFile.assertionResults.forEach((test) => {
			const testTitles = test.ancestorTitles.concat(test.title);
			const describeBlock =
				testTitles.length > 1 ? testTitles[testTitles.length - 2] : '';

			if (describeBlock !== currentDescribe) {
				if (currentDescribe !== '') {
					htmlContent += `</div>`; // Close previous test suite
				}
				currentDescribe = describeBlock;
				htmlContent += `<div class="test-suite"><h4>${currentDescribe}</h4>`;
			}

			const status = test.status === 'passed' ? 'pass' : 'fail';
			htmlContent += `<div class="test-case ${status}">
        ${test.status === 'passed' ? '✓' : '✗'} ${test.title} (${
				test.duration
			}ms)
      </div>`;

			if (test.status === 'failed') {
				htmlContent += `<div class="error">Error: ${test.failureMessages.join(
					'<br>'
				)}</div>`;
			}
		});

		htmlContent += `</div></div>`; // Close last test suite and test file
	});

	htmlContent += `
</body>
</html>`;

	// Write to file
	const fileName = `index.html`;
	const filePath = path.join('test-results', fileName);
	fs.mkdirSync('test-results', { recursive: true });
	fs.writeFileSync(filePath, htmlContent);

	console.log(`Test results written to ${filePath}`);

	// Clean up JSON file
	fs.unlinkSync('jest-results.json');
} catch (error) {
	console.error('Error running tests or generating report:', error);
	process.exit(1);
}
