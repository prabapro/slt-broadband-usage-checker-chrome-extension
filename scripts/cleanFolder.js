import fs from 'fs-extra';
import path from 'path';

const folderToClean = process.argv[2];

if (!folderToClean) {
  console.error('Please specify a folder to clean');
  process.exit(1);
}

const folderPath = path.resolve(process.cwd(), folderToClean);

try {
  // Ensure the directory exists
  fs.ensureDirSync(folderPath);

  // Read the contents of the directory
  const files = fs.readdirSync(folderPath);

  // Remove each file/directory inside
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    fs.removeSync(filePath);
    console.log(`Removed: ${filePath}`);
  }

  console.log(`Cleaned folder: ${folderPath}`);
} catch (error) {
  console.error(`Error cleaning folder: ${error.message}`);
  process.exit(1);
}
