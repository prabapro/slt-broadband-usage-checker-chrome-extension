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

	// Format the date
	const formattedDate = new Date().toUTCString().replace(/GMT/, 'UTC');

	// Generate HTML content
	let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results for v${version}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto+Mono&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            background-color: #f5f5f5;
            color: #333;
        }
        h1, h2, h3, h4 {
            font-weight: 600;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        h2 {
            color: #34495e;
        }
        .pass {
            color: #27ae60;
        }
        .fail {
            color: #e74c3c;
        }
        .highlight {
            background-color: #dbccfa3b;
            padding: 4px 10px;
            border-radius: 25px;
            font-family: 'Roboto Mono', monospace;
            color: #d63384;
            font-size: 1rem;
        }
        .test-file {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .test-suite {
            margin-left: 20px;
            border-left: 3px solid #3498db;
            padding-left: 15px;
        }
        .test-case {
            font-family: 'Roboto Mono', monospace;
            margin-left: 40px;
            padding: 5px 0;
        }
        .error {
            background-color: #ffeaea;
            border-left: 3px solid #e74c3c;
            padding: 10px;
            margin-top: 5px;
            font-size: 0.9em;
        }
        .summary {
            display: flex;
            justify-content: space-between;
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-label {
            font-size: 0.9em;
            color: #7f8c8d;
        }
        .summary-value {
            font-size: 1.2em;
            font-weight: 600;
        }
        .toc {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        .toc li {
            margin-bottom: 10px;
        }
        .toc a {
            color: #d63384;
            text-decoration: none;
            font-family: 'Roboto Mono', monospace;
            font-size: 0.85rem;
        }
        .toc a:hover {
            text-decoration: underline;
        }
        .date {
            font-size: 0.4em;
            color: #7f8c8d;
            font-weight: 400;
            font-family: 'Roboto Mono', monospace;
            color: #485051;
        }
    </style>
</head>
<body>
    <h1>
        Test Results for v${version}
        <span class="date">${formattedDate}</span>
    </h1>
    <div class="summary">
        <div class="summary-item">
            <div class="summary-label">Total Tests</div>
            <div class="summary-value">${results.numTotalTests}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Passed</div>
            <div class="summary-value pass">${results.numPassedTests}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Failed</div>
            <div class="summary-value fail">${results.numFailedTests}</div>
        </div>
    </div>
    <div class="toc">
        <h3>Files Tested:</h3>
        <ul>
`;

	// Generate table of contents
	results.testResults.forEach((testFile, index) => {
		const relativePath = path.relative(process.cwd(), testFile.name);
		const fileNumber = (index + 1).toString().padStart(2, '0');
		htmlContent += `            <li><a href="#file-${index}">${fileNumber} ${relativePath}</a></li>\n`;
	});

	htmlContent += `        </ul>
    </div>
`;

	results.testResults.forEach((testFile, index) => {
		const relativePath = path.relative(process.cwd(), testFile.name);
		const fileNumber = (index + 1).toString().padStart(2, '0');
		htmlContent += `<div id="file-${index}" class="test-file"><h3>${fileNumber} <span class="highlight">${relativePath}</span></h3>`;

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
