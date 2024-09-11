# SLT Broadband Usage Checker (Unofficial) Chrome Extension

[![Chrome Web Store Logo](available-in-chrome.png)](https://chromewebstore.google.com/detail/slt-broadband-usage-check/cdmfcngnfgnhddcheambbdjdjmelnoep)

## Overview

**Check SLT Broadband usage with a single click**

🔥 Easily check your SLT (Sri Lanka Telecom 🇱🇰) Broadband Usage with just one click.

### 🚀 Key Features:

✅ Secure Access: Uses your existing MySLT Portal authentication - no separate login required.

✅ Quick Access: View your data usage directly from your browser toolbar.

✅ Comprehensive Data: See usage details for Main Pack, Extra GB, Bonus Data, Add-Ons, and Free Data.

✅ Visual Progress Bars: Easily understand your data consumption with color-coded progress bars.

✅ Auto-Refresh: Data automatically refreshes every hour, or manually refresh anytime.

✅ Last Updated Info: Always know when your data was last refreshed.

✅ Easy Re-login: Quick access to the MySLT portal if re-authentication is needed.

✅ Support Access: Direct link to contact support for any issues or queries.

### 🔥 How It Works:

▪️ Install & Log In: Install the extension and log in to your MySLT account via the official MySLT Portal.

▪️ View Data Usage: Once you’re logged in, click the extension icon to see your current data usage.

▪️ Secure Access: The extension safely uses your active MySLT session to fetch the data—no need to enter your credentials in the extension.

▪️ Refresh Anytime: Hit the ‘Refresh’ button to get the latest data instantly.

▪️ Clear Data: Use the ‘Clear Data & Re-authenticate’ button to reset the data stored in the extension. This won’t log you out of the MySLT Portal.

### 🔐 Privacy & Security:

🛡️ This unofficial extension securely fetches data from SLT's official API using your existing MySLT Portal authentication.

🛡️ It does not store or have access to your login credentials.

🛡️ Your personal information is never transmitted or stored by the extension.

### ❗Note:

▪️ This is an unofficial extension and is not affiliated with, endorsed by, or connected to Sri Lanka Telecom PLC in any way. It is an independent tool created to enhance user experience.

▪️ Some promotional materials, including screenshots and store tiles, may display simulated data for demonstration purposes. Actual usage data will vary based on individual user accounts.

👨‍💻 Support: prabapro+chromeapps@gmail.com

---

# 👨‍💻 Development

> [!NOTE]
> Built with Vite and Vanilla JS

## 1. Project Setup

1. Create a new directory for your project and navigate into it:

   ```bash
   mkdir slt-bb-usage-checker
   cd slt-bb-usage-checker
   ```

2. Initialize a new Node.js project:

   ```bash
   npm init -y
   ```

3. Install Vite and other necessary dependencies:

   ```bash
   npm install --save-dev vite fs-extra
   ```

4. Create the project structure and empty files:

   ```bash
   # Create directories
   mkdir -p src/{background,content,popup,utils} public/images

   # Create empty files
   touch src/background/background.js \
         src/content/content.js \
         src/popup/{popup.html,popup.js,popup.css} \
         src/utils/helpers.js \
         public/manifest.json \
         build.js \
         vite.config.js

   # Create placeholder image files (you'll need to replace these with actual icons)
   touch public/images/{icon16.png,icon32.png,icon48.png,icon128.png}
   ```

5. Verify the project structure:
   ```bash
   tree
   ```
   You should see a structure similar to this:
   ```
   .
   ├── build.js
   ├── package.json
   ├── public
   │   ├── images
   │   │   ├── icon128.png
   │   │   ├── icon16.png
   │   │   ├── icon32.png
   │   │   └── icon48.png
   │   └── manifest.json
   ├── src
   │   ├── background
   │   │   └── background.js
   │   ├── content
   │   │   └── content.js
   │   ├── popup
   │   │   ├── popup.css
   │   │   ├── popup.html
   │   │   └── popup.js
   │   └── utils
   │       └── helpers.js
   └── vite.config.js
   ```

## 2. Project Structure

Create the following directory structure:

```
project-root/
├── src/
│   ├── background/
│   │   └── background.js
│   ├── content/
│   │   └── content.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── utils/
│       └── helpers.js
├── public/
│   ├── manifest.json
│   └── images/
│       └── (extension icons)
├── build.js
├── vite.config.js
└── package.json
```

## 3. Configuration Files

### 3.1 Update `package.json`:

```
{
	"name": "slt-bb-usage-checker",
	"private": true,
	"version": "0.0.0",
	"type": "module",
	...
}
```

### 3.2 Create `vite.config.js`:

```
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
   ...
});

```

### 3.3 Create `build.js`:

```
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
...
```

## 4. Extension Files

### 4.1 Create `manifest.json` in the `public` folder:

```
{
	"manifest_version": 3,
	"name": "SLT Broadband Usage Checker (Unofficial)",
	"version": "1.0.0",
	"description": "Check SLT Broadband usage with a single click",
	"permissions": ["storage", "webRequest", "scripting"],
	...
}

```

### 4.2 Implement `background.js`:

- Use ES module syntax
- Implement necessary background script functionality

### 4.3 Implement `content.js`:

- Avoid using ES module syntax (not supported in content scripts)
- Implement necessary content script functionality

### 4.4 Create `popup.html`:

- Structure the popup UI
- Link to `popup.css` and `popup.js`

### 4.5 Implement `popup.js`:

- Use ES module syntax
- Implement popup functionality

### 4.6 Style `popup.css`:

- Define styles for the popup UI

### 4.7 Create `helpers.js` in the `utils` folder:

- Implement shared utility functions

## 5. Building the Extension

> [!TIP]
> Update the version only on `package.json` - Vite will automatically update the version in `manifest.json` & `popup.html` during the build process.

1. Run the build command:
   ```bash
   npm run build
   ```
2. Verify that the `dist` folder contains the correct structure:
   ```
   dist/
   ├── images/
   ├── assets/
   ├── background.js
   ├── content.js
   ├── manifest.json
   ├── popup.css
   ├── popup.html
   └── popup.js
   ```

## 6. Loading the Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `dist` folder from your project
4. Verify that the extension loads without errors

## 7. Development Workflow

1. Make changes to your source files in the `src` directory
2. Run `npm run build` to rebuild the extension
3. In Chrome, go to `chrome://extensions` and click the refresh icon on your extension to reload it
4. Test the changes in the browser

## 8. Troubleshooting

1. If the popup doesn't display correctly, check the console for errors
2. Ensure all paths in `manifest.json` are correct
3. Verify that `content.js` doesn't use ES module syntax
4. Check that all necessary files are present in the `dist` folder after building

## 9. Best Practices

1. Use ES module syntax in all files except `content.js`
2. Update the version in `package.json` - Vite will automatically update the version in `manifest.json` & `popup.html` during the build process.
3. Keep the build script updated if you add new files or change the project structure
4. Regularly test the extension in Chrome to catch any issues early
